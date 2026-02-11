import type { Camera } from "three";
import { Plane, Raycaster, Vector2, Vector3 } from "three";

const tablePlane = new Plane(new Vector3(0, 1, 0), 0);
const raycaster = new Raycaster();
const screenCoord = new Vector2();
const intersection = new Vector3();

let _camera: Camera | null = null;

export function setCamera(camera: Camera) {
  _camera = camera;
}

export function screenToWorldOnTable(
  screenX: number,
  screenY: number,
): [number, number, number] {
  if (!_camera) return [0, 0.05, 0];

  screenCoord.set(
    (screenX / window.innerWidth) * 2 - 1,
    -(screenY / window.innerHeight) * 2 + 1,
  );
  raycaster.setFromCamera(screenCoord, _camera);
  raycaster.ray.intersectPlane(tablePlane, intersection);
  return [intersection.x, 0.05, intersection.z];
}
