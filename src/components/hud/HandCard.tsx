import { SUIT_COLORS, SUIT_SYMBOLS } from "@/constants/cards";
import { HAND_ZONE_HEIGHT } from "@/constants/dimensions";
import { screenToWorldOnTable } from "@/lib/screenToWorld";
import { useDragStore } from "@/stores/useDragStore";
import type { Card } from "@/types/card";
import { motion } from "motion/react";
import { useCallback, useRef } from "react";

interface HandCardProps {
  card: Card;
  index: number;
  total: number;
}

export function HandCard({ card, index, total }: HandCardProps) {
  const isDragging = useRef(false);
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  const maxAngle = Math.min(total * 3, 30);
  const angle = total > 1 ? -maxAngle / 2 + (index / (total - 1)) * maxAngle : 0;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      isDragging.current = true;

      useDragStore.getState().startDrag(card, "hand");
      useDragStore.getState().updateCursorScreen(e.clientX, e.clientY);
      useDragStore.getState().setInHandZone(true);

      const worldPos = screenToWorldOnTable(e.clientX, e.clientY);
      useDragStore.getState().updateCursorWorld(worldPos);

      const onMove = (moveEvent: PointerEvent) => {
        if (!isDragging.current) return;

        const store = useDragStore.getState();
        store.updateCursorScreen(moveEvent.clientX, moveEvent.clientY);

        const isInHandZone =
          moveEvent.clientY > window.innerHeight - HAND_ZONE_HEIGHT;
        store.setInHandZone(isInHandZone);

        // Always update world pos for ghost card
        const wp = screenToWorldOnTable(moveEvent.clientX, moveEvent.clientY);
        store.updateCursorWorld(wp);
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        isDragging.current = false;
        // Drop logic handled by App level
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [card],
  );

  return (
    <motion.div
      className="relative flex-shrink-0 w-16 h-24 rounded-md border border-gray-300 bg-white shadow-lg cursor-grab select-none"
      style={{
        rotate: `${angle}deg`,
        transformOrigin: "bottom center",
      }}
      whileHover={{ y: -16, scale: 1.08, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onPointerDown={handlePointerDown}
    >
      <div className="absolute top-1 left-1.5 text-xs font-bold leading-none" style={{ color }}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center text-2xl"
        style={{ color }}
      >
        {symbol}
      </div>
    </motion.div>
  );
}
