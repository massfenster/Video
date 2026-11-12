import {useThree} from '@react-three/fiber';
import React, {useMemo} from 'react';
import * as THREE from 'three';

// Ruhige, glaubwürdige Abendszene für Kampagnen-Stills (kein Cartoon-Look):
// modernes Einfamilienhaus, Putzfassade, anthrazitfarbene Fenster, warmes Innenlicht, leichter Schnee.

const COL = {
  plaster: '#e6e2da',
  plinth: '#55595c',
  roof: '#2c3134',
  frame: '#383e42', // RAL 7016 Anthrazit
  sill: '#a9afb3',
  snow: '#edf2f5',
  path: '#7d8287',
  door: '#5a4030',
  amber: '#ffb547',
  warm: '#ffe19a',
};

const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Innenraum hinter dem Glas: warmes Licht mit Tiefe (heller Kern, Decke/Boden dunkler, angedeutete Vorhänge)
const interiorTex = canvasTex(256, 256, (c) => {
  const g = c.createRadialGradient(128, 110, 10, 128, 128, 190);
  g.addColorStop(0, '#ffe7b0');
  g.addColorStop(0.45, '#ffc062');
  g.addColorStop(1, '#8a4a1c');
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  const floor = c.createLinearGradient(0, 180, 0, 256);
  floor.addColorStop(0, 'rgba(90,45,15,0)');
  floor.addColorStop(1, 'rgba(70,35,12,0.55)');
  c.fillStyle = floor;
  c.fillRect(0, 180, 256, 76);
  const curtain = (x: number) => {
    const cg = c.createLinearGradient(x, 0, x + 40, 0);
    cg.addColorStop(0, 'rgba(255,236,200,0.0)');
    cg.addColorStop(0.5, 'rgba(255,236,200,0.28)');
    cg.addColorStop(1, 'rgba(255,236,200,0.0)');
    c.fillStyle = cg;
    c.fillRect(x, 0, 40, 256);
  };
  curtain(4);
  curtain(212);
});

// Glasreflexion: leichter kühler Verlauf
const glassTex = canvasTex(64, 256, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(160,190,230,0.22)');
  g.addColorStop(0.5, 'rgba(160,190,230,0.04)');
  g.addColorStop(1, 'rgba(160,190,230,0.10)');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 256);
});

const skyTex = canvasTex(8, 512, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#0b1424');
  g.addColorStop(0.55, '#101c30');
  g.addColorStop(0.8, '#1f2f49');
  g.addColorStop(1, '#2a3b57');
  c.fillStyle = g;
  c.fillRect(0, 0, 8, 512);
});

const flakeTex = canvasTex(32, 32, (c) => {
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
});

// ---------- Fenster ----------
type WinDef = {x: number; y: number; w: number; h: number; split?: 'v' | 'none'};

const WALL_T = 0.36;

