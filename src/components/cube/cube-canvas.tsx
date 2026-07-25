import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import { CubeModel } from "./cube-scene";

/**
 * WebGL layer for the Rubik's cube. Lazy-loaded (this is where three.js lands
 * in the bundle) so it never touches the first paint.
 *
 * - `active` gates the render loop: off-screen → `frameloop="never"`, so it
 *   stops spending GPU/battery when scrolled away.
 * - `PerformanceMonitor` lowers the pixel ratio if the framerate dips, keeping
 *   it smooth on weaker GPUs and high-DPR screens.
 */
const CubeCanvas = ({ active }: { active: boolean }) => {
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [4, 4, 5.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(2)}
      />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-5, -2, -4]} intensity={0.35} />
      <CubeModel />
      <OrbitControls
        enabled={active}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
};

export default CubeCanvas;
