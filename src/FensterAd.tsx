import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BRAND, CALC, Lang, T, TEXT} from './config';
import {HouseScene} from './scene/House';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SANS = 'Inter, "Inter Display", system-ui, sans-serif';
const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace';

const fadeWindow = (s: number, from: number, to: number, f = 0.25) =>
  interpolate(s, [from, from + f, to - f, to], [0, 1, 1, 0], clamp);

// ---------- Zähler ----------
const kwhAt = (s: number) => {
  if (s < T.leakStart) return 0;
  if (s < T.timelapseStart)
    return interpolate(s, [T.leakStart, T.timelapseStart], [0, 140], clamp);
  return interpolate(s, [T.timelapseStart, T.timelapseEnd], [140, CALC.kwhPerWinter], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
};

export type FensterAdProps = {lang: Lang; voice: boolean};

export const FensterAd: React.FC<FensterAdProps> = ({lang, voice}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const s = frame / fps;
  const tx = TEXT[lang];
  const nf = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'tr-TR', {maximumFractionDigits: 0});

  const thermal = interpolate(s, [T.thermalOn, T.thermalOn + 0.45], [0, 1], clamp);
  const sealed = s >= T.swap;
  const cta = interpolate(s, [T.ctaStart, T.ctaStart + 0.6], [0, 1], clamp);

  // Blitze bei den großen Momenten
  const flash =
    interpolate(s, [T.thermalOn - 0.05, T.thermalOn, T.thermalOn + 0.35], [0, 0.85, 0], clamp) +
    interpolate(s, [T.swap - 0.05, T.swap, T.swap + 0.5], [0, 0.9, 0], clamp);

  // Glitch-Verschiebung beim Umschalten
  const glitch = interpolate(s, [T.thermalOn - 0.1, T.thermalOn + 0.25], [1, 0], clamp) *
    (s > T.thermalOn - 0.1 ? 1 : 0);

  const kwh = kwhAt(s);
  const hudVisible = fadeWindow(s, T.leakStart - 0.1, T.ctaStart + 0.3, 0.3);

  return (
    <AbsoluteFill style={{backgroundColor: '#05040f', fontFamily: SANS}}>
      {/* 3D-Szene */}
      <AbsoluteFill style={{transform: `translateX(${Math.sin(frame * 3) * glitch * 18}px)`}}>
        <ThreeCanvas width={width} height={height} camera={{fov: 42, near: 0.1, far: 200}}>
          <HouseScene />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Wärmebild-Look: Scanlines + Vignette */}
      <AbsoluteFill
        style={{
          opacity: thermal * 0.35,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 5px)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Kopfzeile */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO,
          fontSize: 22,
          letterSpacing: 4,
          color: 'rgba(255,255,255,0.55)',
          opacity: interpolate(s, [0.2, 0.8], [0, 1], clamp) * (1 - cta),
        }}
      >
        <span>{tx.hudTop}</span>
        <span>{BRAND.handle}</span>
      </div>

      {/* Wärmebild-Indikator + Temperaturskala */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 60,
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: 3,
          color: '#ff5a3c',
          opacity: thermal * (1 - cta) * (Math.floor(s * 2) % 2 === 0 ? 1 : 0.55),
        }}
      >
        ● {tx.hudThermal}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 200,
          right: 70,
          height: 420,
          display: 'flex',
          gap: 14,
          opacity: thermal * (1 - cta),
          fontFamily: MONO,
          fontSize: 20,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right'}}>
          <span>22°C</span>
          <span>8°C</span>
          <span>-5°C</span>
        </div>
        <div
          style={{
            width: 16,
            borderRadius: 8,
            background: 'linear-gradient(#fff3b0, #ff9a3c, #ff3d2e, #7d2bd6, #2b1d7a, #0a0b33)',
          }}
        />
      </div>

      {/* Zähler-Block (wie im Referenzvideo: Label + große Zahl) */}
      <div
        style={{
          position: 'absolute',
          top: 470,
          left: 60,
          opacity: hudVisible,
          borderLeft: `3px solid ${sealed ? BRAND.cool : BRAND.accent}`,
          padding: '14px 30px 18px 22px',
          background: 'linear-gradient(90deg, rgba(5,4,15,0.55), rgba(5,4,15,0))',
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: sealed ? BRAND.cool : BRAND.accent}}>
          {sealed ? tx.hudSealed : tx.hudCounter}
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14, color: 'white'}}>
          <span style={{fontFamily: MONO, fontSize: 112, fontWeight: 700, letterSpacing: -2}}>
            {nf.format(kwh)}
          </span>
          <span style={{fontFamily: MONO, fontSize: 40, opacity: 0.8}}>kWh</span>
        </div>
        <div style={{fontFamily: MONO, fontSize: 30, color: 'rgba(255,255,255,0.75)', letterSpacing: 2}}>
          {sealed ? tx.hudSealedSub : `≈ ${nf.format(kwh * CALC.eurPerKwh)} €`}
        </div>
        {/* Zeitraffer-Leiste */}
        <div style={{marginTop: 22, opacity: fadeWindow(s, T.timelapseStart, T.timelapseEnd + 0.3, 0.3)}}>
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: 'rgba(255,255,255,0.6)'}}>
            {tx.hudTimelapse}
          </div>
          <div style={{marginTop: 10, width: 420, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3}}>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: BRAND.accent,
                width: `${interpolate(s, [T.timelapseStart, T.timelapseEnd], [0, 100], clamp)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Hook */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: interpolate(s, [0, 0.15, T.hookEnd - 0.3, T.hookEnd], [0, 1, 1, 0], clamp),
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 80,
            fontWeight: 800,
            padding: '0 60px',
            lineHeight: 1.08,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            letterSpacing: -1.5,
            textShadow: '0 6px 40px rgba(0,0,0,0.8)',
            transform: `translateY(${-430 + interpolate(s, [0, 0.5], [30, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px) scale(${interpolate(s, [0, 2.6], [1, 1.06])})`,
          }}
        >
          {tx.hook}
        </div>
      </AbsoluteFill>

      {/* Untertitel */}
      {tx.lines.map((l, i) => {
        const o = fadeWindow(s, l.from, l.to, 0.2);
        if (o <= 0) return null;
        const pop = spring({frame: frame - Math.round(l.from * fps), fps, config: {damping: 16}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 70,
              right: 70,
              top: 1180,
              textAlign: 'center',
              color: 'white',
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.18,
              whiteSpace: 'pre-line',
              opacity: o,
              transform: `translateY(${(1 - pop) * 24}px)`,
              textShadow: '0 4px 24px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
            }}
          >
            {l.text}
          </div>
        );
      })}

      {/* Blitz */}
      <AbsoluteFill style={{backgroundColor: 'white', opacity: Math.min(flash, 1), pointerEvents: 'none'}} />

      {/* Call-to-Action */}
      {cta > 0 && <CtaCard lang={lang} />}

      {/* Ton: Musik/SFX (per Code synthetisiert) + optional Sprecher */}
      <Audio src={staticFile('audio/bed.wav')} volume={voice ? 0.55 : 1} />
      {voice && <Audio src={staticFile(`audio/vo_${lang}.mp3`)} />}
    </AbsoluteFill>
  );
};

const CtaCard: React.FC<{lang: Lang}> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame / fps;
  const tx = TEXT[lang];
  const local = frame - Math.round(T.ctaStart * fps);
  const bg = interpolate(s, [T.ctaStart, T.ctaStart + 0.6], [0, 0.82], clamp);
  const up = (d: number) => spring({frame: local - d, fps, config: {damping: 14}});
  const pulse = 1 + Math.sin(local / 6) * 0.025;
  const loop = interpolate(s, [24.6, 25.0], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: `rgba(5,4,15,${bg})`}} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          paddingBottom: 260,
          opacity: 1 - loop,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 30,
            letterSpacing: 8,
            color: BRAND.cool,
            opacity: up(0),
            transform: `translateY(${(1 - up(0)) * 30}px)`,
          }}
        >
          {BRAND.name}
        </div>
        <div
          style={{
            marginTop: 30,
            color: 'white',
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            letterSpacing: -2,
            opacity: up(4),
            transform: `translateY(${(1 - up(4)) * 40}px)`,
          }}
        >
          {tx.ctaTitle}
        </div>
        <div
          style={{
            marginTop: 30,
            color: 'rgba(255,255,255,0.8)',
            fontSize: 40,
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 860,
            opacity: up(9),
          }}
        >
          {tx.ctaSub}
        </div>
        <div
          style={{
            marginTop: 60,
            padding: '30px 64px',
            borderRadius: 999,
            background: BRAND.accent,
            color: 'white',
            fontSize: 44,
            fontWeight: 700,
            boxShadow: `0 0 60px ${BRAND.accent}88`,
            transform: `scale(${up(14) * pulse})`,
          }}
        >
          {tx.ctaButton} →
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 330,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 19,
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.45)',
          opacity: up(18) * (1 - loop),
        }}
      >
        {tx.footnote}
      </div>
      {/* Loop zurück zum Hook */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: `rgba(5,4,15,${loop})`,
          opacity: loop,
        }}
      >
        <div style={{color: 'white', fontSize: 64, fontWeight: 700, textAlign: 'center', padding: '0 80px', transform: 'translateY(-160px)'}}>
          {tx.loop}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
