import {
  CARD_DEPTH,
  CARD_HEIGHT,
  CARD_WIDTH,
} from "@/constants/dimensions";
import { generateCardBackTexture } from "@/lib/cardTextureGenerator";
import { useDragStore } from "@/stores/useDragStore";
import { useMemo } from "react";
import { MeshStandardMaterial } from "three";

export function GhostCard3D() {
  const isDragging = useDragStore((s) => s.isDragging);
  const dragSource = useDragStore((s) => s.dragSource);
  const worldPos = useDragStore((s) => s.cursorWorldPos);
  const inHandZone = useDragStore((s) => s.inHandZone);

  // Only show ghost when dragging from hand and cursor is over the table
  const showGhost = isDragging && dragSource === "hand" && !inHandZone;

  const ghostMaterial = useMemo(() => {
    const backTex = generateCardBackTexture();
    return new MeshStandardMaterial({
      map: backTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
  }, []);

  const whiteSideMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    [],
  );

  const materials = useMemo(
    () => [
      whiteSideMaterial,
      whiteSideMaterial,
      ghostMaterial, // top — card back
      whiteSideMaterial,
      whiteSideMaterial,
      whiteSideMaterial,
    ],
    [ghostMaterial, whiteSideMaterial],
  );

  if (!showGhost) return null;

  return (
    <mesh
      position={[worldPos[0], 0.05, worldPos[2]]}
      material={materials}
    >
      <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT * 2, CARD_DEPTH]} />
    </mesh>
  );
}
