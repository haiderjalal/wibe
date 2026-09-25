"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";

import { ISLAMABAD } from "@/lib/data";

import type { Line2, LineSegments2 } from "three-stdlib";

interface CitySceneProps {
  active: boolean;
  reduced: boolean;
  onReady: () => void;
}

interface PinSpec {
  x: number;
  z: number;
  color: string;
  height: number;
  label?: string;
}

interface LabelSpec {
  text: string;
  anchor: THREE.Vector3;
  /** Seconds after mount when the label fades in. */
  delay: number;
  tone: "glass" | "solid";
}

const SODIUM = "#ffb547";
const DUSK = "#ff6f7d";
const VIOLET = "#8c7bff";
const PINE = "#43e0b0";
const JASMINE = "#f5f3ff";

const GRID_SPACING = 2.4;
const PIN_DELAY = 0.5;
const PIN_STAGGER = 0.12;

// Real sector coordinates projected into scene space: east is +x, north is -z (the Margallas sit at the back).
const sector = (id: string): { x: number; z: number } => {
  const n = ISLAMABAD.neighborhoods.find((s) => s.id === id);
  return n ? { x: (n.lng - 73.045) * 115, z: -(n.lat - 33.705) * 135 } : { x: 0, z: 0 };
};

const smoothstep = (e0: number, e1: number, v: number): number => {
  const t = THREE.MathUtils.clamp((v - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Flat city floor rising into the Margalla ridge along the north edge. */
function heightAt(x: number, z: number): number {
  const ridgeMask = smoothstep(-5.6, -8.4, z);
  const ridge =
    ridgeMask *
    (1.55 + 0.7 * Math.sin(x * 0.42 + 0.6) + 0.45 * Math.sin(x * 1.1 + 2) + 0.22 * Math.sin(x * 2.6) + 0.1 * Math.sin(x * 5.1 + 1));
  return ridge + 0.05 * Math.sin(x * 0.9) * Math.cos(z * 0.8);
}

const hash = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

const ORIGIN = sector("f7");
const PINS: PinSpec[] = [
  { ...sector("f6"), color: VIOLET, height: 1.9, label: "Monsoon Jazz Night · F-6" },
  { ...sector("trail5"), color: PINE, height: 1.5, label: "Sunrise Trail Run · Margalla" },
  { ...sector("g9"), color: DUSK, height: 1.6, label: "Open mic · G-9" },
  { ...sector("saidpur"), color: SODIUM, height: 2.1, label: "Qawwali · Saidpur" },
  { ...sector("e11"), color: PINE, height: 1.2 },
  { ...sector("f11"), color: DUSK, height: 1.3 },
  { ...sector("e7"), color: SODIUM, height: 1.4 },
  { ...sector("lakeview"), color: PINE, height: 1.2 },
  { ...sector("blue"), color: VIOLET, height: 1.0 },
];

const LABELS: LabelSpec[] = [
  {
    text: "You · F-7",
    anchor: new THREE.Vector3(ORIGIN.x, heightAt(ORIGIN.x, ORIGIN.z) + 0.5, ORIGIN.z),
    delay: 0.4,
    tone: "solid",
  },
  ...PINS.flatMap((p, i) =>
    p.label
      ? [{ text: p.label, anchor: new THREE.Vector3(p.x, heightAt(p.x, p.z) + p.height + 0.36, p.z), delay: PIN_DELAY + i * PIN_STAGGER + 0.7, tone: "glass" as const }]
      : [],
  ),
];

function useDotTexture(): THREE.Texture {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.8)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function Terrain() {
  const dot = useDotTexture();
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 19, 150, 100);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0.6, 0, -1);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color("#5b62b8");
    const ridgeTint = new THREE.Color(VIOLET);
    const gridTint = new THREE.Color("#9aa3ff");
    const light = new THREE.Color(SODIUM);
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = heightAt(x, z);
      pos.setY(i, y);

      const ridgeMask = smoothstep(-5.6, -8.4, z);
      const nearGrid =
        ridgeMask < 0.2 &&
        (Math.abs(((x + 100) % GRID_SPACING) - GRID_SPACING / 2) > GRID_SPACING / 2 - 0.09 ||
          Math.abs(((z + 100) % GRID_SPACING) - GRID_SPACING / 2) > GRID_SPACING / 2 - 0.09);
      const fade = 0.25 + 0.75 * smoothstep(-11, 5, z);

      c.copy(base).multiplyScalar(0.55);
      if (nearGrid) c.copy(gridTint).multiplyScalar(0.95);
      c.lerp(ridgeTint, ridgeMask * 0.7).multiplyScalar(fade * (0.7 + y * 0.18));
      // A scatter of warm "streetlights" across the city floor.
      if (ridgeMask < 0.1 && hash(i) > 0.965) c.copy(light).multiplyScalar(0.9 + hash(i + 7) * 0.6);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <group>
      {/* Solid silhouette so the ridge occludes the dusk sky behind the canvas. */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#0b0d2a" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <points geometry={geometry}>
        <pointsMaterial size={0.075} map={dot} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  );
}

const easeOutBack = (t: number): number => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

function Pin({ spec, delay, reduced }: { spec: PinSpec; delay: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ground = heightAt(spec.x, spec.z);
  const phase = hash(spec.x * 13 + spec.z);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const rise = reduced ? 1 : easeOutBack(THREE.MathUtils.clamp((t - delay) / 0.9, 0, 1));
    group.current?.scale.setScalar(Math.max(rise, 0.0001));
    if (head.current && !reduced) head.current.position.y = spec.height + Math.sin(t * 1.6 + phase * 6) * 0.06;
    if (ring.current) {
      const cycle = reduced ? 0.4 : (t * 0.55 + phase) % 1;
      ring.current.scale.setScalar(1 + cycle * 3);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.7 * Math.min(rise, 1);
    }
  });

  return (
    <group position={[spec.x, ground, spec.z]}>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[0.14, 0.18, 40]} />
        <meshBasicMaterial color={spec.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={group}>
        <mesh position-y={spec.height / 2}>
          <cylinderGeometry args={[0.012, 0.03, spec.height, 8]} />
          <meshBasicMaterial color={spec.color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={head} position-y={spec.height}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshBasicMaterial color={spec.color} />
          <mesh>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshBasicMaterial color={spec.color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </mesh>
      </group>
    </group>
  );
}

function Arc({ to, delay, reduced }: { to: PinSpec; delay: number; reduced: boolean }) {
  const line = useRef<Line2 | LineSegments2>(null);
  const points = useMemo(() => {
    const start = new THREE.Vector3(ORIGIN.x, heightAt(ORIGIN.x, ORIGIN.z) + 0.05, ORIGIN.z);
    const end = new THREE.Vector3(to.x, heightAt(to.x, to.z) + to.height, to.z);
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 0.8 + start.distanceTo(end) * 0.22;
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(48);
  }, [to]);

  useFrame(({ clock }, delta) => {
    const material = line.current?.material;
    if (!material) return;
    material.opacity = reduced ? 0.6 : THREE.MathUtils.clamp((clock.elapsedTime - delay) / 0.8, 0, 1) * 0.75;
    if (!reduced) material.dashOffset -= delta * 0.5;
  });

  return <Line ref={line} points={points} color={to.color} lineWidth={1.4} dashed dashSize={0.22} gapSize={0.16} transparent opacity={0} />;
}

function Origin({ reduced }: { reduced: boolean }) {
  const rings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    rings.current?.children.forEach((child, i) => {
      const cycle = reduced ? 0.3 + i * 0.3 : (clock.elapsedTime * 0.45 + i / 3) % 1;
      child.scale.setScalar(1 + cycle * 5);
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.55;
    });
  });
  return (
    <group position={[ORIGIN.x, heightAt(ORIGIN.x, ORIGIN.z) + 0.03, ORIGIN.z]}>
      <group ref={rings}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.16, 0.2, 48]} />
            <meshBasicMaterial color={JASMINE} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <mesh position-y={0.12}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color={JASMINE} />
      </mesh>
    </group>
  );
}

