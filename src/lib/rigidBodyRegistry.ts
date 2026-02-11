import { CARD_DEPTH, CARD_HEIGHT, CARD_STACK_GAP, CARD_WIDTH } from "@/constants/dimensions";
import type { RapierRigidBody } from "@react-three/rapier";

const registry = new Map<string, RapierRigidBody>();
const zOrderMap = new Map<string, number>();
let nextZOrder = 0;

export function registerRigidBody(id: string, rb: RapierRigidBody) {
  registry.set(id, rb);
  // Assign z-order on first registration if not already set
  if (!zOrderMap.has(id)) {
    zOrderMap.set(id, nextZOrder++);
  }
}

export function unregisterRigidBody(id: string) {
  registry.delete(id);
  zOrderMap.delete(id);
}

export function getRigidBody(id: string) {
  return registry.get(id);
}

export function getAllRigidBodies() {
  return registry;
}

/** Bump a card to the top of the z-order (most recently moved = on top). */
export function bumpZOrder(id: string) {
  zOrderMap.set(id, nextZOrder++);
}

export function getZOrder(id: string): number {
  return zOrderMap.get(id) ?? 0;
}

/**
 * Calculate the Y position a card should settle at.
 *
 * Finds the HIGHEST overlapping card with a lower z-order (i.e. below us)
 * and places this card one CARD_STACK_GAP above it. This correctly handles
 * transitive chains like A→B→C where C only overlaps B.
 */
export function calculateStackY(
  cardId: string,
  x: number,
  z: number,
): number {
  const halfW = CARD_WIDTH / 2 + 0.05;
  const halfD = CARD_DEPTH / 2 + 0.05;
  const myOrder = getZOrder(cardId);
  let maxYBelow = -1; // sentinel: no cards found

  for (const [id, rb] of registry) {
    if (id === cardId) continue;
    const pos = rb.translation();
    const dx = Math.abs(pos.x - x);
    const dz = Math.abs(pos.z - z);

    // Find the highest overlapping card with lower z-order
    if (dx < halfW && dz < halfD && getZOrder(id) < myOrder) {
      if (pos.y > maxYBelow) {
        maxYBelow = pos.y;
      }
    }
  }

  if (maxYBelow < 0) {
    // No cards below — sit on table surface
    return CARD_HEIGHT / 2;
  }

  // One stack gap above the highest card below us
  return maxYBelow + CARD_STACK_GAP;
}
