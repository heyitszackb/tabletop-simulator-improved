import type { Card } from "@/types/card";
import { create } from "zustand";

export type DragSource = "table" | "hand";

interface DragState {
  isDragging: boolean;
  dragSource: DragSource | null;
  draggedCard: Card | null;
  cursorScreenPos: { x: number; y: number };
  cursorWorldPos: [number, number, number];
  inHandZone: boolean;

  startDrag: (card: Card, source: DragSource) => void;
  updateCursorScreen: (x: number, y: number) => void;
  updateCursorWorld: (pos: [number, number, number]) => void;
  setInHandZone: (value: boolean) => void;
  endDrag: () => void;
}

export const useDragStore = create<DragState>((set) => ({
  isDragging: false,
  dragSource: null,
  draggedCard: null,
  cursorScreenPos: { x: 0, y: 0 },
  cursorWorldPos: [0, 0, 0],
  inHandZone: false,

  startDrag: (card, source) =>
    set({
      isDragging: true,
      dragSource: source,
      draggedCard: card,
      inHandZone: false,
    }),

  updateCursorScreen: (x, y) =>
    set({ cursorScreenPos: { x, y } }),

  updateCursorWorld: (pos) =>
    set({ cursorWorldPos: pos }),

  setInHandZone: (value) =>
    set({ inHandZone: value }),

  endDrag: () =>
    set({
      isDragging: false,
      dragSource: null,
      draggedCard: null,
      inHandZone: false,
    }),
}));
