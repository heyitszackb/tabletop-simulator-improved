import {
  CARD_DEPTH,
  CARD_HEIGHT,
  CARD_WIDTH,
  FLIP_DURATION,
  FLIP_LIFT_HEIGHT,
} from "@/constants/dimensions";
import {
  CARD_ANGULAR_DAMPING,
  CARD_FRICTION,
  CARD_LINEAR_DAMPING,
  CARD_MASS,
  CARD_RESTITUTION,
} from "@/constants/physics";
import { useCardInteraction } from "@/hooks/useCardInteraction";
import { useCardTexture } from "@/hooks/useCardTexture";
import { useTablePlane } from "@/hooks/useTablePlane";
import {
  calculateStackY,
  registerRigidBody,
  unregisterRigidBody,
} from "@/lib/rigidBodyRegistry";
import { useDragStore } from "@/stores/useDragStore";
import type { TableCard } from "@/types/card";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  interactionGroups,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Euler, Mesh, MeshStandardMaterial, Quaternion } from "three";

const whiteMaterial = new MeshStandardMaterial({ color: "#ffffff" });

// Cards: member of group 1, collides with group 0 (table only, not other cards)
const CARD_COLLISION_GROUPS = interactionGroups([1], [0]);

type FlipPhase = "idle" | "lift" | "rotate" | "lower";

interface Card3DProps {
  card: TableCard;
}

export function Card3D({ card }: Card3DProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const { faceTexture, backTexture } = useCardTexture(card.suit, card.rank);
  const { screenToWorld } = useTablePlane();
  const { handlePointerDown, handleDoubleClick } = useCardInteraction(
    card.id,
    rigidBodyRef,
    screenToWorld,
  );

  // Use refs for initial position/rotation so RigidBody doesn't teleport on re-render
  const initialPosition = useRef(card.position);
  const initialRotation = useRef(card.rotation);

  // Flip animation state
  const flipPhase = useRef<FlipPhase>("idle");
  const flipProgress = useRef(0);
  const flipStartY = useRef(0);
  const flipStartRotX = useRef(0);
  const flipTargetRotX = useRef(0);

  // Track whether we're dragging this card (to skip settle logic)
  const isDraggingRef = useRef(false);
  // Track if card has settled after drop
  const hasSettled = useRef(false);

  // Register rigid body
  useEffect(() => {
    const rb = rigidBodyRef.current;
    if (rb) registerRigidBody(card.id, rb);
    return () => unregisterRigidBody(card.id);
  }, [card.id]);

  // Start flip animation when faceUp changes
  const prevFaceUp = useRef(card.faceUp);
  useEffect(() => {
    if (prevFaceUp.current === card.faceUp) return;
    prevFaceUp.current = card.faceUp;

    const rb = rigidBodyRef.current;
    if (!rb || flipPhase.current !== "idle") return;

    const pos = rb.translation();
    flipStartY.current = pos.y;
    flipProgress.current = 0;

    const rot = rb.rotation();
    const euler = new Euler().setFromQuaternion(
      new Quaternion(rot.x, rot.y, rot.z, rot.w),
    );
    flipStartRotX.current = euler.x;
    // Always rotate +180 to flip from current orientation
    flipTargetRotX.current = euler.x + Math.PI;

    rb.setBodyType(2, true);
    flipPhase.current = "lift";
  }, [card.faceUp]);

  // Drive flip animation + settle-to-stack each frame
  useFrame((_, delta) => {
    const rb = rigidBodyRef.current;
    if (!rb) return;

    // --- Flip animation ---
    if (flipPhase.current !== "idle") {
      const phaseDuration = FLIP_DURATION / 3;
      flipProgress.current += delta;
      const t = Math.min(flipProgress.current / phaseDuration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

      const pos = rb.translation();

      if (flipPhase.current === "lift") {
        const targetY = flipStartY.current + FLIP_LIFT_HEIGHT;
        const y = flipStartY.current + (targetY - flipStartY.current) * ease;
        rb.setNextKinematicTranslation({ x: pos.x, y, z: pos.z });
        if (t >= 1) {
          flipPhase.current = "rotate";
          flipProgress.current = 0;
        }
      } else if (flipPhase.current === "rotate") {
        const currentRotX =
          flipStartRotX.current +
          (flipTargetRotX.current - flipStartRotX.current) * ease;
        const quat = new Quaternion().setFromEuler(
          new Euler(currentRotX, 0, 0),
        );
        rb.setNextKinematicRotation({
          x: quat.x,
          y: quat.y,
          z: quat.z,
          w: quat.w,
        });
        if (t >= 1) {
          flipPhase.current = "lower";
          flipProgress.current = 0;
        }
      } else if (flipPhase.current === "lower") {
        const liftedY = flipStartY.current + FLIP_LIFT_HEIGHT;
        const targetY = flipStartY.current;
        const y = liftedY + (targetY - liftedY) * ease;
        rb.setNextKinematicTranslation({ x: pos.x, y, z: pos.z });
        if (t >= 1) {
          flipPhase.current = "idle";
          hasSettled.current = true;
          // Stay kinematic — no gravity drift
          rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      }
      return;
    }

    // --- Settle to stack height ---
    if (isDraggingRef.current || hasSettled.current) return;
    if (rb.bodyType() !== 0) return; // only when dynamic

    const vel = rb.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
    if (speed > 0.05) return; // still moving

    const pos = rb.translation();
    const targetY = calculateStackY(card.id, pos.x, pos.z);

    // Switch to kinematic and snap to stack height — prevents gravity drift
    rb.setBodyType(2, true);
    rb.setTranslation({ x: pos.x, y: targetY, z: pos.z }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    hasSettled.current = true;
  });

  // Hide 3D card when it's being dragged into the hand zone
  const isDraggingThisCard = useDragStore(
    (s) =>
      s.isDragging &&
      s.draggedCard?.id === card.id &&
      s.dragSource === "table",
  );
  const inHandZone = useDragStore((s) => s.inHandZone);
  const hideCard = isDraggingThisCard && inHandZone;

  // Track drag state for settle logic
  useEffect(() => {
    isDraggingRef.current = isDraggingThisCard;
    if (isDraggingThisCard) {
      hasSettled.current = false;
    }
  }, [isDraggingThisCard]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = !hideCard;
    }
  }, [hideCard]);

  const isFlipping = flipPhase.current !== "idle";

  // Materials are STATIC — physical body rotation determines which face is up.
  // Default (unrotated): +y = back, -y = face.
  // After 180° X rotation: +y = face, -y = back.
  const materials = useMemo(
    () => [
      whiteMaterial,
      whiteMaterial,
      new MeshStandardMaterial({ map: backTexture }), // +y top
      new MeshStandardMaterial({ map: faceTexture }), // -y bottom
      whiteMaterial,
      whiteMaterial,
    ],
    [faceTexture, backTexture],
  );

  const onDoubleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      if (isFlipping) return;
      handleDoubleClick(e);
    },
    [isFlipping, handleDoubleClick],
  );

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPosition.current}
      rotation={initialRotation.current}
      type="dynamic"
      mass={CARD_MASS}
      linearDamping={CARD_LINEAR_DAMPING}
      angularDamping={CARD_ANGULAR_DAMPING}
      restitution={CARD_RESTITUTION}
      friction={CARD_FRICTION}
    >
      <CuboidCollider
        args={[CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_DEPTH / 2]}
        collisionGroups={CARD_COLLISION_GROUPS}
      />
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        material={materials}
        onPointerDown={handlePointerDown}
        onDoubleClick={onDoubleClick}
      >
        <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} />
      </mesh>
    </RigidBody>
  );
}
