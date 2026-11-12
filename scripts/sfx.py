"""Ruhiges Sounddesign rein per Code (numpy) -> public/audio/bed.wav

- leiser Nachtwind + weiches Pad (vor dem Tausch Moll, danach Dur)
- Lichtübergang ins Wärmebild: weiches Anschwellen
- Wärmeverlust: leises Luftrauschen, folgt der Stärke des Lecks
- Fenstertausch: kurzer, satter "Einsetz"-Ton
- CTA: sanfte Glocke, danach ruhiger Ausklang
Timings spiegeln src/config.ts (T).
"""
import os
import wave

import numpy as np

SR = 44100
DUR = 26.0
T = dict(thermal=3.0, leak=6.0, winter=10.0, full=13.2, swap=14.3, cta=21.0, loop=25.2)

n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(11)
out = np.zeros((n, 2))


def ramp(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def onepole(x, cutoff):
    """Tiefpass (cutoff skalar oder Array) – vektorisiert in Blöcken."""
    cut = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def add(sig, gain=1.0, pan=0.0):
    out[:, 0] += sig * gain * np.sqrt((1 - pan) / 2) * np.sqrt(2)
    out[:, 1] += sig * gain * np.sqrt((1 + pan) / 2) * np.sqrt(2)


noise_l = rng.standard_normal(n)
noise_r = rng.standard_normal(n)

# 1) Nachtwind (sehr leise, durchgehend)
wind_cut = 250 + 120 * np.sin(2 * np.pi * 0.07 * t)
wind = onepole(noise_l, wind_cut)
add(wind * 0.5, pan=-0.3)
add(onepole(noise_r, wind_cut * 0.9) * 0.5, pan=0.3)

# 2) Pad: A-Moll(add9) -> nach dem Tausch C-Dur(add9), weich und leise
def chord(freqs):
    s = np.zeros(n)
    for k, f in enumerate(freqs):
        det = 1 + 0.0015 * np.sin(2 * np.pi * (0.08 + k * 0.01) * t + k)
        s += np.sin(2 * np.pi * f * det * t) * (0.6 if f > 300 else 1.0)
    return s


minor = chord([110.0, 164.81, 220.0, 246.94, 261.63])
major = chord([130.81, 196.0, 261.63, 293.66, 329.63])
x = np.clip((t - T['swap']) / 1.5, 0, 1)
pad = (minor * (1 - x) + major * x) * 0.02
pad *= ramp([(0, 0.5), (2.5, 0.7), (T['thermal'], 1.0), (T['cta'], 1.0), (DUR, 0.75)])
add(pad)

# 3) Lichtübergang: weiches Anschwellen (gefiltertes Rauschen + tiefer Ton)
sw = ramp([(T['thermal'] - 0.6, 0), (T['thermal'] + 0.2, 1), (T['thermal'] + 1.4, 0)])
add(onepole(noise_r, 300 + 1500 * sw) * sw * 0.9)
add(np.sin(2 * np.pi * 73.4 * t) * sw * 0.08)

# 4) Wärmeverlust: leises Luftrauschen (Bandpass ~ 700–2500 Hz), folgt dem Leck
leak = ramp([(T['leak'], 0), (T['leak'] + 1.0, 0.7), (T['winter'], 0.8), (T['full'], 1.0),
             (T['swap'], 1.0), (T['swap'] + 0.5, 0)])
flutter = 0.75 + 0.25 * np.sin(2 * np.pi * 0.9 * t) * np.sin(2 * np.pi * 0.37 * t)
air = onepole(noise_l, 2500) - onepole(noise_l, 700)
add(air * leak * flutter * 0.55, pan=0.15)

# 5) Fenster setzen: kurzer, satter Ton – tiefer Puls + kurzer Anschlag
d = np.clip(t - T['swap'], 0, None)
on = (t >= T['swap']).astype(float)
thump = np.sin(2 * np.pi * (58 + 40 * np.exp(-d * 30)) * d) * np.exp(-d * 11) * on
knock = (onepole(noise_r, 1400) - onepole(noise_r, 300)) * np.exp(-d * 55) * on
add(thump * 0.55 + knock * 1.1)
# leise, kurze Rastgeräusche der weiteren Fenster
for i in range(1, 8):
    at = T['swap'] + i * 0.035
    dd = np.clip(t - at, 0, None)
    click = np.sin(2 * np.pi * 1200 * dd) * np.exp(-dd * 140) * (t >= at)
    add(click * 0.025, pan=(i / 7 - 0.5) * 0.6)

# 6) CTA: sanfte Glocke
d = np.clip(t - T['cta'], 0, None)
bell = sum(np.sin(2 * np.pi * f * d) * np.exp(-d * k) * g for f, k, g in [(523.25, 1.6, 1), (1046.5, 2.8, 0.35), (1569.8, 4.0, 0.15)])
add(bell * (t >= T['cta']) * 0.05)

# Mastern: weich ein-/ausblenden, damit der Loop nahtlos ist
out *= ramp([(0, 0.0), (0.4, 1.0), (DUR - 0.5, 1.0), (DUR, 0.0)])[:, None]
out /= np.max(np.abs(out)) + 1e-9
out *= 0.7
os.makedirs('public/audio', exist_ok=True)
with wave.open('public/audio/bed.wav', 'wb') as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((out * 32767).astype('<i2').tobytes())
print('public/audio/bed.wav geschrieben')
