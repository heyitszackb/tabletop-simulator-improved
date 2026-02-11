import { CARD_DEPTH, CARD_HEIGHT, CARD_WIDTH } from "@/constants/dimensions";
import { getAllRigidBodies } from "@/lib/rigidBodyRegistry";

/**
 * Returns true if any other card is sitting on top of the given card,
 * meaning we should block flipping to avoid physics explosions.
 */
export function isCardBlockedByOthers(cardId: string): boolean {
  const all = getAllRigidBodies();
  const target = all.get(cardId);
  if (!target) return false;

  const tPos = target.translation();
  const halfW = CARD_WIDTH / 2 + 0.05; // small margin
  const halfD = CARD_DEPTH / 2 + 0.05;
  const minAbove = CARD_HEIGHT; // must be at least this much above

  for (const [id, rb] of all) {
    if (id === cardId) continue;
    const pos = rb.translation();

    // Check horizontal overlap
    const dx = Math.abs(pos.x - tPos.x);
    const dz = Math.abs(pos.z - tPos.z);
    if (dx < halfW && dz < halfD && pos.y > tPos.y + minAbove) {
      return true;
    }
  }

  return false;
}
