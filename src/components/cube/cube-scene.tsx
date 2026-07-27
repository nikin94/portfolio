import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  ExtrudeGeometry,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  type BufferGeometry,
  type Group,
} from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

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

const CUBIE_SIZE = 0.94;
const CUBIE_RADIUS = 0.1;
const STICKER_SIZE = 0.78;

type Sticker = {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
};

/**
 * A single rounded-cube geometry, built once and shared by every cubie. This
 * mirrors `@react-three/drei`'s `<RoundedBox>` recipe (an `ExtrudeGeometry`
 * over a rounded shape, centred, with creased normals) so the look is identical
 * — but constructed a single time instead of once per cubie, which is the bulk
 * of the scene's geometry cost.
 */
const EPS = 0.00001;
const makeRoundedBoxGeometry = (
  size: number,
  radius: number,
  smoothness = 3,
  bevelSegments = 4,
  steps = 1,
  creaseAngle = 0.4,
): BufferGeometry => {
  const r = radius - EPS;
  const shape = new Shape();
  shape.absarc(EPS, EPS, EPS, -Math.PI / 2, -Math.PI, true);
  shape.absarc(EPS, size - r * 2, EPS, Math.PI, Math.PI / 2, true);
  shape.absarc(size - r * 2, size - r * 2, EPS, Math.PI / 2, 0, true);
  shape.absarc(size - r * 2, EPS, EPS, 0, -Math.PI / 2, true);
  const geometry = new ExtrudeGeometry(shape, {
    depth: size - radius * 2,
    bevelEnabled: true,
    bevelSegments: bevelSegments * 2,
    steps,
    bevelSize: radius - EPS,
    bevelThickness: radius,
    curveSegments: smoothness,
  });
  geometry.center();
  toCreasedNormals(geometry, creaseAngle);
  return geometry;
};

/** GPU resources shared across all 27 cubies. */
interface CubeResources {
  bodyGeometry: BufferGeometry;
  bodyMaterial: MeshStandardMaterial;
  stickerGeometry: PlaneGeometry;
  /** One material per sticker colour (6), keyed by colour. */
  stickerMaterials: Map<string, MeshStandardMaterial>;
}

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
  resources,
}: {
  position: [number, number, number];
  stickers: Sticker[];
  resources: CubeResources;
}) => (
  <group position={position}>
    <mesh geometry={resources.bodyGeometry} material={resources.bodyMaterial} />
    {stickers.map((sticker, i) => (
      <mesh
        // A cubie's stickers are positionally unique and never reorder.
        key={i}
        position={sticker.position}
        rotation={sticker.rotation}
        geometry={resources.stickerGeometry}
        material={resources.stickerMaterials.get(sticker.color)}
      />
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

  // Geometry and materials are built once and shared by every cubie, then
  // disposed when the hero unmounts. Sharing turns ~80 geometries/materials
  // (one body geometry + material and up to two sticker materials per cubie)
  // into 2 geometries + 7 materials — far less GPU memory and setup time.
  const resources = useMemo<CubeResources>(() => {
    const stickerMaterials = new Map<string, MeshStandardMaterial>();
    for (const color of [
      COLORS.right,
      COLORS.left,
      COLORS.up,
      COLORS.down,
      COLORS.front,
      COLORS.back,
    ]) {
      stickerMaterials.set(
        color,
        new MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05 }),
      );
    }
    return {
      bodyGeometry: makeRoundedBoxGeometry(CUBIE_SIZE, CUBIE_RADIUS),
      bodyMaterial: new MeshStandardMaterial({
        color: COLORS.body,
        roughness: 0.55,
        metalness: 0.1,
      }),
      stickerGeometry: new PlaneGeometry(STICKER_SIZE, STICKER_SIZE),
      stickerMaterials,
    };
  }, []);

  useEffect(
    () => () => {
      resources.bodyGeometry.dispose();
      resources.bodyMaterial.dispose();
      resources.stickerGeometry.dispose();
      resources.stickerMaterials.forEach((material) => material.dispose());
    },
    [resources],
  );

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
        <Cubie
          key={key}
          position={position}
          stickers={stickers}
          resources={resources}
        />
      ))}
    </group>
  );
};