const ModernWindow: React.FC<WinDef & {face: 'front' | 'side'}> = ({x, y, w, h, split = 'v', face}) => {
  const f = 0.09; // Rahmenbreite
  const d = 0.14; // Rahmentiefe
  const inset = -0.08;
  const rot: [number, number, number] = face === 'side' ? [0, Math.PI / 2, 0] : [0, 0, 0];
  return (
    <group position={face === 'front' ? [x, y, 0] : [0, y, x]} rotation={rot}>
      {/* Innenraum (sitzt im Mauerwerk, die Laibung entsteht durch die echte Wandöffnung) */}
      <mesh position={[0, 0, -WALL_T + 0.012]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={interiorTex ?? undefined} toneMapped={false} />
      </mesh>
      {/* Glas */}
      <mesh position={[0, 0, inset + 0.01]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={glassTex ?? undefined} transparent depthWrite={false} />
      </mesh>
      {/* Rahmen + Pfosten */}
      {[
        [0, h / 2 - f / 2, w, f],
        [0, -h / 2 + f / 2, w, f],
        [w / 2 - f / 2, 0, f, h],
        [-w / 2 + f / 2, 0, f, h],
        ...(split === 'v' ? [[0, 0, f * 0.9, h]] : []),
      ].map(([px, py, bw, bh], i) => (
        <mesh key={`f${i}`} position={[px, py, inset]} castShadow>
          <boxGeometry args={[bw, bh, d]} />
          <meshStandardMaterial color={COL.frame} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
      {/* Fensterbank mit Schnee */}
      <mesh position={[0, -h / 2 - 0.03, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.12, 0.05, 0.2]} />
        <meshStandardMaterial color={COL.sill} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.01, 0.1]}>
        <boxGeometry args={[w + 0.08, 0.04, 0.16]} />
        <meshStandardMaterial color={COL.snow} roughness={1} />
      </mesh>
      {/* warmes Licht nach außen */}
      <pointLight position={[0, 0, 0.9]} intensity={1.6} distance={4.5} decay={2} color={COL.amber} />
    </group>
  );
};

// ---------- Haus ----------
const W = 10;
const D = 8;
const H = 6.2;
const PITCH = (36 * Math.PI) / 180;
const RH = (W / 2) * Math.tan(PITCH);

type Hole = {x: number; y: number; w: number; h: number};
const FRONT_WIN: (WinDef & {split?: 'v' | 'none'})[] = [
  {x: -2.6, y: 1.95, w: 2.6, h: 2.1},
  {x: 2.75, y: 1.95, w: 1.5, h: 1.5},
  {x: -2.6, y: 4.6, w: 1.5, h: 1.4},
  {x: 0.6, y: 4.6, w: 1.5, h: 1.4},
];
const DOOR = {x: 0.55, y: 1.45, w: 1.15, h: 2.3};
const SIDE_WIN: WinDef[] = [
  {x: 1.6, y: 1.95, w: 1.5, h: 1.5},
  {x: -1.8, y: 1.95, w: 1.5, h: 1.5},
  {x: 1.6, y: 4.6, w: 1.3, h: 1.3},
  {x: -1.8, y: 4.6, w: 1.3, h: 1.3},
];

// Wand mit echten Öffnungen (Außenfläche bei z = 0, Dicke nach innen)
const wallGeo = (width: number, height: number, holes: Hole[]) => {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2, height);
  s.lineTo(-width / 2, height);
  s.lineTo(-width / 2, 0);
  holes.forEach((h) => {
    const p = new THREE.Path();
    p.moveTo(h.x - h.w / 2, h.y - h.h / 2);
    p.lineTo(h.x + h.w / 2, h.y - h.h / 2);
    p.lineTo(h.x + h.w / 2, h.y + h.h / 2);
    p.lineTo(h.x - h.w / 2, h.y + h.h / 2);
    p.lineTo(h.x - h.w / 2, h.y - h.h / 2);
    s.holes.push(p);
  });
  const g = new THREE.ExtrudeGeometry(s, {depth: WALL_T, bevelEnabled: false});
  g.translate(0, 0, -WALL_T);
  return g;
};

const House: React.FC = () => {
  const roofLen = W / 2 / Math.cos(PITCH) + 0.6;
  const gable = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(W / 2, 0);
    s.lineTo(0, RH);
    s.lineTo(-W / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, {depth: D, bevelEnabled: false});
    g.translate(0, H, -D / 2);
    return g;
  }, []);
  const frontWall = useMemo(() => wallGeo(W, H, [...FRONT_WIN, DOOR]), []);
  // Seitenwand: lokales x = -Welt-z
  const sideWall = useMemo(() => wallGeo(D, H, SIDE_WIN.map((h) => ({...h, x: -h.x}))), []);
  const plaster = <meshStandardMaterial color={COL.plaster} roughness={0.95} />;
  return (
    <group>
      {/* Sockel */}
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.04, 0.5, D + 0.04]} />
        <meshStandardMaterial color={COL.plinth} roughness={0.9} />
      </mesh>
      {/* Kern (Rück- und linke Wand), Front- und rechte Wand mit Öffnungen */}
      <mesh position={[-WALL_T / 2, H / 2, -WALL_T / 2]} castShadow receiveShadow>
        <boxGeometry args={[W - WALL_T, H, D - WALL_T]} />
        {plaster}
      </mesh>
      <mesh geometry={frontWall} position={[0, 0, D / 2]} castShadow receiveShadow>
        {plaster}
      </mesh>
      <mesh geometry={sideWall} position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        {plaster}
      </mesh>
      <mesh geometry={gable} castShadow receiveShadow>
        {plaster}
      </mesh>
      {/* Dachflächen (anthrazit) mit Schneeauflage */}
      {[-1, 1].map((s) => (
        <group key={s} position={[(s * W) / 4, H + RH / 2, 0]} rotation={[0, 0, -s * PITCH]}>
          <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
            <boxGeometry args={[roofLen, 0.18, D + 0.9]} />
            <meshStandardMaterial color={COL.roof} roughness={0.7} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.27, 0]}>
            <boxGeometry args={[roofLen - 0.15, 0.13, D + 0.8]} />
            <meshStandardMaterial color={COL.snow} roughness={1} />
          </mesh>
        </group>
      ))}
      {/* Schornstein */}
      <mesh position={[2.2, H + RH - 0.3, -1.5]} castShadow>
        <boxGeometry args={[0.6, 2.4, 0.6]} />
        <meshStandardMaterial color="#6d6a66" roughness={0.9} />
      </mesh>
      <mesh position={[2.2, H + RH + 0.93, -1.5]}>
        <boxGeometry args={[0.66, 0.08, 0.66]} />
        <meshStandardMaterial color={COL.snow} />
      </mesh>

      {/* Fenster vorne */}
      <group position={[0, 0, D / 2]}>
        {FRONT_WIN.map((w, i) => (
          <ModernWindow key={i} face="front" {...w} />
        ))}
        {/* Haustür mit Glasstreifen, Vordach, Wandleuchte */}
        <group position={[DOOR.x, DOOR.y, 0]}>
          <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[DOOR.w, DOOR.h, 0.08]} />
            <meshStandardMaterial color={COL.door} roughness={0.6} />
          </mesh>
          <mesh position={[0.32, 0.1, -0.155]}>
            <planeGeometry args={[0.16, 1.7]} />
            <meshBasicMaterial color={COL.warm} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.38, 0.45]} castShadow>
            <boxGeometry args={[1.9, 0.1, 1.0]} />
            <meshStandardMaterial color={COL.frame} />
          </mesh>
          <mesh position={[0, 1.46, 0.45]}>
            <boxGeometry args={[1.85, 0.06, 0.95]} />
            <meshStandardMaterial color={COL.snow} />
          </mesh>
          <mesh position={[-0.95, 0.75, 0.06]}>
            <boxGeometry args={[0.12, 0.28, 0.1]} />
            <meshBasicMaterial color={COL.warm} toneMapped={false} />
          </mesh>
          <pointLight position={[-0.95, 0.75, 0.5]} intensity={2.2} distance={5} decay={2} color="#ffd08a" />
        </group>
      </group>
      {/* Fenster rechte Seite */}
      <group position={[W / 2, 0, 0]}>
        {SIDE_WIN.map((w, i) => (
          <ModernWindow key={i} face="side" {...w} />
        ))}
      </group>
    </group>
  );
};

