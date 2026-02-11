import { HandCard } from "@/components/hud/HandCard";
import { HAND_ZONE_HEIGHT } from "@/constants/dimensions";
import { useGameStore } from "@/stores/useGameStore";

export function Hand() {
  const hand = useGameStore((s) => s.hand);

  if (hand.length === 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 pb-4 pointer-events-auto"
      style={{ height: HAND_ZONE_HEIGHT }}
    >
      {hand.map((card, i) => (
        <HandCard
          key={card.id}
          card={card}
          index={i}
          total={hand.length}
        />
      ))}
    </div>
  );
}