/** Projects label anchors to screen space each frame and moves plain DOM nodes; no extra React roots. */
function LabelProjector({ elements, reduced }: { elements: React.RefObject<(HTMLSpanElement | null)[]>; reduced: boolean }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size, clock }) => {
    LABELS.forEach((label, i) => {
      const el = elements.current[i];
      if (!el) return;
      v.copy(label.anchor).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      const shown = reduced || clock.elapsedTime > label.delay;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      el.style.opacity = shown && v.z < 1 ? "1" : "0";
    });
  });
  return null;
}

/** Pointer parallax plus a scroll-driven fly-over toward the ridge. */
function CameraRig({ reduced }: { reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useFrame(({ camera, size }, delta) => {
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    const narrow = size.width < 768;
    const { x: px, y: py } = pointer.current;
    const damp = (from: number, to: number) => THREE.MathUtils.damp(from, to, 2.4, delta);
    camera.position.x = damp(camera.position.x, 0.8 + px * 0.9);
    camera.position.y = damp(camera.position.y, (narrow ? 4.6 : 3.4) - py * 0.35 + scroll * 2.2);
    camera.position.z = damp(camera.position.z, (narrow ? 14 : 10.5) - scroll * 4.5);
    target.set(0.8 + px * 0.3, (narrow ? 0.4 : 0.9) - scroll * 0.6, -2.2 - scroll * 1.8);
    camera.lookAt(target);
  });
  return null;
}

export default function CityScene({ active, reduced, onReady }: CitySceneProps) {
  const labels = useRef<(HTMLSpanElement | null)[]>([]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0.8, 3.4, 10.5], fov: 42, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : active ? "always" : "never"}
        onCreated={onReady}
        fallback={null}
        style={{ pointerEvents: "none" }}
        aria-hidden
      >
        <CameraRig reduced={reduced} />
        <LabelProjector elements={labels} reduced={reduced} />
        <Terrain />
        <Origin reduced={reduced} />
        {PINS.map((pin, i) => (
          <Pin key={`${pin.x}:${pin.z}`} spec={pin} delay={PIN_DELAY + i * PIN_STAGGER} reduced={reduced} />
        ))}
        {PINS.slice(0, 4).map((pin, i) => (
          <Arc key={`${pin.x}:${pin.z}`} to={pin} delay={1.9 + i * 0.2} reduced={reduced} />
        ))}
        {!reduced && <Sparkles count={70} scale={[22, 3, 14]} position={[0.6, 1.8, -1]} size={2.4} speed={0.25} color={SODIUM} opacity={0.7} />}
      </Canvas>
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
        {LABELS.map((label, i) => (
          <span
            key={label.text}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className={`absolute left-0 top-0 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] opacity-0 transition-opacity duration-700 will-change-transform ${
              label.tone === "solid" ? "bg-jasmine text-ink" : "glass text-jasmine"
            }`}
          >
            {label.text}
          </span>
        ))}
      </div>
    </div>
  );
}