// ---------- Umgebung ----------
const Shrub: React.FC<{p: [number, number, number]; s: number}> = ({p, s}) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.35, 0]} castShadow>
      <sphereGeometry args={[0.55, 16, 12]} />
      <meshStandardMaterial color="#2e3b33" roughness={1} />
    </mesh>
    <mesh position={[0, 0.62, 0]} scale={[1, 0.45, 1]}>
      <sphereGeometry args={[0.5, 16, 12]} />
      <meshStandardMaterial color={COL.snow} roughness={1} />
    </mesh>
  </group>
);

const Snowfall: React.FC = () => {
  const geo = useMemo(() => {
    const N = 900;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rand(i) - 0.5) * 50;
      pos[i * 3 + 1] = rand(i * 3) * 20;
      pos[i * 3 + 2] = (rand(i * 7) - 0.3) * 40;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial map={flakeTex ?? undefined} size={0.09} transparent opacity={0.75} depthWrite={false} color="#ffffff" />
    </points>
  );
};

const Camera: React.FC<{pos: [number, number, number]; look: [number, number, number]}> = ({pos, look}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};

export const ModernHouseScene: React.FC<{camPos?: [number, number, number]; look?: [number, number, number]; fog?: [number, number]}> = ({
  fog = [30, 70],
  camPos = [10.5, 3.0, 21.5],
  look = [-0.3, 4.6, 0],
}) => {
  const {gl, scene} = useThree();
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  if (skyTex) scene.background = skyTex;
  return (
    <>
      <fog attach="fog" args={['#22324c', fog[0], fog[1]]} />
      <Camera pos={camPos} look={look} />
      {/* Himmel/Umgebung: kühles, weiches Licht, damit die Fassade lesbar bleibt */}
      <hemisphereLight args={['#8fa6cc', '#3a4a63', 0.85]} />
      <directionalLight
        position={[-14, 18, 16]}
        intensity={0.55}
        color="#b9c9e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />
      {/* sanftes Fülllicht auf die Fassade */}
      <spotLight position={[8, 9, 16]} angle={0.5} penumbra={1} intensity={60} distance={40} color="#c8d4ea" />

      {/* Schneefläche + geräumter Weg */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={COL.snow} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.55, 0.01, 7.5]} receiveShadow>
        <planeGeometry args={[1.5, 7]} />
        <meshStandardMaterial color={COL.path} roughness={0.95} />
      </mesh>
      {/* Schneekanten am Weg */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.55 + s * 0.85, 0.08, 7.5]} scale={[0.25, 0.16, 7]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={COL.snow} roughness={1} />
        </mesh>
      ))}

      <House />
      <Shrub p={[-5.4, 0, 5.2]} s={1.1} />
      <Shrub p={[-6.6, 0, 3.6]} s={0.9} />
      <Shrub p={[3.6, 0, 5.4]} s={0.8} />
      <Shrub p={[6.2, 0, 4.6]} s={1.0} />

      {/* ferne, weiche Baumreihe (im Nebel, keine schwarzen Silhouetten) */}
      {Array.from({length: 26}).map((_, i) => {
        const x = -75 + i * 6 + rand(i) * 3;
        const z = -70 - rand(i * 5) * 10;
        const h = 7 + rand(i * 9) * 5;
        return (
          <mesh key={i} position={[x, h / 2, z]}>
            <coneGeometry args={[2.2 + rand(i * 2) * 1.2, h, 12]} />
            <meshStandardMaterial color="#33445f" roughness={1} />
          </mesh>
        );
      })}
      <Snowfall />
    </>
  );
};
