import { FLICK_MAX_SPEED } from "@/constants/physics";

export function clampVelocity(vx: number, vz: number): [number, number] {
  const speed = Math.sqrt(vx * vx + vz * vz);
  if (speed > FLICK_MAX_SPEED) {
    const scale = FLICK_MAX_SPEED / speed;
    return [vx * scale, vz * scale];
  }
  return [vx, vz];
}

export function averageVelocity(
  positions: Array<{ x: number; z: number; time: number }>,
): [number, number] {
  if (positions.length < 2) return [0, 0];

  const last = positions[positions.length - 1];
  const first = positions[0];
  const dt = (last.time - first.time) / 1000;

  if (dt < 0.001) return [0, 0];

  return [(last.x - first.x) / dt, (last.z - first.z) / dt];
}
