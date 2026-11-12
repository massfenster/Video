// Alle Texte, Zahlen, Farben und Timings an einer Stelle.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 26;

export const BRAND = {
  name: 'MassFensterNRW',
  handle: '@massfensternrw',
  blue: '#31b2e8', // Logo-Hellblau (Button)
  navy: '#26437f', // Logo-Dunkelblau
};

// Art Direction (Brief): begrenzte Palette, kein Neon/Pink, keine ausgebrannten Weißtöne
export const PAL = {
  night: '#101c30', // Außen: dunkles Marineblau
  snow: '#edf2f5', // Schnee: gebrochenes Weiß
  amber: '#ffb547', // Wärmeverlust
  softYellow: '#ffe19a', // heißeste Stellen / Innenlicht
  indigo: '#262c66', // kalte Flächen (Wärmebild)
  deepBlue: '#121838', // sehr kalt (Wärmebild)
  calmBlue: '#2a4677', // Außenflächen nach dem Tausch
  frameCool: '#5b8fd6', // neue Rahmen im Wärmebild
  text: '#f4f6f8',
};

// ---- Rechnung: alle Zahlen im Video werden HIER berechnet ----
// Wärmeverlust durchs Fenster pro Winter = Fläche × Uw × Heizgradstunden
const AREA_M2 = 15;
const U_OLD = 2.8; // W/m²K, typisches älteres Isolierglas-Fenster
const U_NEW = 0.8; // W/m²K, neue Fenster (MassFensterNRW-Profil)
const HEAT_KH = 84000; // Heizgradstunden pro Jahr (DE, Richtwert)
const EUR_PER_KWH = 0.12;

const kwh = (u: number) => (AREA_M2 * u * HEAT_KH) / 1000;
export const CALC = {
  area: AREA_M2,
  uOld: U_OLD,
  uNew: U_NEW,
  heatKh: HEAT_KH,
  eurPerKwh: EUR_PER_KWH,
  lossOld: kwh(U_OLD), // 3.528 kWh
  lossNew: kwh(U_NEW), // 1.008 kWh
  saved: kwh(U_OLD) - kwh(U_NEW), // 2.520 kWh
  savedEur: (kwh(U_OLD) - kwh(U_NEW)) * EUR_PER_KWH, // ≈ 302 €
  pct: Math.round(((U_OLD - U_NEW) / U_OLD) * 100), // 71 % weniger Wärmeverlust über die Fenster
};

// Szenen-Timing in Sekunden (scripts/sfx.py und scripts/voice_piper.py spiegeln diese Werte)
export const T = {
  hookIn: 0.2,
  hookOut: 2.9,
  thermalOn: 3.0, // Lichtübergang 3,0–3,8
  leakStart: 6.0,
  winterFast: 10.0,
  counterFull: 13.2,
  swap: 14.3, // neue Fenster sitzen
  newCountFrom: 15.0,
  newCountTo: 16.2,
  savings: 17.3,
  ctaStart: 21.0,
  loopStart: 25.2, // zurück zum Eröffnungsbild
};

type Line = {from: number; to: number; text: string};
export type Lang = 'de' | 'tr';

const fmt = (lang: Lang, n: number) =>
  new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'tr-TR', {maximumFractionDigits: 0}).format(n);
const dec = (lang: Lang, n: number) =>
  new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'tr-TR', {minimumFractionDigits: 1}).format(n);

export const TEXT: Record<
  Lang,
  {
    hook: string;
    lines: Line[];
    thermal: string;
    lossLabel: string;
    newLabel: string;
    perWinter: string;
    months: string[];
    pct: string;
    pctLabel: string;
    savedLine: string;
    assumption: string;
    ctaTitle: string;
    ctaButton: string;
  }
