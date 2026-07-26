import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

/** Classic Rubik's colour scheme, one per outward-facing side. */
const COLORS = {
  right: "#c41e3a",
  left: "#ff5800",
  up: "#ffffff",
  down: "#ffd500",
  front: "#009b48",
  back: "#0046ad",
  body: "#0d0f12",
} as const;

const AXIS = [-1, 0, 1] as const;
/** Distance from a cubie's centre to its face. */
const HALF = 0.5;

type Sticker = {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
};

/** A sticker only exists on faces that sit on the cube's outer shell. */
const stickersFor = (x: number, y: number, z: number): Sticker[] => {
  const stickers: Sticker[] = [];
  if (x === 1)
    stickers.push({
      position: [HALF, 0, 0],
      rotation: [0, Math.PI / 2, 0],
      color: COLORS.right,
    });
  if (x === -1)
    stickers.push({
      position: [-HALF, 0, 0],
      rotation: [0, -Math.PI / 2, 0],
      color: COLORS.left,
    });
  if (y === 1)
    stickers.push({
      position: [0, HALF, 0],
      rotation: [-Math.PI / 2, 0, 0],
      color: COLORS.up,
    });
  if (y === -1)
    stickers.push({
      position: [0, -HALF, 0],
      rotation: [Math.PI / 2, 0, 0],
      color: COLORS.down,
    });
  if (z === 1)
    stickers.push({
      position: [0, 0, HALF],
      rotation: [0, 0, 0],
      color: COLORS.front,
    });
  if (z === -1)
    stickers.push({
      position: [0, 0, -HALF],
      rotation: [0, Math.PI, 0],
      color: COLORS.back,
    });
  return stickers;
};

const Cubie = ({
  position,
  stickers,
}: {
  position: [number, number, number];
  stickers: Sticker[];
}) => (
  <group position={position}>
    <RoundedBox args={[0.94, 0.94, 0.94]} radius={0.1} smoothness={3}>
      <meshStandardMaterial
        color={COLORS.body}
        roughness={0.55}
        metalness={0.1}
      />
    </RoundedBox>
    {stickers.map((sticker, i) => (
      <mesh
        // A cubie's stickers are positionally unique and never reorder.
        key={i}
        position={sticker.position}
        rotation={sticker.rotation}
      >
        <planeGeometry args={[0.78, 0.78]} />
        <meshStandardMaterial
          color={sticker.color}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
    ))}
  </group>
);

/**
 * The 3×3×3 cube. Plays a short scale-up entrance (grows from 60% to full size
 * over ~0.9s) as it first paints, then keeps a gentle auto-spin. Both live on
 * the model itself (its own group) rather than the camera controls, so
 * `TrackballControls` can orbit the cube freely in every direction — including a
 * full vertical flip — without a competing camera auto-orbit. Purely visual —
 * no layer-turn logic yet.
 */
export const CubeModel = () => {
  const group = useRef<Group>(null);
  const startedAt = useRef<number | null>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Scale-up entrance, timed from the first rendered frame (so it plays when
    // the cube actually appears, not while the loop is paused off-screen).
    const now = state.clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = now;
    const progress = Math.min((now - startedAt.current) / 0.9, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    g.scale.setScalar(0.6 + 0.4 * eased);

    // Continuous slow spin. Delta is clamped so resuming the render loop after
    // the hero scrolls back into view can't jump the cube by a large step.
    g.rotation.y += Math.min(delta, 0.1) * 0.3;
  });

  const cubies = useMemo(() => {
    const list: {
      key: string;
      position: [number, number, number];
      stickers: Sticker[];
    }[] = [];
    for (const x of AXIS)
      for (const y of AXIS)
        for (const z of AXIS)
          list.push({
            key: `${x}${y}${z}`,
            position: [x, y, z],
            stickers: stickersFor(x, y, z),
          });
    return list;
  }, []);

  return (
    <group ref={group} rotation={[-0.35, 0.6, 0]}>
      {cubies.map(({ key, position, stickers }) => (
        <Cubie key={key} position={position} stickers={stickers} />
      ))}
    </group>
  );
};
