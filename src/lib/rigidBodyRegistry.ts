import { CARD_DEPTH, CARD_HEIGHT, CARD_WIDTH } from "@/constants/dimensions";
import type { RapierRigidBody } from "@react-three/rapier";

const registry = new Map<string, RapierRigidBody>();

export function registerRigidBody(id: string, rb: RapierRigidBody) {
  registry.set(id, rb);
}

export function unregisterRigidBody(id: string) {
  registry.delete(id);
}

export function getRigidBody(id: string) {
  return registry.get(id);
}

export function getAllRigidBodies() {
  return registry;
}

/**
 * Calculate the Y position a card should settle at based on
 * how many other cards overlap its x/z footprint beneath it.
 */
export function calculateStackY(
  cardId: string,
  x: number,
  z: number,
): number {
  const halfW = CARD_WIDTH / 2;
  const halfD = CARD_DEPTH / 2;
  let maxY = 0; // table surface

  for (const [id, rb] of registry) {
    if (id === cardId) continue;
    const pos = rb.translation();
    const dx = Math.abs(pos.x - x);
    const dz = Math.abs(pos.z - z);

    // Check if this card's footprint overlaps
    if (dx < halfW * 1.5 && dz < halfD * 1.5) {
      const topOfCard = pos.y + CARD_HEIGHT;
      if (topOfCard > maxY) {
        maxY = topOfCard;
      }
    }
  }

  return maxY + CARD_HEIGHT / 2;
}
