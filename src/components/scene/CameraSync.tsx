import { setCamera } from "@/lib/screenToWorld";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function CameraSync() {
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    setCamera(camera);
  }, [camera]);

  return null;
}
