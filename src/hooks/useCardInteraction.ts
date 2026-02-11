import { CARD_HEIGHT, HAND_ZONE_HEIGHT } from "@/constants/dimensions";
import {
  FLICK_IMPULSE_SCALE,
  VELOCITY_SAMPLES,
} from "@/constants/physics";
import { isCardBlockedByOthers } from "@/lib/cardOverlapCheck";
import { averageVelocity, clampVelocity } from "@/lib/mathUtils";
import { bumpZOrder, calculateStackY } from "@/lib/rigidBodyRegistry";
import { useDragStore } from "@/stores/useDragStore";
import { useGameStore } from "@/stores/useGameStore";
import { useToastStore } from "@/stores/useToastStore";
import type { RapierRigidBody } from "@react-three/rapier";
import { useCallback, useRef } from "react";

interface PointerSample {
  x: number;
  z: number;
  time: number;
}

export function useCardInteraction(
  cardId: string,
  rigidBodyRef: React.RefObject<RapierRigidBody | null>,
  screenToWorld: (sx: number, sy: number) => [number, number, number],
) {
  const pointerSamples = useRef<PointerSample[]>([]);
  const isDraggingThis = useRef(false);

  const handlePointerDown = useCallback(
    (e: { stopPropagation: () => void; nativeEvent: PointerEvent }) => {
      e.stopPropagation();

      // Block interaction if card is covered
      if (isCardBlockedByOthers(cardId)) {
        useToastStore
          .getState()
          .addToast("Can't interact — card is covered by another card");
        return;
      }

      const card = useGameStore.getState().tableCards.get(cardId);
      if (!card) return;

      isDraggingThis.current = true;
      pointerSamples.current = [];

      const rb = rigidBodyRef.current;
      if (rb) {
        rb.setBodyType(2, true); // KinematicPositionBased
      }

      useDragStore.getState().startDrag(card, "table");

      const onMove = (moveEvent: PointerEvent) => {
        if (!isDraggingThis.current) return;

        const store = useDragStore.getState();
        store.updateCursorScreen(moveEvent.clientX, moveEvent.clientY);

        const isInHandZone =
          moveEvent.clientY > window.innerHeight - HAND_ZONE_HEIGHT;
        store.setInHandZone(isInHandZone);

        const [wx, wy, wz] = screenToWorld(moveEvent.clientX, moveEvent.clientY);
        store.updateCursorWorld([wx, wy, wz]);

        const body = rigidBodyRef.current;
        if (body && !isInHandZone) {
          body.setNextKinematicTranslation({ x: wx, y: wy + 0.3, z: wz });
        }

        if (!isInHandZone) {
          const samples = pointerSamples.current;
          samples.push({ x: wx, z: wz, time: Date.now() });
          if (samples.length > VELOCITY_SAMPLES) {
            samples.shift();
          }
        }
      };

      const onUp = (upEvent: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        if (!isDraggingThis.current) return;
        isDraggingThis.current = false;

        const isInHandZone =
          upEvent.clientY > window.innerHeight - HAND_ZONE_HEIGHT;

        if (isInHandZone) {
          useGameStore.getState().pickUpToHand(cardId);
        } else {
          // Bump z-order so this card is visually on top of anything it lands on
          bumpZOrder(cardId);

          const body = rigidBodyRef.current;
          if (body) {
            const [vx, vz] = clampVelocity(
              ...averageVelocity(pointerSamples.current),
            );

            if (Math.abs(vx) > 0.1 || Math.abs(vz) > 0.1) {
              // Flick — use dynamic physics for sliding
              body.setBodyType(0, true);
              body.applyImpulse(
                {
                  x: vx * FLICK_IMPULSE_SCALE,
                  y: 0,
                  z: vz * FLICK_IMPULSE_SCALE,
                },
                true,
              );
            } else {
              // Gentle drop — snap to correct stack height immediately (stay kinematic)
              const pos = body.translation();
              const settleY = calculateStackY(cardId, pos.x, pos.z);
              body.setTranslation(
                { x: pos.x, y: Math.max(settleY, CARD_HEIGHT / 2), z: pos.z },
                true,
              );
              body.setLinvel({ x: 0, y: 0, z: 0 }, true);
              body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
          }
        }

        useDragStore.getState().endDrag();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [cardId, rigidBodyRef, screenToWorld],
  );

  const handleDoubleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      if (isCardBlockedByOthers(cardId)) {
        useToastStore
          .getState()
          .addToast("Can't flip — card is covered by another card");
        return;
      }
      useGameStore.getState().flipCard(cardId);
    },
    [cardId],
  );

  return { handlePointerDown, handleDoubleClick };
}
