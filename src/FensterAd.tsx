import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BRAND, CALC, Lang, PAL, PROMO, T, TEXT} from './config';
import {HouseScene} from './scene/House';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// Eine Schriftfamilie, zwei Schnitte: 500 und 700
const FONT = 'Inter, system-ui, sans-serif';
const W_REG = 500;
const W_BOLD = 700;
const SHADOW = '0 2px 18px rgba(8,14,26,0.85), 0 0 2px rgba(8,14,26,0.9)';

const fadeWindow = (s: number, from: number, to: number, f = 0.3) =>
  interpolate(s, [from, from + f, to - f, to], [0, 1, 1, 0], clamp);

// Zähler: Wärmeverlust über die Fenster (alte Fenster) über einen Winter
const lossAt = (s: number) => {
  if (s < T.leakStart) return 0;
  if (s < T.winterFast)
    return interpolate(s, [T.leakStart, T.winterFast], [0, 700], {...clamp, easing: Easing.in(Easing.quad)});
  return interpolate(s, [T.winterFast, T.counterFull], [700, CALC.lossOld], {
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

  const thermal = interpolate(s, [T.thermalOn, T.thermalOn + 0.8], [0, 1], clamp);
  const ctaOut = 1 - interpolate(s, [T.ctaStart, T.ctaStart + 0.4], [0, 1], clamp);
  const isNew = s >= T.swap;
  const showNew = s >= T.newCountFrom - 0.2;

  // Lichtübergang: ein weiches Lichtband läuft einmal von oben nach unten
  const sweepP = interpolate(s, [T.thermalOn - 0.1, T.thermalOn + 0.9], [-0.2, 1.2], clamp);
  const sweepO = fadeWindow(s, T.thermalOn - 0.1, T.thermalOn + 0.9, 0.25);

  // Zähler: alt zählt hoch, nach dem Tausch auf den neuen Wert herunter
  const kwh = isNew
    ? interpolate(s, [T.newCountFrom, T.newCountTo], [CALC.lossOld, CALC.lossNew], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      })
    : lossAt(s);
  const accent = showNew ? BRAND.blue : PAL.amber;
  const block = fadeWindow(s, T.leakStart - 0.2, T.ctaStart + 0.4, 0.35);
  const monthP = interpolate(s, [T.leakStart, T.counterFull], [0, 1], clamp);
  const monthIdx = Math.min(4, Math.floor(monthP * 5));
  const monthsO = 1 - interpolate(s, [T.swap, T.swap + 0.4], [0, 1], clamp);
  const savingsIn = spring({frame: frame - Math.round(T.savings * fps), fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{backgroundColor: PAL.night, fontFamily: FONT, color: PAL.text}}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} camera={{fov: 42, near: 0.1, far: 220}}>
          <HouseScene />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* dezente Vignette + ruhige Fläche hinter dem Text oben */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(8,14,26,0.5) 100%)'}}
      />
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, rgba(8,14,26,0.5) 0%, rgba(8,14,26,0) 34%)'}}
      />

      {/* Lichtübergang ins Wärmebild */}
      <AbsoluteFill
        style={{
          opacity: sweepO,
          background: `linear-gradient(180deg, transparent ${sweepP * 100 - 12}%, rgba(255,225,154,0.16) ${sweepP * 100}%, transparent ${sweepP * 100 + 12}%)`,
        }}
      />

      {/* Kopfzeile */}
      <div
        style={{
          position: 'absolute',
          top: 92,
          left: 64,
          right: 64,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 24,
          fontWeight: W_REG,
          letterSpacing: 2,
          opacity: interpolate(s, [T.thermalOn, T.thermalOn + 0.6], [0, 1], clamp) * ctaOut,
        }}
      >
        <span style={{color: PAL.amber}}>● {tx.thermal}</span>
        <span style={{opacity: 0.7}}>{BRAND.handle}</span>
      </div>

      {/* Temperaturskala: vorher und nachher identisch */}
      <div
        style={{
          position: 'absolute',
          top: 170,
          right: 64,
          height: 360,
          display: 'flex',
          gap: 12,
          opacity: thermal * ctaOut,
          fontSize: 22,
          fontWeight: W_REG,
        }}
      >
        <div
          style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', opacity: 0.8}}
        >
          <span>22 °C</span>
          <span>8 °C</span>
          <span>−5 °C</span>
        </div>
        <div
          style={{
            width: 14,
            borderRadius: 7,
            background: `linear-gradient(${PAL.softYellow}, ${PAL.amber} 30%, #6b5fa8 52%, ${PAL.indigo} 72%, ${PAL.deepBlue})`,
          }}
        />
      </div>

      {/* Fester Zählerbereich */}
      <div style={{position: 'absolute', top: 170, left: 64, width: 820, opacity: block}}>
        <div style={{fontSize: 26, fontWeight: W_BOLD, letterSpacing: 2.5, color: accent}}>
          {showNew ? tx.newLabel : tx.lossLabel}
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8, textShadow: SHADOW}}>
          <span
            style={{fontSize: 128, fontWeight: W_BOLD, letterSpacing: -3, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}
          >
            {nf.format(kwh)}
          </span>
          <span style={{fontSize: 44, fontWeight: W_REG}}>kWh</span>
        </div>
        <div
          style={{fontSize: 32, fontWeight: W_REG, marginTop: 10, opacity: 0.9, fontVariantNumeric: 'tabular-nums', textShadow: SHADOW}}
        >
          ≈ {nf.format(kwh * CALC.eurPerKwh)} € {tx.perWinter}
        </div>

        {/* Winterverlauf (vor dem Tausch) / Ersparnis (nach dem Tausch) teilen sich denselben Platz */}
        <div style={{position: 'relative', marginTop: 24, height: 200}}>
          <div style={{position: 'absolute', inset: 0, opacity: monthsO}}>
            <div style={{display: 'flex', gap: 22, fontSize: 22, fontWeight: W_REG, letterSpacing: 1.5}}>
              {tx.months.map((m, i) => (
                <span key={m} style={{opacity: i <= monthIdx ? 1 : 0.35, color: i === monthIdx ? PAL.amber : PAL.text}}>
                  {m}
                </span>
              ))}
            </div>
            <div style={{marginTop: 10, width: 380, height: 4, background: 'rgba(244,246,248,0.18)', borderRadius: 2}}>
              <div style={{height: 4, borderRadius: 2, background: PAL.amber, width: `${monthP * 100}%`}} />
            </div>
          </div>
          {s >= T.savings - 0.05 && (
            <div style={{position: 'absolute', inset: 0, opacity: savingsIn, transform: `translateY(${(1 - savingsIn) * 20}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: W_BOLD,
                    color: PAL.night,
                    background: BRAND.blue,
                    borderRadius: 16,
                    padding: '2px 18px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {tx.pct}
                </span>
                <span style={{fontSize: 30, fontWeight: W_BOLD, lineHeight: 1.2, whiteSpace: 'pre-line', textShadow: SHADOW}}>
                  {tx.pctLabel}
                </span>
              </div>
              <div style={{marginTop: 16, fontSize: 28, fontWeight: W_REG, textShadow: SHADOW}}>{tx.savedLine}</div>
            </div>
          )}
        </div>
      </div>

      {/* Annahmen: klein, aber lesbar, fester Platz unten */}
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: 1505,
          fontSize: 22,
          fontWeight: W_REG,
          lineHeight: 1.45,
          color: 'rgba(244,246,248,0.75)',
          textShadow: SHADOW,
          opacity: block,
        }}
      >
        {tx.assumption}
      </div>

      {/* Eröffnungsfrage: groß, schlicht, mit Luft */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 64,
          right: 64,
          textAlign: 'center',
          fontSize: 100,
          fontWeight: W_BOLD,
          lineHeight: 1.06,
          letterSpacing: -2,
          whiteSpace: 'pre-line',
          textShadow: SHADOW,
          opacity: interpolate(s, [T.hookIn, T.hookIn + 0.35, T.hookOut - 0.3, T.hookOut], [0, 1, 1, 0], clamp),
          transform: `translateY(${interpolate(s, [T.hookIn, T.hookIn + 0.5], [16, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`,
        }}
      >
        {tx.hook}
      </div>

      {/* Untertitel: feste Position unter dem Haus */}
      {tx.lines.map((l, i) => {
        const o = fadeWindow(s, l.from, l.to, 0.25);
        if (o <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 64,
              right: 64,
              top: 1335,
              textAlign: 'center',
              fontSize: 56,
              fontWeight: W_BOLD,
              lineHeight: 1.18,
              whiteSpace: 'pre-line',
              opacity: o,
              textShadow: SHADOW,
            }}
          >
            {l.text}
          </div>
        );
      })}

      {s >= T.ctaStart && <CtaCard lang={lang} />}

      <Audio src={staticFile('audio/bed.wav')} volume={voice ? 0.5 : 1} />
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
  const up = (d: number) => spring({frame: local - d, fps, config: {damping: 200}});
  // am Ende alles ausblenden -> das letzte Bild ist das Eröffnungsbild
  const out = interpolate(s, [T.loopStart, 25.95], [1, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  const bg = interpolate(s, [T.ctaStart, T.ctaStart + 0.5], [0, 0.9], clamp) * out;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: `rgba(16,28,48,${bg})`}} />
      <AbsoluteFill
        style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingBottom: 160, opacity: out}}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 32,
            padding: '24px 42px 18px',
            opacity: up(0),
            transform: `translateY(${(1 - up(0)) * 20}px)`,
          }}
        >
          <Img src={staticFile('logo.png')} style={{width: 460, display: 'block'}} />
        </div>
        {/* Winter-Aktion */}
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            opacity: up(3),
            transform: `translateY(${(1 - up(3)) * 20}px)`,
          }}
        >
          <span
            style={{
              background: PAL.amber,
              color: PAL.night,
              fontSize: 64,
              fontWeight: W_BOLD,
              borderRadius: 18,
              padding: '4px 22px',
              whiteSpace: 'nowrap',
            }}
          >
            {PROMO[lang].pct}
          </span>
          <span style={{fontSize: 34, fontWeight: W_BOLD, lineHeight: 1.2}}>
            {PROMO[lang].kicker}
            <br />
            <span style={{fontWeight: W_REG}}>
              {PROMO[lang].on} · {PROMO[lang].until}
            </span>
          </span>
        </div>
        <div
          style={{
            marginTop: 52,
            fontSize: 96,
            fontWeight: W_BOLD,
            lineHeight: 1.06,
            letterSpacing: -2,
            textAlign: 'center',
            whiteSpace: 'pre-line',
            opacity: up(5),
            transform: `translateY(${(1 - up(5)) * 20}px)`,
          }}
        >
          {tx.ctaTitle}
        </div>
        <div
          style={{
            marginTop: 56,
            padding: '30px 66px',
            borderRadius: 999,
            background: BRAND.blue,
            color: PAL.night,
            fontSize: 46,
            fontWeight: W_BOLD,
            opacity: up(10),
            transform: `scale(${0.96 + up(10) * 0.04})`,
          }}
        >
          {tx.ctaButton} →
        </div>
        <div style={{marginTop: 34, fontSize: 34, fontWeight: W_REG, opacity: up(14), textAlign: 'center', lineHeight: 1.5}}>
          <span style={{fontWeight: W_BOLD}}>{BRAND.phone}</span>
          <br />
          {BRAND.email}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
