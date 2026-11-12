import {useThree} from '@react-three/fiber';
import React, {useMemo} from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {T} from '../config';

// ---------- Hilfsfunktionen ----------
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const mix = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

// deterministischer Zufall (gleiches Video bei jedem Render)
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- Geometrie des Hauses ----------
const HW = 8; // Breite
const HD = 6; // Tiefe
const WALL_H = 5;
const ROOF_H = 2.8;

type Win = {pos: [number, number, number]; normal: [number, number, number]; w: number; h: number};
const WINDOWS: Win[] = [
  // vorne unten
  {pos: [-2.6, 1.6, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.5, h: 1.6},
  {pos: [2.6, 1.6, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.5, h: 1.6},
  // vorne oben
  {pos: [-2.6, 3.8, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.3, h: 1.4},
  {pos: [0, 3.8, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.3, h: 1.4},
  {pos: [2.6, 3.8, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.3, h: 1.4},
  // Seite rechts
  {pos: [HW / 2 + 0.01, 1.6, -1.2], normal: [1, 0, 0], w: 1.4, h: 1.6},
  {pos: [HW / 2 + 0.01, 3.8, -1.2], normal: [1, 0, 0], w: 1.3, h: 1.4},
  {pos: [HW / 2 + 0.01, 3.8, 1.3], normal: [1, 0, 0], w: 1.3, h: 1.4},
];

const roofGeometry = (() => {
  const s = new THREE.Shape();
  s.moveTo(-HW / 2 - 0.5, 0);
  s.lineTo(HW / 2 + 0.5, 0);
  s.lineTo(0, ROOF_H);
  s.lineTo(-HW / 2 - 0.5, 0);
  const g = new THREE.ExtrudeGeometry(s, {depth: HD + 1, bevelEnabled: false});
  g.translate(0, WALL_H, -(HD + 1) / 2);
  return g;
})();

const dotTexture = (() => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

// ---------- Zustände aus der Zeitachse ----------
export const timelapseAt = (s: number) =>
  interpolate(
    s,
    [T.timelapseStart, T.timelapseStart + 0.6, T.timelapseEnd - 0.4, T.timelapseEnd],
    [0, 1, 1, 0],
    clamp,
  );

// "Weltzeit" in Frames: läuft im Zeitraffer schneller, aber nie rückwärts
export const worldTime = (frame: number, fps: number, boost: number) => {
  let t = 0;
  for (let f = 0; f < frame; f++) t += 1 + timelapseAt(f / fps) * boost;
  return t;
};
export const useTimeline = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame / fps;
  const thermal = interpolate(s, [T.thermalOn, T.thermalOn + 0.45], [0, 1], clamp);
  const leakIn = interpolate(s, [T.leakStart, T.leakStart + 1.2], [0, 1], clamp);
  const leakOut = interpolate(s, [T.swap, T.swap + 0.9], [1, 0], clamp);
  const leak = leakIn * leakOut;
  const timelapse = timelapseAt(s);
  const sealed = interpolate(s, [T.swap + 0.3, T.sealed], [0, 1], clamp);
  return {frame, fps, s, thermal, leak, timelapse, sealed};
};

// ---------- Kamera ----------
const CameraRig: React.FC = () => {
  const {camera} = useThree();
  const {s, timelapse} = useTimeline();
  const ease = Easing.inOut(Easing.cubic);
  const keys = [0, 2.6, 9.2, 13.6, 15.5, 20.6, 26];
  const px = interpolate(s, keys, [-3.0, 0.5, 6.0, 8.0, 4.0, 2.0, 0.0], {...clamp, easing: ease});
  const py = interpolate(s, keys, [3.0, 3.6, 4.4, 5.0, 3.8, 6.0, 8.0], {...clamp, easing: ease});
  const pz = interpolate(s, keys, [36, 30, 24, 22, 16.5, 27, 36], {...clamp, easing: ease});
  const shake = timelapse * 0.06;
  camera.position.set(px + Math.sin(s * 37) * shake, py + Math.cos(s * 29) * shake, pz);
  camera.lookAt(0.6, 5.2, 0);
  return null;
};

// ---------- Schnee ----------
const Snow: React.FC = () => {
  const {frame, fps, thermal} = useTimeline();
  const N = 1400;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(N * 3), []);
  // Zeitraffer: Schnee fällt schneller
  const t = worldTime(frame, fps, 3);
  for (let i = 0; i < N; i++) {
    const speed = 0.02 + rand(i * 3) * 0.03;
    const x = (rand(i) - 0.5) * 50;
    const z = (rand(i * 7) - 0.5) * 40;
    const y = 22 - (((rand(i * 13) * 22 + t * speed) % 22) + 22) % 22;
    positions[i * 3] = x + Math.sin(t * 0.02 + i) * 0.4;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const color = mix('#ffffff', '#3a3f9e', thermal);
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={dotTexture ?? undefined}
        size={0.18}
        color={color}
        transparent
        depthWrite={false}
        opacity={0.9}
      />
    </points>
  );
};

// ---------- Wärme-Partikel aus den Fenstern ----------
const HeatLeak: React.FC = () => {
  const {frame, fps, leak} = useTimeline();
  const PER = 70;
  const N = WINDOWS.length * PER;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(N * 3), [N]);
  const col = useMemo(() => new Float32Array(N * 3), [N]);
  const hot = new THREE.Color('#ffd27a');
  const warm = new THREE.Color('#ff4d1a');
  const tt = worldTime(frame, fps, 3.5);
  WINDOWS.forEach((w, wi) => {
    const n = new THREE.Vector3(...w.normal);
    const side = new THREE.Vector3(n.z !== 0 ? 1 : 0, 0, n.x !== 0 ? 1 : 0);
    for (let k = 0; k < PER; k++) {
      const i = wi * PER + k;
      const life = 55 + rand(i) * 35;
      const p = (((tt + rand(i * 5) * life) % life) + life) % life / life; // 0..1
      const sx = (rand(i * 11) - 0.5) * w.w;
      const sy = (rand(i * 17) - 0.5) * w.h;
      const out = p * (2.2 + rand(i * 19) * 2.2);
      const up = Math.pow(p, 1.6) * 3.2;
      const wob = Math.sin(p * 9 + i) * 0.25 * p;
      const v = new THREE.Vector3(...w.pos)
        .addScaledVector(n, 0.05 + out)
        .addScaledVector(side, sx * (1 + p * 0.6) + wob)
        .add(new THREE.Vector3(0, sy + up, 0));
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      const fade = Math.sin(Math.PI * p) * leak;
      const c = hot.clone().lerp(warm, p);
      col[i * 3] = c.r * fade;
      col[i * 3 + 1] = c.g * fade;
      col[i * 3 + 2] = c.b * fade;
    }
  });
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={dotTexture ?? undefined}
        size={0.5}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ---------- Fenster (alt -> neu) ----------
const Window: React.FC<{w: Win; index: number}> = ({w, index}) => {
  const {frame, fps, thermal, leak, sealed, s} = useTimeline();
  const rotY = w.normal[0] !== 0 ? Math.PI / 2 : 0;
  const pop = spring({
    frame: frame - Math.round((T.swap + index * 0.07) * fps),
    fps,
    config: {damping: 11, stiffness: 140},
  });
  const isNew = s >= T.swap + index * 0.07;
  // Glas-Farbe: normal warm -> Wärmebild heiß -> neu kühl
  const glass = mix('#ffcf7a', '#ffd84a', thermal).lerp(new THREE.Color('#4f8fe0'), sealed);
  const glow = mix('#000000', '#ff6a1f', thermal * Math.max(leak, (1 - sealed) * 0.55));
  const frameColor = mix('#f4f4f4', '#7d5cff', thermal * (1 - sealed * 0.4));
  const scale = isNew ? interpolate(pop, [0, 1], [0.2, 1]) : 1;
  return (
    <group position={w.pos} rotation={[0, rotY, 0]}>
      {/* Hitze-Hof um das Fenster */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w.w * 2.3, w.h * 2.1]} />
        <meshBasicMaterial
          map={dotTexture ?? undefined}
          color={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group scale={[scale, scale, 1]}>
        {/* Glas */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[w.w, w.h]} />
          <meshBasicMaterial color={glass} />
        </mesh>
        {/* Rahmen: alt = dünn, neu = kräftig mit Sprosse */}
        {[
          [0, w.h / 2, w.w + 0.16, 0.14],
          [0, -w.h / 2, w.w + 0.16, 0.14],
          [w.w / 2, 0, 0.14, w.h],
          [-w.w / 2, 0, 0.14, w.h],
          ...(isNew ? [[0, 0, 0.12, w.h]] : []),
        ].map(([x, y, bw, bh], i) => (
          <mesh key={i} position={[x, y, 0.08]}>
            <boxGeometry args={[bw, bh, isNew ? 0.16 : 0.06]} />
            <meshStandardMaterial
              color={isNew ? mix('#ffffff', '#b9dcff', thermal) : frameColor}
              emissive={isNew ? mix('#000000', '#2a6fd6', thermal * 0.6) : mix('#000000', '#3b1c8f', thermal)}
              flatShading
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ---------- Nachbarhäuser & Bäume ----------
const BG_HOUSES = [
  {x: -16, z: -8, w: 7, h: 4, d: 6},
  {x: 15, z: -10, w: 8, h: 5, d: 6},
  {x: -9, z: -18, w: 6, h: 6, d: 6},
  {x: 8, z: -20, w: 9, h: 4.5, d: 7},
];
const TREES = [
  [-7.5, 3], [-9, -1], [7.8, 5.5], [10, 1], [-12, 6], [12.5, -3], [-5.8, -6], [5.5, -7],
];

const Surroundings: React.FC = () => {
  const {thermal} = useTimeline();
  const wall = mix('#cfc8bd', '#1f1660', thermal);
  const roof = mix('#4d2a24', '#140f45', thermal);
  const tree = mix('#1e3b2f', '#0f0c3a', thermal);
  const snowTop = mix('#e8eef6', '#26206e', thermal);
  const winC = mix('#ffcf7a', '#ff9a3c', thermal);
  return (
    <group>
      {BG_HOUSES.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={wall} emissive={mix('#000', '#1a1250', thermal)} flatShading />
          </mesh>
          <mesh position={[0, b.h + 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[b.w * 0.75, 1.8, 4]} />
            <meshStandardMaterial color={roof} flatShading />
          </mesh>
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * b.w * 0.25, b.h * 0.55, b.d / 2 + 0.01]}>
              <planeGeometry args={[1, 1.1]} />
              <meshBasicMaterial color={winC} />
            </mesh>
          ))}
        </group>
      ))}
      {TREES.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1, 5]} />
            <meshStandardMaterial color={mix('#3b2a20', '#0b0930', thermal)} flatShading />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, 1.5 + k * 1.1, 0]}>
              <coneGeometry args={[1.4 - k * 0.35, 1.8, 6]} />
              <meshStandardMaterial color={k === 2 ? snowTop : tree} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// ---------- Hauptszene ----------
export const HouseScene: React.FC = () => {
  const {thermal, sealed, leak} = useTimeline();
  const bg = mix('#0c1730', '#05040f', thermal);
  // Wände: normal Putz, im Wärmebild kalt (lila/blau), rund um Fenster warm über Glow
  const wall = mix('#e7dfd2', '#2b1d7a', thermal).lerp(new THREE.Color('#1a2a8a'), sealed * thermal * 0.6);
  const wallEm = mix('#000000', '#2a1470', thermal).lerp(new THREE.Color('#0d1a5a'), sealed);
  const roof = mix('#6f3427', '#ff4d1a', thermal * (leak * 0.5 + (1 - sealed) * 0.25)).lerp(
    new THREE.Color('#1c1660'),
    sealed * thermal,
  );
  const ground = mix('#dce4ee', '#0a0b33', thermal);
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 28, 60]} />
      <CameraRig />
      <hemisphereLight args={['#9fb6ff', '#1a2233', 0.9 - thermal * 0.3]} />
      <directionalLight position={[-8, 14, 10]} intensity={1.4 - thermal * 0.7} color="#cfe0ff" />
      <pointLight position={[0, 2.5, 6]} intensity={(1 - thermal) * 18} distance={14} color="#ffb860" />

      {/* Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color={ground} flatShading />
      </mesh>

      {/* Haus */}
      <mesh position={[0, WALL_H / 2, 0]}>
        <boxGeometry args={[HW, WALL_H, HD]} />
        <meshStandardMaterial color={wall} emissive={wallEm} flatShading />
      </mesh>
      <mesh geometry={roofGeometry}>
        <meshStandardMaterial
          color={roof}
          emissive={mix('#000000', '#3a0f2a', thermal * (1 - sealed))}
          flatShading
        />
      </mesh>
      {/* Schornstein */}
      <mesh position={[2.4, WALL_H + 2.2, -1]}>
        <boxGeometry args={[0.7, 1.6, 0.7]} />
        <meshStandardMaterial color={mix('#5a2b22', '#3c1d8a', thermal)} flatShading />
      </mesh>
      {/* Tür */}
      <mesh position={[0, 1.1, HD / 2 + 0.02]}>
        <planeGeometry args={[1.2, 2.2]} />
        <meshStandardMaterial color={mix('#5b3a24', '#3a1f95', thermal)} />
      </mesh>

      {WINDOWS.map((w, i) => (
        <Window key={i} w={w} index={i} />
      ))}

      <Surroundings />
      <HeatLeak />
      <Snow />
    </>
  );
};
