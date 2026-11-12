// Sprecherstimme per ElevenLabs erzeugen und exakt auf die Untertitel-Timings legen.
// Nutzung: node scripts/voice.mjs de   (oder: tr)
// Der API-Key wird in der Cloud-Umgebung vom Proxy eingesetzt; lokal: ELEVENLABS_API_KEY setzen.
// Danach in src/Root.tsx `voice: true` setzen.
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const lang = process.argv[2] ?? 'de';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB';
const KEY = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';

// Gleiche Texte wie in src/config.ts (Hook + Untertitel + CTA), Startzeit in Sekunden
const SCRIPT = {
  de: [
    [0.2, 'Was, wenn du Wärme sehen könntest?'],
    [2.8, 'So sieht dein Haus im Winter aus.'],
    [5.7, 'Alte Fenster. Die Wärme geht direkt raus.'],
    [9.3, 'Ein Winter. Über zweitausendfünfhundert Kilowattstunden. Einfach weg.'],
    [13.9, 'Dann: neue Fenster.'],
    [16.8, 'Die Wärme bleibt drin. Bis zu siebzig Prozent weniger Verlust.'],
    [20.8, 'Kostenloses Aufmaß und Angebot. Schreib uns jetzt.'],
  ],
  tr: [
    [0.2, 'Isıyı görebilseydin?'],
    [2.8, 'Evin kışın böyle görünüyor.'],
    [5.7, 'Eski pencereler. Isı doğrudan dışarı kaçıyor.'],
    [9.3, 'Bir kış. İki bin beş yüz kilovatsaatten fazla. Boşa gidiyor.'],
    [13.9, 'Sonra: yeni pencereler.'],
    [16.8, 'Isı içeride kalıyor. Yüzde yetmişe kadar daha az kayıp.'],
    [20.8, 'Ücretsiz ölçüm ve teklif. Hemen mesaj yaz.'],
  ],
}[lang];

const dir = 'out/vo_parts';
mkdirSync(dir, {recursive: true});
const parts = [];
for (const [i, [at, text]] of SCRIPT.entries()) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {'xi-api-key': KEY, 'content-type': 'application/json'},
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {stability: 0.45, similarity_boost: 0.8, style: 0.35},
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const file = `${dir}/${lang}_${i}.mp3`;
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  parts.push([at, file]);
  console.log('ok', file);
}

// Alle Teile an ihre Startzeit legen und zu einer Spur mischen
const args = ['-y'];
parts.forEach(([, f]) => args.push('-i', f));
const filters = parts.map(([at], i) => `[${i}]adelay=${Math.round(at * 1000)}:all=1[a${i}]`);
const mixIn = parts.map((_, i) => `[a${i}]`).join('');
args.push(
  '-filter_complex',
  `${filters.join(';')};${mixIn}amix=inputs=${parts.length}:normalize=0,apad=whole_dur=26[out]`,
  '-map', '[out]', '-t', '26', `public/audio/vo_${lang}.mp3`,
);
execFileSync('ffmpeg', args, {stdio: 'inherit'});
console.log(`public/audio/vo_${lang}.mp3 geschrieben`);
