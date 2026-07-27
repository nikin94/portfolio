import { PerformanceMonitor, TrackballControls } from "@react-three/drei";
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
 * - `TrackballControls` (not `OrbitControls`) so the cube rotates freely in
 *   every axis. OrbitControls clamps the vertical/polar angle to 180° and pins
 *   the world "up"; trackball has no such limit. The auto-spin is on the model.
 * - The clear colour is forced fully transparent so the canvas can never flash
 *   white/black behind the (alpha) scene while the cube fades/scales in.
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
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(2)}
      />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-5, -2, -4]} intensity={0.35} />
      <CubeModel />
      <TrackballControls enabled={active} noZoom noPan rotateSpeed={3} />
    </Canvas>
  );
};

export default CubeCanvas;
