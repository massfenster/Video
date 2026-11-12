import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {BRAND} from './config';
import {ModernHouseScene} from './scene/ModernHouse';

// Instagram/Facebook Winter-Kampagne 1080 × 1350 (Brief: ein Angebot, ein Call-to-Action)
const C = {
  bg: '#101c30',
  text: '#edf2f5',
  amber: '#ffb547',
  cta: '#2dafdc',
};
const FONT = 'Inter, system-ui, sans-serif';
const REG = 500;
const BOLD = 700;
const M = 64; // Sicherheitsabstand

// Texte exakt laut Brief
const TXT = {
  kicker: 'WINTER-AKTION',
  pct: '35 %',
  rabatt: 'Rabatt auf Fenster',
  sub: 'Kostenloses Aufmaß & unverbindliches Angebot',
  cta: 'Jetzt kostenloses Aufmaß anfragen →',
  validity: 'Aktion gültig bis 01.12.2026.',
  // einzige bekannte Bedingung (vom Kunden bestätigt); nichts erfunden
  conditions: 'Rabatt gilt nur für Fenster.',
};

export const Kampagne: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg, fontFamily: FONT, color: C.text}}>
      {/* Haus im mittleren Bereich */}
      <div style={{position: 'absolute', left: 0, top: 0, width, height}}>
        <ThreeCanvas width={width} height={height} camera={{fov: 30, near: 0.1, far: 300}} shadows>
          <ModernHouseScene camPos={[25.5, 3.8, 57.5]} look={[0.6, 8.6, 0]} fog={[66, 140]} />
        </ThreeCanvas>
      </div>
      {/* weiche Übergänge für Lesbarkeit oben und unten */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(16,28,48,0.9) 0%, rgba(16,28,48,0.7) 30%, rgba(16,28,48,0.0) 44%, rgba(16,28,48,0.0) 68%, rgba(16,28,48,0.9) 76%, #101c30 84%)',
        }}
      />

      {/* Logo klein oben links (Original, unverändert auf weißer Fläche) */}
      <div
        style={{
          position: 'absolute',
          top: M,
          left: M,
          background: '#ffffff',
          borderRadius: 18,
          padding: '10px 16px 7px',
        }}
      >
        <Img src={staticFile('logo.png')} style={{width: 190, display: 'block'}} />
      </div>

      {/* Angebot */}
      <div style={{position: 'absolute', top: 210, left: M, right: M}}>
        <div style={{fontSize: 40, fontWeight: BOLD, letterSpacing: 6, color: C.text}}>{TXT.kicker}</div>
        <div style={{marginTop: 6}}>
          <span style={{fontSize: 176, fontWeight: BOLD, color: C.amber, letterSpacing: -7, lineHeight: 1, whiteSpace: 'nowrap', display: 'block'}}>
            {TXT.pct}
          </span>
          <span style={{fontSize: 60, fontWeight: BOLD, lineHeight: 1.1, display: 'block', marginTop: 4}}>{TXT.rabatt}</span>
        </div>
        <div style={{marginTop: 14, fontSize: 32, fontWeight: REG, opacity: 0.92}}>{TXT.sub}</div>
      </div>

      {/* Call-to-Action */}
      <div
        style={{
          position: 'absolute',
          left: M,
          right: M,
          top: 1010,
          background: C.cta,
          color: C.bg,
          borderRadius: 22,
          padding: '28px 0',
          textAlign: 'center',
          fontSize: 40,
          fontWeight: BOLD,
        }}
      >
        {TXT.cta}
      </div>

      {/* Kontakt */}
      <div
        style={{
          position: 'absolute',
          left: M,
          right: M,
          top: 1130,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 34,
          fontWeight: BOLD,
        }}
      >
        <span>
          <span style={{fontWeight: REG, opacity: 0.75}}>Tel. </span>
          {BRAND.phone}
        </span>
        <span>{BRAND.email}</span>
      </div>

      {/* Bedingungen */}
      <div
        style={{
          position: 'absolute',
          left: M,
          right: M,
          top: 1200,
          paddingTop: 18,
          borderTop: '1px solid rgba(237,242,245,0.2)',
          fontSize: 24,
          fontWeight: REG,
          lineHeight: 1.45,
          color: 'rgba(237,242,245,0.8)',
        }}
      >
        {TXT.validity} {TXT.conditions}
      </div>
    </AbsoluteFill>
  );
};
