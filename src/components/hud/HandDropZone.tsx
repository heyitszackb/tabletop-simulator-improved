import { HAND_ZONE_HEIGHT } from "@/constants/dimensions";
import { useDragStore } from "@/stores/useDragStore";

export function HandDropZone() {
  const isDragging = useDragStore((s) => s.isDragging);
  const inHandZone = useDragStore((s) => s.inHandZone);
  const dragSource = useDragStore((s) => s.dragSource);

  // Only show when dragging from table (dropping into hand)
  if (!isDragging || dragSource !== "table") return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-center transition-all duration-150 pointer-events-none"
      style={{ height: HAND_ZONE_HEIGHT }}
    >
      <div
        className={`absolute inset-0 transition-all duration-150 ${
          inHandZone
            ? "bg-blue-500/25 border-t-2 border-blue-400"
            : "bg-white/8 border-t border-white/20"
        }`}
      />
      <span
        className={`relative text-xs font-medium transition-all duration-150 ${
          inHandZone ? "text-blue-300" : "text-white/40"
        }`}
      >
        {inHandZone ? "Release to add to hand" : "Drag here to pick up"}
      </span>
    </div>
  );
}
