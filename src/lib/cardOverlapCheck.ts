import { CARD_DEPTH, CARD_WIDTH } from "@/constants/dimensions";
import { getAllRigidBodies, getZOrder } from "@/lib/rigidBodyRegistry";

/**
 * Returns true if any other card overlaps this card horizontally
 * and has a higher z-order (was placed/moved more recently = on top).
 */
export function isCardBlockedByOthers(cardId: string): boolean {
  const all = getAllRigidBodies();
  const target = all.get(cardId);
  if (!target) return false;

  const tPos = target.translation();
  const targetOrder = getZOrder(cardId);
  const halfW = CARD_WIDTH / 2 + 0.05;
  const halfD = CARD_DEPTH / 2 + 0.05;

  for (const [id, rb] of all) {
    if (id === cardId) continue;
    const pos = rb.translation();

    const dx = Math.abs(pos.x - tPos.x);
    const dz = Math.abs(pos.z - tPos.z);

    if (dx < halfW && dz < halfD && getZOrder(id) > targetOrder) {
      return true;
    }
  }

  return false;
}
