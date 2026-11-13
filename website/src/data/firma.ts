// Alle Firmendaten an EINER Stelle. Quelle: bisherige Website + Angaben des Inhabers.
// ⚠️ Adresse bitte bestätigen: Impressum alt = Ulmenallee 19, 50999 Köln; Startseite alt = Hans-Martin-Schleyer-Str. 12, 51503 Rösrath.

export const FIRMA = {
  name: 'MassFensterNRW',
  inhaber: 'Burak Yılmaz',
  rechtsform: 'Einzelunternehmen',
  strasse: 'Ulmenallee 19',
  plz: '50999',
  ort: 'Köln',
  land: 'Deutschland',
  telefon: '+49 179 4755318',
  telefonHref: 'tel:+491794755318',
  email: 'info@massfensternrw.de',
  web: 'https://massfensternrw.de',
  oeffnungszeiten: 'Mo.–Fr. 08:00–18:00 Uhr',
  steuernummer: '204/5398/3720',
  ustId: 'DE332656922',
  handwerkskammer: 'Handwerkskammer zu Köln',
  betriebsnummer: '1221132',
  region: 'NRW',
  instagram: 'https://www.instagram.com/massfensternrw/',
  tiktok: 'https://www.tiktok.com/@massfensternrw',
  facebook: 'https://www.facebook.com/100632662081243',
};

const waText = 'Hallo, ich möchte ein kostenloses Aufmaß anfragen.';
export const WHATSAPP = `https://wa.me/491794755318?text=${encodeURIComponent(waText)}`;

// Winter-Aktion: wird nach Ablauf automatisch ausgeblendet (siehe Layout-Skript)
export const AKTION = {
  aktiv: true,
  bis: '2026-12-01T23:59:59+01:00',
  bisText: '01.12.2026',
  rabatt: '35 %',
  text: 'Winter-Aktion: 35 % Rabatt auf Fenster',
  bedingung: 'Rabatt gilt nur für Fenster. Aktion gültig bis 01.12.2026.',
};

// Beispielrechnung (identisch mit Video/Flyer)
export const RECHNUNG = {
  flaeche: 15,
  uAlt: 2.8,
  uNeu: 0.8,
  gradstunden: 84000,
  preis: 0.12,
};
export const kwh = (u: number) => (RECHNUNG.flaeche * u * RECHNUNG.gradstunden) / 1000;
