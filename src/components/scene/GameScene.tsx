import { Card3D } from "@/components/cards/Card3D";
import { Deck3D } from "@/components/cards/Deck3D";
import { GhostCard3D } from "@/components/cards/GhostCard3D";
import { CameraController } from "@/components/scene/CameraController";
import { CameraSync } from "@/components/scene/CameraSync";
import { Lighting } from "@/components/scene/Lighting";
import { Table } from "@/components/scene/Table";
import { GRAVITY } from "@/constants/physics";
import { useGameStore } from "@/stores/useGameStore";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

function SceneContent() {
  const tableCards = useGameStore((s) => s.tableCards);
  const decks = useGameStore((s) => s.decks);

  return (
    <Physics gravity={GRAVITY}>
      <CameraSync />
      <Table />
      <Lighting />
      <CameraController />

      {Array.from(decks.values()).map((deck) => (
        <Deck3D key={deck.id} deck={deck} />
      ))}

      {Array.from(tableCards.values()).map((card) => (
        <Card3D key={card.id} card={card} />
      ))}

      <GhostCard3D />
    </Physics>
  );
}

export function GameScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 6], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <SceneContent />
    </Canvas>
  );
}
