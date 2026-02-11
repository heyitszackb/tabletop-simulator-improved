import {
  TABLE_DEPTH,
  TABLE_HEIGHT,
  TABLE_WIDTH,
  TABLE_Y,
} from "@/constants/dimensions";
import {
  CuboidCollider,
  RigidBody,
  interactionGroups,
} from "@react-three/rapier";

// Table: member of group 0, collides with group 1 (cards)
const TABLE_COLLISION_GROUPS = interactionGroups([0], [1]);

export function Table() {
  return (
    <RigidBody type="fixed" position={[0, TABLE_Y, 0]}>
      <CuboidCollider
        args={[TABLE_WIDTH / 2, TABLE_HEIGHT / 2, TABLE_DEPTH / 2]}
        collisionGroups={TABLE_COLLISION_GROUPS}
      />
      <mesh receiveShadow>
        <boxGeometry args={[TABLE_WIDTH, TABLE_HEIGHT, TABLE_DEPTH]} />
        <meshStandardMaterial color="#1a6b3c" />
      </mesh>
    </RigidBody>
  );
}
