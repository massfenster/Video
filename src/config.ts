// Alle Texte, Zahlen und Timings an einer Stelle.
// Neue Variante = Texte hier ändern, Code bleibt gleich.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 26;

export const BRAND = {
  name: 'DEIN FENSTERBAU', // <- Firmenname
  handle: '@deinfensterbau', // <- Instagram/TikTok-Name
  accent: '#ff7a1a',
  cool: '#5ab8ff',
};

// Beispielrechnung (ehrlich & nachvollziehbar, wird im Video als Fußnote gezeigt):
// 15 m² Fensterfläche, Uw alt 2,8 -> neu 0,8 W/m²K (ΔU = 2,0)
// ~84.000 Kh Heizgradstunden/Jahr (DE) -> 15 * 2,0 * 84.000 Wh ≈ 2.520 kWh
// 2,0 / 2,8 ≈ 71 % weniger Wärmeverlust durchs Fenster
export const CALC = {
  kwhPerWinter: 2520,
  eurPerKwh: 0.12,
  uOld: '2,8',
  uNew: '0,8',
  reductionPct: 70,
};

// Szenen-Timing in Sekunden
export const T = {
  hookEnd: 2.6,
  thermalOn: 2.6, // Umschalten auf Wärmebild
  leakStart: 5.6,
  timelapseStart: 9.2,
  timelapseEnd: 13.6,
  swap: 13.8, // neue Fenster
  sealed: 15.2,
  ctaStart: 20.6,
};

type Line = {from: number; to: number; text: string};
export type Lang = 'de' | 'tr';

export const TEXT: Record<
  Lang,
  {
    hook: string;
    lines: Line[];
    hudTop: string;
    hudThermal: string;
    hudCounter: string;
    hudTimelapse: string;
    hudSealed: string;
    hudSealedSub: string;
    ctaTitle: string;
    ctaSub: string;
    ctaButton: string;
    footnote: string;
    loop: string;
  }
> = {
  de: {
    hook: 'Was, wenn du\nWärme sehen könntest?',
    lines: [
      {from: 2.8, to: 5.5, text: 'So sieht dein Haus\nim Winter aus.'},
      {from: 5.7, to: 9.1, text: 'Alte Fenster.\nDie Wärme geht direkt raus.'},
      {from: 9.3, to: 13.5, text: 'Ein Winter.\nÜber 2.500 kWh. Einfach weg.'},
      {from: 13.8, to: 16.6, text: 'Dann: neue Fenster.'},
      {from: 16.8, to: 20.4, text: 'Die Wärme bleibt drin.\nBis zu 70 % weniger Verlust.'},
    ],
    hudTop: 'SIMULATION · WÄRMEBILD',
    hudThermal: 'WÄRMEBILD AKTIV',
    hudCounter: 'VERLORENE HEIZENERGIE',
    hudTimelapse: 'ZEITRAFFER · 1 WINTER',
    hudSealed: 'VERLUST GESTOPPT',
    hudSealedSub: `Uw ${CALC.uOld} → ${CALC.uNew} W/m²K`,
    ctaTitle: 'Kostenloses Aufmaß\n& Angebot',
    ctaSub: 'Neue Fenster. Ab dem ersten Winter sparen.',
    ctaButton: 'Jetzt Nachricht schreiben',
    footnote:
      'Beispielrechnung: 15 m² Fensterfläche, Uw 2,8 → 0,8 W/m²K, ca. 84.000 Heizgradstunden/Jahr, 0,12 €/kWh.',
    loop: 'Was, wenn du Wärme sehen könntest?',
  },
  tr: {
    hook: 'Isıyı\ngörebilseydin?',
    lines: [
      {from: 2.8, to: 5.5, text: 'Evin kışın\nböyle görünüyor.'},
      {from: 5.7, to: 9.1, text: 'Eski pencereler.\nIsı doğrudan dışarı kaçıyor.'},
      {from: 9.3, to: 13.5, text: 'Bir kış.\n2.500 kWh’den fazla. Boşa gidiyor.'},
      {from: 13.8, to: 16.6, text: 'Sonra: yeni pencereler.'},
      {from: 16.8, to: 20.4, text: 'Isı içeride kalıyor.\n%70’e kadar daha az kayıp.'},
    ],
    hudTop: 'SİMÜLASYON · TERMAL GÖRÜNTÜ',
    hudThermal: 'TERMAL KAMERA AKTİF',
    hudCounter: 'KAYBEDİLEN ISI ENERJİSİ',
    hudTimelapse: 'HIZLANDIRILMIŞ · 1 KIŞ',
    hudSealed: 'KAYIP DURDURULDU',
    hudSealedSub: `Uw ${CALC.uOld} → ${CALC.uNew} W/m²K`,
    ctaTitle: 'Ücretsiz ölçüm\nve teklif',
    ctaSub: 'Yeni pencereler. İlk kıştan itibaren tasarruf.',
    ctaButton: 'Hemen mesaj yaz',
    footnote:
      'Örnek hesap: 15 m² pencere alanı, Uw 2,8 → 0,8 W/m²K, yılda ~84.000 ısıtma derece-saati, 0,12 €/kWh.',
    loop: 'Isıyı görebilseydin?',
  },
};
