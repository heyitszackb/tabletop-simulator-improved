import { useDragStore } from "@/stores/useDragStore";
import { OrbitControls } from "@react-three/drei";

export function CameraController() {
  const isDragging = useDragStore((s) => s.isDragging);

  return (
    <OrbitControls
      makeDefault
      enabled={!isDragging}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={3}
      maxDistance={15}
      enablePan={true}
      panSpeed={0.5}
    />
  );
}
