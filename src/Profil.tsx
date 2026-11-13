import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {BRAND} from './config';
import {ModernHouseScene} from './scene/ModernHouse';

// Profil-Assets für Instagram, Facebook, TikTok (gleiche Palette wie die Kampagne)
const C = {bg: '#101c30', text: '#edf2f5', amber: '#ffb547', cta: '#2dafdc'};
const FONT = 'Inter, system-ui, sans-serif';

// ---------- Profilbild 1080 × 1080: Logo bleibt im runden Zuschnitt vollständig sichtbar ----------
export const ProfilBild: React.FC<{variant: 'full' | 'mark'}> = ({variant}) => (
  <AbsoluteFill style={{background: '#ffffff', justifyContent: 'center', alignItems: 'center'}}>
    {/* Logo nur vom Weißrand befreit (nicht verändert); Größe so, dass es im runden Zuschnitt (Ø 1080) vollständig bleibt */}
    <Img
      src={staticFile(variant === 'full' ? 'logo-crop.png' : 'logo-mark.png')}
      style={{width: variant === 'full' ? 820 : 860, display: 'block'}}
    />
  </AbsoluteFill>
);

// ---------- Facebook-Titelbild 1640 × 624 (zeitlos, Region NRW, ohne befristete Aktion) ----------
// Mobil wird links/rechts beschnitten -> Text bleibt in der Mitte (sicherer Bereich ca. 1200 px breit)
export const FacebookCover: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.text}}>
      <div style={{position: 'absolute', inset: 0}}>
        <ThreeCanvas width={width} height={height} camera={{fov: 26, near: 0.1, far: 300}} shadows>
          <ModernHouseScene camPos={[22, 4.2, 44]} look={[10, 5.2, 0]} fog={[60, 140]} />
        </ThreeCanvas>
      </div>
      <AbsoluteFill
        style={{background: 'linear-gradient(90deg, rgba(16,28,48,0.0) 0%, rgba(16,28,48,0.0) 42%, rgba(16,28,48,0.8) 52%, #101c30 100%)'}}
      />
      <div style={{position: 'absolute', left: 830, right: 170, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 5, color: C.amber}}>MASSFENSTERNRW</div>
        <div style={{fontSize: 60, fontWeight: 700, lineHeight: 1.08, marginTop: 10}}>Fenster nach Maß</div>
        <div style={{fontSize: 60, fontWeight: 700, lineHeight: 1.08, color: '#2dafdc'}}>in ganz NRW</div>
        <div style={{fontSize: 25, fontWeight: 500, marginTop: 20, opacity: 0.9, lineHeight: 1.45}}>
          Kostenloses Aufmaß & unverbindliches Angebot
          <br />
          Energieberater für BAFA- & KfW-Förderung
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Story-Highlight-Cover 1080 × 1920 (Symbol mittig im runden Ausschnitt) ----------
const stroke = {fill: 'none', stroke: C.text, strokeWidth: 14, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
const ICONS: Record<string, React.ReactNode> = {
  aktion: (
    <>
      <circle cx="70" cy="70" r="26" {...stroke} stroke={C.amber} />
      <circle cx="170" cy="170" r="26" {...stroke} stroke={C.amber} />
      <line x1="185" y1="55" x2="55" y2="185" {...stroke} stroke={C.amber} />
    </>
  ),
  fenster: (
    <>
      <rect x="40" y="30" width="160" height="180" rx="8" {...stroke} />
      <line x1="120" y1="30" x2="120" y2="210" {...stroke} />
      <line x1="40" y1="120" x2="200" y2="120" {...stroke} />
    </>
  ),
  aufmass: (
    <>
      <rect x="20" y="85" width="200" height="70" rx="10" {...stroke} />
      {[55, 90, 125, 160, 195].map((x, i) => (
        <line key={x} x1={x - 10} y1="85" x2={x - 10} y2={i % 2 ? 110 : 122} {...stroke} strokeWidth={10} />
      ))}
    </>
  ),
  foerderung: (
    <>
      <path d="M120 30 L200 70 L40 70 Z" {...stroke} />
      {[65, 105, 145, 185].map((x) => (
        <line key={x} x1={x - 5} y1="90" x2={x - 5} y2="170" {...stroke} />
      ))}
      <line x1="35" y1="200" x2="205" y2="200" {...stroke} />
    </>
  ),
  kontakt: (
    <path
      d="M70 30 L100 30 L115 80 L95 95 Q110 140 145 155 L160 135 L210 150 L210 180 Q205 210 175 210 Q60 200 30 70 Q30 40 70 30 Z"
      {...stroke}
    />
  ),
  referenzen: (
    <path
      d="M120 25 L147 90 L215 95 L162 140 L180 208 L120 170 L60 208 L78 140 L25 95 L93 90 Z"
      {...stroke}
      stroke={C.amber}
    />
  ),
};

export const HighlightCover: React.FC<{icon: keyof typeof ICONS}> = ({icon}) => (
  <AbsoluteFill style={{background: C.bg, justifyContent: 'center', alignItems: 'center'}}>
    <div
      style={{
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 40%, #1d3150 0%, #101c30 75%)',
        border: `10px solid ${C.cta}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg viewBox="0 0 240 240" width={300} height={300}>
        {ICONS[icon]}
      </svg>
    </div>
  </AbsoluteFill>
);

export const HIGHLIGHTS = Object.keys(ICONS) as (keyof typeof ICONS)[];
export const PROFILE_HANDLE = BRAND.handle;