> = {
  de: {
    hook: 'Was, wenn du\nWärme sehen\nkönntest?',
    lines: [
      {from: 3.3, to: 5.9, text: 'So sieht dein Haus\nim Winter aus.'},
      {from: 6.2, to: 9.8, text: 'Alte Fenster: Die Wärme\nentweicht an den Rändern.'},
      {from: 10.1, to: 14.1, text: 'Ein Winter: rund 3.500 kWh –\nnur über die Fenster.'},
      {from: 14.4, to: 17.1, text: 'Dann: neue Fenster.'},
      {from: 17.4, to: 20.8, text: 'Die Wärme bleibt drin.'},
    ],
    thermal: 'WÄRMEBILD',
    lossLabel: 'WÄRMEVERLUST ÜBER DIE FENSTER',
    newLabel: `NEUE FENSTER · Uw ${dec('de', U_NEW)}`,
    perWinter: 'pro Winter',
    months: ['NOV', 'DEZ', 'JAN', 'FEB', 'MÄR'],
    pct: `−${CALC.pct} %`,
    pctLabel: 'weniger Wärmeverlust\nüber die Fenster',
    savedLine: `Ersparnis ≈ ${fmt('de', CALC.saved)} kWh ≈ ${fmt('de', Math.round(CALC.savedEur / 10) * 10)} € pro Winter`,
    assumption: `Beispielrechnung: ${AREA_M2} m² Fensterfläche · Uw ${dec('de', U_OLD)} → ${dec('de', U_NEW)} W/m²K · ${fmt('de', HEAT_KH)} Heizgradstunden/Jahr · ${fmt('de', EUR_PER_KWH * 100)} ct/kWh · ${CALC.pct} % = (${dec('de', U_OLD)} − ${dec('de', U_NEW)}) / ${dec('de', U_OLD)}`,
    ctaTitle: 'Kostenloses Aufmaß\n& Angebot',
    ctaButton: 'Jetzt Nachricht schreiben',
  },
  tr: {
    hook: 'Isıyı\ngörebilseydin?',
    lines: [
      {from: 3.3, to: 5.9, text: 'Evin kışın\nböyle görünüyor.'},
      {from: 6.2, to: 9.8, text: 'Eski pencereler:\nIsı kenarlardan kaçıyor.'},
      {from: 10.1, to: 14.1, text: 'Bir kış: yaklaşık 3.500 kWh –\nsadece pencerelerden.'},
      {from: 14.4, to: 17.1, text: 'Sonra: yeni pencereler.'},
      {from: 17.4, to: 20.8, text: 'Isı içeride kalıyor.'},
    ],
    thermal: 'TERMAL GÖRÜNTÜ',
    lossLabel: 'PENCERELERDEN ISI KAYBI',
    newLabel: `YENİ PENCERELER · Uw ${dec('tr', U_NEW)}`,
    perWinter: 'kış başına',
    months: ['KAS', 'ARA', 'OCA', 'ŞUB', 'MAR'],
    pct: `−%${CALC.pct}`,
    pctLabel: 'pencerelerden kaynaklanan\nısı kaybında azalma',
    savedLine: `Tasarruf ≈ ${fmt('tr', CALC.saved)} kWh ≈ ${fmt('tr', Math.round(CALC.savedEur / 10) * 10)} € / kış`,
    assumption: `Örnek hesap: ${AREA_M2} m² pencere alanı · Uw ${dec('tr', U_OLD)} → ${dec('tr', U_NEW)} W/m²K · yılda ${fmt('tr', HEAT_KH)} ısıtma derece-saati · ${fmt('tr', EUR_PER_KWH * 100)} ct/kWh · %${CALC.pct} = (${dec('tr', U_OLD)} − ${dec('tr', U_NEW)}) / ${dec('tr', U_OLD)}`,
    ctaTitle: 'Ücretsiz ölçüm\nve teklif',
    ctaButton: 'Hemen mesaj yaz',
  },
};

// ---- Winter-Aktion (Flyer) – Bedingungen hier anpassen ----
export const PROMO = {
  pct: 35,
  de: {
    kicker: 'WINTER-AKTION',
    pct: '−35\u00a0%',
    on: 'auf alle Fenster',
    validity: 'Aktion gültig bis 01.12.2026. Details im persönlichen Angebot.',
    until: 'bis 01.12.2026',
    bullets: [
      'Kostenloses Aufmaß & Angebot',
      'Rund 70 % weniger Wärmeverlust über die Fenster*',
      `Neue Fenster mit Uw ${String(CALC.uNew).replace('.', ',')} W/m²K`,
    ],
    button: 'Jetzt Termin sichern',
    qr: 'Scannen &\nNachricht schreiben',
  },
  tr: {
    kicker: 'KIŞ KAMPANYASI',
    pct: '−%35',
    on: 'tüm pencerelerde',
    validity: 'Kampanya 01.12.2026’ya kadar geçerlidir. Detaylar kişisel teklifte.',
    until: '01.12.2026’ya kadar',
    bullets: [
      'Ücretsiz ölçüm ve teklif',
      'Pencerelerden ısı kaybında yaklaşık %70 azalma*',
      `Uw ${String(CALC.uNew).replace('.', ',')} W/m²K değerli yeni pencereler`,
    ],
    button: 'Hemen randevu al',
    qr: 'Tara ve\nmesaj yaz',
  },
};
