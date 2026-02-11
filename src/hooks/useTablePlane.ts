import { screenToWorldOnTable } from "@/lib/screenToWorld";
import { useCallback } from "react";

export function useTablePlane() {
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): [number, number, number] => {
      return screenToWorldOnTable(screenX, screenY);
    },
    [],
  );

  return { screenToWorld };
}
