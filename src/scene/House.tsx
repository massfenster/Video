import {useThree} from '@react-three/fiber';
import React, {useMemo} from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {PAL, T} from '../config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const C = (hex: string) => new THREE.Color(hex);
const mix = (a: string, b: string, t: number) => C(a).lerp(C(b), t);
const BLACK = '#000000';

// deterministischer Zufall -> jedes Rendering identisch
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- Hausgeometrie (bleibt im ganzen Film identisch) ----------
const HW = 8;
const HD = 6;
const WALL_H = 5;
const ROOF_H = 2.8;
const EAVE = 0.5;

type Win = {pos: [number, number, number]; normal: [number, number, number]; w: number; h: number};
export const WINDOWS: Win[] = [
  {pos: [-2.6, 1.7, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.5, h: 1.6},
  {pos: [2.6, 1.7, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.5, h: 1.6},
  {pos: [-2.6, 3.85, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.3, h: 1.4},
  {pos: [0, 3.85, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.3, h: 1.4},
  {pos: [2.6, 3.85, HD / 2 + 0.01], normal: [0, 0, 1], w: 1.3, h: 1.4},
  {pos: [HW / 2 + 0.01, 1.7, -1.2], normal: [1, 0, 0], w: 1.4, h: 1.6},
  {pos: [HW / 2 + 0.01, 3.85, -1.2], normal: [1, 0, 0], w: 1.3, h: 1.4},
  {pos: [HW / 2 + 0.01, 3.85, 1.3], normal: [1, 0, 0], w: 1.3, h: 1.4},
];

const roofGeometry = (() => {
  const s = new THREE.Shape();
  s.moveTo(-HW / 2 - EAVE, 0);
  s.lineTo(HW / 2 + EAVE, 0);
  s.lineTo(0, ROOF_H);
  s.lineTo(-HW / 2 - EAVE, 0);
  const g = new THREE.ExtrudeGeometry(s, {depth: HD + 1, bevelEnabled: false});
  g.translate(0, WALL_H, -(HD + 1) / 2);
  return g;
})();
const SLOPE = Math.atan2(ROOF_H, HW / 2 + EAVE);
const SLOPE_LEN = Math.hypot(ROOF_H, HW / 2 + EAVE);

const dotTexture = (() => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

// ---------- Zeitachse ----------
const winterSpeedAt = (s: number) =>
  interpolate(s, [T.winterFast, T.winterFast + 0.6, T.counterFull - 0.3, T.counterFull], [0, 1, 1, 0], clamp);

// "Weltzeit": im Winter-Zeitraffer etwas schneller, nie rückwärts
const worldTime = (frame: number, fps: number, boost: number) => {
  let t = 0;
  for (let f = 0; f < frame; f++) t += 1 + winterSpeedAt(f / fps) * boost;
  return t;
};

export const useTimeline = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame / fps;
  // Wärmebild an (3,0–3,8) und unter dem CTA-Overlay wieder aus (Loop zum Anfang)
  const thermal =
    interpolate(s, [T.thermalOn, T.thermalOn + 0.8], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)}) *
    interpolate(s, [T.loopStart - 0.6, T.loopStart - 0.1], [1, 0], clamp);
  const leak =
    interpolate(s, [T.leakStart, T.leakStart + 1.0], [0, 1], clamp) *
    interpolate(s, [T.swap, T.swap + 0.7], [1, 0], {...clamp, easing: Easing.out(Easing.quad)});
  const sealed = interpolate(s, [T.swap, T.swap + 0.9], [0, 1], clamp);
  const winter = winterSpeedAt(s);
  return {frame, fps, s, thermal, leak, sealed, winter};
};

// ---------- Kamera: ein fester Blickwinkel, nur sanftes Heranfahren ----------
const CAM0 = new THREE.Vector3(7.2, 4.4, 34);
const CameraRig: React.FC = () => {
  const {camera} = useThree();
  const {s} = useTimeline();
  const k = interpolate(s, [0, T.ctaStart], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  // unter dem CTA zurück zur Startposition -> letztes Bild = erstes Bild
  const back = interpolate(s, [T.loopStart - 0.6, T.loopStart - 0.1], [0, 1], clamp);
  const push = k * (1 - back);
  camera.position.set(CAM0.x - push * 0.7, CAM0.y, CAM0.z - push * 3.2);
  camera.lookAt(0.4, 3.9, 0);
  return null;
};

// ---------- Schnee ----------
const Snow: React.FC = () => {
  const {frame, fps, thermal, s} = useTimeline();
  const N = 1600;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(N * 3), []);
  const t = worldTime(frame, fps, 1.5);
  // Winterverlauf: Schneefall wird dichter und lässt wieder nach
  const density = interpolate(s, [0, T.winterFast, 11.6, T.counterFull, 26], [0.55, 0.6, 1, 0.65, 0.55], clamp);
  for (let i = 0; i < N; i++) {
    const visible = rand(i * 29) < density;
    const speed = 0.018 + rand(i * 3) * 0.025;
    const y = 24 - (((rand(i * 13) * 24 + t * speed) % 24) + 24) % 24;
    pos[i * 3] = (rand(i) - 0.5) * 60 + Math.sin(t * 0.015 + i) * 0.35;
    pos[i * 3 + 1] = visible ? y : -50;
    pos[i * 3 + 2] = (rand(i * 7) - 0.5) * 50;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return (
    <points geometry={geo}>
      <pointsMaterial
        map={dotTexture ?? undefined}
        size={0.16}
        color={mix(PAL.snow, '#3a4a9a', thermal)}
        transparent
        opacity={0.85 - thermal * 0.35}
        depthWrite={false}
      />
    </points>
  );
};

// ---------- Wärmeströme: dünn, halbtransparent, von den Fensterrändern ----------
const HeatFlow: React.FC = () => {
  const {frame, fps, leak, thermal} = useTimeline();
  const PER = 44;
  const N = WINDOWS.length * PER;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(N * 3), [N]);
  const col = useMemo(() => new Float32Array(N * 3), [N]);
  const yellow = C(PAL.softYellow);
  const amber = C(PAL.amber);
  const tt = worldTime(frame, fps, 1.2);
  const strength = leak * thermal;
  WINDOWS.forEach((w, wi) => {
    const n = new THREE.Vector3(...w.normal);
    const side = new THREE.Vector3(n.z !== 0 ? 1 : 0, 0, n.x !== 0 ? -1 : 0);
    for (let k = 0; k < PER; k++) {
      const i = wi * PER + k;
      const life = 70 + rand(i) * 40;
      const p = ((((tt + rand(i * 5) * life) % life) + life) % life) / life; // 0..1
      // Startpunkt auf dem Rahmen: oben (60 %) oder seitlich (40 %)
      const e = rand(i * 11);
      let sx: number;
      let sy: number;
      if (e < 0.6) {
        sx = (rand(i * 17) - 0.5) * w.w;
        sy = w.h / 2;
      } else {
        sx = (e < 0.8 ? -1 : 1) * (w.w / 2);
        sy = (rand(i * 19) - 0.3) * w.h * 0.8;
      }
      const sway = Math.sin(p * 6 + i) * 0.12 * p;
      const v = new THREE.Vector3(...w.pos)
        .addScaledVector(n, 0.08 + p * 0.9)
        .addScaledVector(side, sx + sway + (sx > 0 ? 1 : -1) * p * 0.15)
        .add(new THREE.Vector3(0, sy + p * 1.9, 0));
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      // weich ein- und ausblenden, gedämpft (kein Ausbrennen bei Überlagerung)
      const fade = Math.sin(Math.PI * p) * (1 - p * 0.4) * strength * 0.55;
      const c = yellow.clone().lerp(amber, Math.min(1, p * 1.4));
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
        size={0.34}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ---------- Fenster: alt (Ränder heiß) -> neu (kühle Rahmen, warmes Innenlicht) ----------
const FrameBars: React.FC<{w: number; h: number; t: number; mullion: boolean; color: THREE.Color; emissive: THREE.Color; depth: number}> = ({
  w, h, t, mullion, color, emissive, depth,
}) => (
  <>
    {[
      [0, h / 2, w + t, t],
      [0, -h / 2, w + t, t],
      [w / 2, 0, t, h],
      [-w / 2, 0, t, h],
      ...(mullion ? [[0, 0, t * 0.8, h]] : []),
    ].map(([x, y, bw, bh], i) => (
      <mesh key={i} position={[x, y, depth / 2 + 0.03]}>
        <boxGeometry args={[bw, bh, depth]} />
        <meshStandardMaterial color={color} emissive={emissive} flatShading />
      </mesh>
    ))}
  </>
);

const Window: React.FC<{w: Win; index: number}> = ({w, index}) => {
  const {frame, fps, s, thermal, leak, sealed} = useTimeline();
  const rotY = w.normal[0] !== 0 ? Math.PI / 2 : 0;
  const at = T.swap + index * 0.035;
  const isNew = s >= at;
  // "Einsetzen": kurz aus der Wand heraus, dann fest einrasten
  const seat = spring({frame: frame - Math.round(at * fps), fps, config: {damping: 22, stiffness: 320, mass: 0.6}});
  const pushZ = isNew ? (1 - seat) * 0.6 : 0;
  const sc = isNew ? 1.06 - seat * 0.06 : 1;

  // Glas: normal = warmes Innenlicht; Wärmebild alt = Amber; neu = gedämpftes warmes Innenlicht
  const glassNormal = mix(PAL.softYellow, '#c9a46a', 0.25);
  const glassOld = mix(PAL.amber, PAL.indigo, 0.25);
  const glassNew = mix(PAL.softYellow, '#b0875a', 0.35);
  const glass = glassNormal.clone().lerp(isNew ? glassNew : glassOld, thermal);

  // Rahmen: alt im Wärmebild = heiße Ränder (Softgelb), neu = ruhiges Blau
  const frameNormal = C(isNew ? '#f2f4f6' : '#6e5a48');
  const frameThermal = isNew ? C(PAL.frameCool) : C(PAL.softYellow);
  const frameColor = frameNormal.clone().lerp(frameThermal, thermal);
  const frameEm = mix(BLACK, isNew ? '#1d3a78' : PAL.amber, thermal * (isNew ? 0.5 : 0.85));

  // Hof um das Fenster: nur im Wärmebild, nur alte Fenster
  const halo = mix(BLACK, PAL.amber, thermal * (0.18 + leak * 0.17) * (1 - sealed));
  return (
    <group position={w.pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.15, 0.02]}>
        <planeGeometry args={[w.w * 2.2, w.h * 2.2]} />
        <meshBasicMaterial map={dotTexture ?? undefined} color={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group position={[0, 0, pushZ]} scale={[sc, sc, 1]}>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[w.w, w.h]} />
          <meshBasicMaterial color={glass} />
        </mesh>
        <FrameBars
          w={w.w}
          h={w.h}
          t={isNew ? 0.16 : 0.1}
          mullion={isNew}
          depth={isNew ? 0.16 : 0.05}
          color={frameColor}
          emissive={frameEm}
        />
      </group>
    </group>
  );
};

// ---------- Umgebung ----------
const BG_HOUSES = [
  {x: -17, z: -9, w: 7, h: 4, d: 6},
  {x: 16, z: -11, w: 8, h: 5, d: 6},
  {x: -9, z: -20, w: 6, h: 6, d: 6},
  {x: 9, z: -22, w: 9, h: 4.5, d: 7},
];
const TREES = [
  [-7.8, 3], [-9.5, -1.5], [8.4, 6], [10.5, 1.5], [-12.5, 6.5], [13, -3], [-6, -6.5], [5.8, -7.5],
];

const Surroundings: React.FC = () => {
  const {thermal} = useTimeline();
  const wall = mix('#bdb7ad', PAL.deepBlue, thermal);
  const wallEm = mix(BLACK, '#1a2260', thermal * 0.6);
  const roof = mix('#2f2724', PAL.deepBlue, thermal);
  const snowCap = mix(PAL.snow, '#1f2a6a', thermal);
  const tree = mix('#1c2d2a', '#151d55', thermal);
  const winC = mix(PAL.softYellow, mix(PAL.amber, PAL.indigo, 0.45).getStyle(), thermal);
  return (
    <group>
      {BG_HOUSES.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={wall} emissive={wallEm} flatShading />
          </mesh>
          <mesh position={[0, b.h + 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[b.w * 0.75, 1.8, 4]} />
            <meshStandardMaterial color={snowCap} flatShading />
          </mesh>
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * b.w * 0.25, b.h * 0.55, b.d / 2 + 0.01]}>
              <planeGeometry args={[1, 1.1]} />
              <meshBasicMaterial color={winC} />
            </mesh>
          ))}
          <mesh position={[0, b.h + 0.02, 0]}>
            <boxGeometry args={[b.w + 0.1, 0.05, b.d + 0.1]} />
            <meshStandardMaterial color={roof} />
          </mesh>
        </group>
      ))}
      {TREES.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1, 5]} />
            <meshStandardMaterial color={mix('#2b211b', PAL.deepBlue, thermal)} flatShading />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, 1.5 + k * 1.1, 0]}>
              <coneGeometry args={[1.4 - k * 0.35, 1.8, 6]} />
              <meshStandardMaterial color={k === 2 ? snowCap : tree} flatShading />
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
  const sky = mix(PAL.night, '#0b1030', thermal);
  // Wände: kalt = Indigo; nach dem Tausch ruhiges Blau
  const wallT = mix(PAL.indigo, PAL.calmBlue, sealed);
  const wall = mix('#d6cfc2', wallT.getStyle(), thermal);
  const wallEm = mix(BLACK, wallT.getStyle(), thermal * 0.3);
  // Dach: im Wärmebild dunkelblau (gedämmt), leicht wärmer an der Traufe vor dem Tausch
  const roofT = mix(PAL.deepBlue, '#3a3f86', leak * 0.35);
  const roof = mix('#3a2e2a', roofT.getStyle(), thermal);
  const snowCap = mix(PAL.snow, '#1f2a6a', thermal);
  const ground = mix(PAL.snow, PAL.deepBlue, thermal);
  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 34, 75]} />
      <CameraRig />
      <hemisphereLight args={['#5d78a8', PAL.night, 0.75 - thermal * 0.25]} />
      <directionalLight position={[-10, 16, 12]} intensity={1.05 - thermal * 0.5} color="#c3d2ee" />
      {/* warmes Innenlicht fällt auf den Schnee vor dem Haus */}
      <pointLight position={[0, 1.6, 5.5]} intensity={(1 - thermal) * 9} distance={11} color="#ffc98a" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[80, 48]} />
        <meshStandardMaterial color={ground} emissive={mix(BLACK, PAL.deepBlue, thermal * 0.5)} />
      </mesh>

      <mesh position={[0, WALL_H / 2, 0]}>
        <boxGeometry args={[HW, WALL_H, HD]} />
        <meshStandardMaterial color={wall} emissive={wallEm} flatShading />
      </mesh>
      <mesh geometry={roofGeometry}>
        <meshStandardMaterial color={roof} emissive={mix(BLACK, PAL.deepBlue, thermal * 0.5)} flatShading />
      </mesh>
      {/* Schnee auf beiden Dachflächen */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (HW / 2 + EAVE) / 2, WALL_H + ROOF_H / 2 + 0.1, 0]}
          rotation={[0, 0, -side * SLOPE]}
        >
          <boxGeometry args={[SLOPE_LEN, 0.16, HD + 1.05]} />
          <meshStandardMaterial color={snowCap} emissive={mix(BLACK, '#1f2a6a', thermal * 0.5)} flatShading />
        </mesh>
      ))}
      <mesh position={[2.4, WALL_H + 2.1, -1]}>
        <boxGeometry args={[0.7, 1.7, 0.7]} />
        <meshStandardMaterial color={mix('#4a3a33', PAL.indigo, thermal)} flatShading />
      </mesh>
      <mesh position={[0, 1.1, HD / 2 + 0.02]}>
        <planeGeometry args={[1.2, 2.2]} />
        <meshStandardMaterial color={mix('#4a3426', PAL.indigo, thermal)} />
      </mesh>

      {WINDOWS.map((w, i) => (
        <Window key={i} w={w} index={i} />
      ))}

      <Surroundings />
      <HeatFlow />
      <Snow />
    </>
  );
};
