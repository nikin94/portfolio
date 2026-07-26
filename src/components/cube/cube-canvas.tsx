import { PerformanceMonitor, TrackballControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

import { CubeModel } from "./cube-scene";

/**
 * Fires `onFirstFrame` exactly once, on the first *rendered* frame. This is the
 * only reliable "the cube is actually on screen now" signal: `onCreated` fires
 * when the renderer exists but before anything is drawn, so revealing the
 * canvas on it exposes a blank, still-clearing buffer (the white flash) a beat
 * before the cube paints.
 */
const FirstFrameSignal = ({ onFirstFrame }: { onFirstFrame: () => void }) => {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onFirstFrame();
  });
  return null;
};

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
 * - `onFirstFrame` reports the first *painted* frame so the host cross-fades the
 *   fallback out only once the cube is truly visible.
 * - The clear colour is forced fully transparent so the canvas can never flash
 *   white/black behind the (alpha) scene.
 */
const CubeCanvas = ({
  active,
  onFirstFrame,
}: {
  active: boolean;
  onFirstFrame?: () => void;
}) => {
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
      {onFirstFrame && <FirstFrameSignal onFirstFrame={onFirstFrame} />}
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
