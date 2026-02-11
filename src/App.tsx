import { GameScene } from "@/components/scene/GameScene";
import { HUD } from "@/components/hud/HUD";
import { HAND_ZONE_HEIGHT } from "@/constants/dimensions";
import { bumpZOrder } from "@/lib/rigidBodyRegistry";
import { screenToWorldOnTable } from "@/lib/screenToWorld";
import { useDragStore } from "@/stores/useDragStore";
import { useGameStore } from "@/stores/useGameStore";
import { useCallback, useEffect } from "react";

export default function App() {
  const handleGlobalPointerUp = useCallback((e: PointerEvent) => {
    const dragState = useDragStore.getState();
    if (!dragState.isDragging || !dragState.draggedCard) return;

    const inHandZone = e.clientY > window.innerHeight - HAND_ZONE_HEIGHT;

    if (dragState.dragSource === "hand" && !inHandZone) {
      // Hand → table: place face-down
      const card = dragState.draggedCard;
      const worldPos = screenToWorldOnTable(e.clientX, e.clientY);
      useDragStore.getState().endDrag();
      useGameStore.getState().removeFromHand(card.id);
      useGameStore.getState().placeCardOnTable(
        { ...card, faceUp: false },
        [worldPos[0], 0.5, worldPos[2]], // Start elevated, settle logic will snap to correct height
      );
      // Bump z-order so hand card is visually on top
      bumpZOrder(card.id);
    } else if (dragState.dragSource === "hand" && inHandZone) {
      // Dropped back in hand zone — cancel
      useDragStore.getState().endDrag();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useDragStore.getState().endDrag();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [handleGlobalPointerUp]);

  return (
    <div className="relative w-full h-full">
      <GameScene />
      <HUD />
    </div>
  );
}
