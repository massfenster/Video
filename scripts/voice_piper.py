"""Offline-Sprecher mit Piper (Thorsten high, CC0 -> kommerziell nutzbar).

Nutzung:  python3 scripts/voice_piper.py de [/pfad/zu/de_DE-thorsten-high.onnx]
Erzeugt public/audio/vo_de.mp3, jede Zeile exakt auf die Untertitel-Startzeit gelegt.
Modell: https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz (Fallback)
Besser (22 kHz): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/high
"""
import os
import subprocess
import sys
import tempfile

LANG = sys.argv[1] if len(sys.argv) > 1 else 'de'
MODEL = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser('~/voices/de_DE-thorsten-high.onnx')
DUR = 26.0

# (Startzeit s, spätestes Ende s, Text) – Zeiten passend zu src/config.ts
SCRIPT = {
    'de': [
        (0.3, 2.9, 'Was, wenn du Wärme sehen könntest?'),
        (3.4, 5.9, 'So sieht dein Haus im Winter aus.'),
        (6.3, 9.8, 'Alte Fenster. Die Wärme entweicht an den Rändern.'),
        (10.2, 14.5, 'Ein Winter: rund dreitausendfünfhundert Kilowattstunden, nur über die Fenster.'),
        (14.6, 17.2, 'Dann: neue Fenster.'),
        (17.4, 21.2, 'Die Wärme bleibt drin: rund siebzig Prozent weniger Verlust über die Fenster.'),
        (21.3, 25.0, 'Kostenloses Aufmaß und Angebot. Schreib uns jetzt.'),
    ],
}[LANG]


def duration(path):
    out = subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]
    )
    return float(out)


def synth(text, path, length_scale):
    subprocess.run(
        [sys.executable, '-m', 'piper', '-m', MODEL, '-f', path, '--length-scale', str(length_scale),
         '--sentence-silence', '0.12'],
        input=text.encode(), check=True, capture_output=True,
    )


tmp = tempfile.mkdtemp()
parts = []
for i, (start, end, text) in enumerate(SCRIPT):
    path = f'{tmp}/{i}.wav'
    scale = 0.95
    synth(text, path, scale)
    # zu lang für das Zeitfenster? -> schneller sprechen (max. 25 % schneller)
    while duration(path) > end - start and scale > 0.75:
        scale -= 0.05
        synth(text, path, scale)
    print(f'{start:5.1f}s  {duration(path):4.2f}s / {end - start:4.2f}s  (x{scale:.2f})  {text}')
    parts.append((start, path))

args = ['ffmpeg', '-v', 'error', '-y']
for _, p in parts:
    args += ['-i', p]
chains = [f'[{i}]adelay={int(s * 1000)}:all=1[a{i}]' for i, (s, _) in enumerate(parts)]
mix = ''.join(f'[a{i}]' for i in range(len(parts)))
# Sprecher-Kette: auf 44,1 kHz, Rumpeln weg, Präsenz anheben, komprimieren, Lautheit normalisieren
chain = (
    f'{";".join(chains)};{mix}amix=inputs={len(parts)}:normalize=0,'
    'aresample=44100,highpass=f=90,equalizer=f=3000:t=q:w=1.2:g=3,'
    'acompressor=threshold=-20dB:ratio=3:attack=5:release=80,'
    f'loudnorm=I=-15:TP=-1.5:LRA=7,apad=whole_dur={DUR}[out]'
)
args += ['-filter_complex', chain, '-map', '[out]', '-t', str(DUR), '-ac', '2',
         '-b:a', '192k', f'public/audio/vo_{LANG}.mp3']
subprocess.run(args, check=True)
print(f'public/audio/vo_{LANG}.mp3 geschrieben')
