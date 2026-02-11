import {
  CARD_DEPTH,
  CARD_HEIGHT,
  CARD_WIDTH,
} from "@/constants/dimensions";
import { generateCardBackTexture } from "@/lib/cardTextureGenerator";
import type { Deck } from "@/types/deck";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import { MeshStandardMaterial } from "three";

interface Deck3DProps {
  deck: Deck;
}

export function Deck3D({ deck }: Deck3DProps) {
  const stackHeight = Math.max(CARD_HEIGHT, deck.cards.length * CARD_HEIGHT);
  const backTexture = useMemo(() => generateCardBackTexture(), []);

  const topMaterial = useMemo(
    () => new MeshStandardMaterial({ map: backTexture }),
    [backTexture],
  );

  if (deck.cards.length === 0) return null;

  return (
    <RigidBody type="fixed" position={deck.position}>
      <CuboidCollider args={[CARD_WIDTH / 2, stackHeight / 2, CARD_DEPTH / 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CARD_WIDTH, stackHeight, CARD_DEPTH]} />
        <meshStandardMaterial attach="material-0" color="#ffffff" />
        <meshStandardMaterial attach="material-1" color="#ffffff" />
        {/* top - card back */}
        <primitive object={topMaterial} attach="material-2" />
        <meshStandardMaterial attach="material-3" color="#1E3A5F" />
        <meshStandardMaterial attach="material-4" color="#ffffff" />
        <meshStandardMaterial attach="material-5" color="#ffffff" />
      </mesh>
    </RigidBody>
  );
}
