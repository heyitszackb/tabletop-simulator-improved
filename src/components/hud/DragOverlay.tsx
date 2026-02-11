import { SUIT_COLORS, SUIT_SYMBOLS } from "@/constants/cards";
import { useDragStore } from "@/stores/useDragStore";

function FaceUpCard({ rank, symbol, color }: { rank: string; symbol: string; color: string }) {
  return (
    <div className="w-16 h-24 rounded-md border border-gray-300 bg-white shadow-2xl opacity-90">
      <div className="absolute top-1 left-1.5 text-xs font-bold leading-none" style={{ color }}>
        <div>{rank}</div>
        <div>{symbol}</div>
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center text-2xl"
        style={{ color }}
      >
        {symbol}
      </div>
    </div>
  );
}

export function DragOverlay() {
  const isDragging = useDragStore((s) => s.isDragging);
  const draggedCard = useDragStore((s) => s.draggedCard);
  const cursorPos = useDragStore((s) => s.cursorScreenPos);
  const inHandZone = useDragStore((s) => s.inHandZone);

  if (!isDragging || !draggedCard) return null;

  const color = SUIT_COLORS[draggedCard.suit];
  const symbol = SUIT_SYMBOLS[draggedCard.suit];

  // Only show overlay when a card is heading toward the hand:
  //   Table → hand zone: face-up preview (picking up to hand)
  //   Hand → hand zone: face-up preview (cancelling drag)
  // All other cases: no overlay (3D card / ghost handles it)
  if (!inHandZone) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: cursorPos.x - 32,
        top: cursorPos.y - 48,
      }}
    >
      <FaceUpCard rank={draggedCard.rank} symbol={symbol} color={color} />
    </div>
  );
}
