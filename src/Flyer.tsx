import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {BRAND, CALC, Lang, PAL, PROMO, TEXT} from './config';
import {HouseScene} from './scene/House';

const FONT = 'Inter, system-ui, sans-serif';
const SHADOW = '0 2px 24px rgba(8,14,26,0.9)';

// Standbild aus dem Film: wird mit --frame=380 gerendert (Wärmebild, Wärme entweicht an den alten Fenstern)
export const FLYER_FRAME = 380;

export const Flyer: React.FC<{lang: Lang}> = ({lang}) => {
  const {width, height} = useVideoConfig();
  const u = width / 1080; // Layout in 1080er-Einheiten, skaliert für Druck/Social
  const p = PROMO[lang];
  const tx = TEXT[lang];
  const tall = height / width > 1.3; // A5 hochkant vs. 4:5-Post

  return (
    <AbsoluteFill style={{backgroundColor: PAL.night, fontFamily: FONT, color: PAL.text}}>
      {/* Szene etwas tiefer setzen, damit das Haus zwischen Aktion und Fakten steht */}
      <div style={{position: 'absolute', left: 0, top: height * (height / width > 1.3 ? 0.035 : 0.0), width, height}}>
        <ThreeCanvas width={width} height={height} camera={{fov: height / width > 1.3 ? 60 : 72, near: 0.1, far: 220}}>
          <HouseScene />
        </ThreeCanvas>
      </div>
      {/* ruhige Flächen hinter Text oben und unten */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, #101c30 0%, rgba(16,28,48,0.8) 30%, rgba(16,28,48,0) 40%, rgba(16,28,48,0) 60%, rgba(16,28,48,0.92) 70%, #101c30 100%)',
        }}
      />

      <AbsoluteFill style={{padding: `${56 * u}px ${64 * u}px ${48 * u}px`, display: 'flex', flexDirection: 'column'}}>
        {/* Kopf: Logo + Kanal */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{background: '#fff', borderRadius: 24 * u, padding: `${14 * u}px ${24 * u}px ${10 * u}px`}}>
            <Img src={staticFile('logo.png')} style={{width: 300 * u, display: 'block'}} />
          </div>
          <div style={{fontSize: 26 * u, fontWeight: 500, opacity: 0.8, textAlign: 'right', lineHeight: 1.5}}>
            Instagram · TikTok · Facebook
            <br />
            <span style={{fontWeight: 700, opacity: 1}}>{BRAND.handle}</span>
          </div>
        </div>

        {/* Aktion */}
        <div style={{marginTop: 54 * u, textShadow: SHADOW}}>
          <div style={{fontSize: 46 * u, fontWeight: 700, letterSpacing: 6 * u, color: PAL.softYellow}}>{p.kicker}</div>
          <div style={{display: 'flex', alignItems: tall ? 'baseline' : 'center', gap: 28 * u, flexWrap: tall ? 'wrap' : 'nowrap'}}>
            <span style={{fontSize: (height / width > 1.3 ? 250 : 210) * u, fontWeight: 700, letterSpacing: -10 * u, lineHeight: 1, color: PAL.amber, whiteSpace: 'nowrap'}}>
              {p.pct}
            </span>
            <span style={{fontSize: (tall ? 62 : 54) * u, fontWeight: 700, lineHeight: 1.1, maxWidth: tall ? undefined : 300 * u}}>{p.on}</span>
          </div>
        </div>

        {/* Hier ist das Haus im Wärmebild zu sehen */}
        <div style={{flex: 1}} />

        {/* Fakten + CTA */}
        <div style={{display: 'flex', gap: 40 * u, alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            {p.bullets.map((b) => (
              <div key={b} style={{display: 'flex', gap: 18 * u, alignItems: 'baseline', fontSize: 36 * u, fontWeight: 500, lineHeight: 1.3, marginBottom: 16 * u}}>
                <span style={{color: BRAND.blue, fontWeight: 700}}>✓</span>
                <span>{b}</span>
              </div>
            ))}
            <div
              style={{
                display: 'inline-block',
                marginTop: 18 * u,
                padding: `${24 * u}px ${48 * u}px`,
                borderRadius: 999,
                background: BRAND.blue,
                color: PAL.night,
                fontSize: 40 * u,
                fontWeight: 700,
              }}
            >
              {p.button} →
            </div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{background: '#fff', borderRadius: 20 * u, padding: 18 * u}}>
              <Img src={staticFile('qr-instagram.svg')} style={{width: 200 * u, height: 200 * u, display: 'block'}} />
            </div>
            <div style={{marginTop: 12 * u, fontSize: 22 * u, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'pre-line', opacity: 0.85}}>
              {p.qr}
            </div>
          </div>
        </div>

        {/* Kleingedrucktes */}
        <div style={{marginTop: 34 * u, fontSize: 20 * u, fontWeight: 500, lineHeight: 1.5, color: 'rgba(244,246,248,0.72)'}}>
          {p.validity}
          <br />* {tx.assumption.replace(/^[^:]+:\s*/, lang === 'de' ? 'Beispielrechnung: ' : 'Örnek hesap: ')} ({lang === 'de'
            ? `${CALC.pct} % beziehen sich nur auf den Wärmeverlust über die Fenster`
            : `%${CALC.pct} yalnızca pencerelerden kaynaklanan ısı kaybı içindir`})
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
