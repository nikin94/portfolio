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
 * The 3×3×3 cube. Plays a short scale-up entrance, then leaves rotation to
 * `OrbitControls` (auto-rotate + drag). Purely visual — no layer-turn logic
 * yet; that can layer on later without touching the wrapper.
 */
export const CubeModel = () => {
  const group = useRef<Group>(null);
  const startedAt = useRef<number | null>(null);

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

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = now;

    // Ease the whole cube up from 60% over the first ~1.1s.
    const progress = Math.min((now - startedAt.current) / 1.1, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    g.scale.setScalar(0.6 + 0.4 * eased);
  });

  return (
    <group ref={group} rotation={[-0.35, 0.6, 0]}>
      {cubies.map(({ key, position, stickers }) => (
        <Cubie key={key} position={position} stickers={stickers} />
      ))}
    </group>
  );
};
