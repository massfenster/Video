"""Synthetisiert Musikbett + Soundeffekte rein per Code (numpy) -> public/audio/bed.wav

Timings kommen aus src/config.ts (hier gespiegelt). Keine Samples, keine Lizenzen.
"""
import os
import wave

import numpy as np

SR = 44100
DUR = 26.0
T = dict(thermal=2.6, leak=5.6, tl_start=9.2, tl_end=13.6, swap=13.8, cta=20.6)

n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(7)
out = np.zeros((n, 2))


def env(start, attack, hold, release):
    e = np.zeros(n)
    a0, a1 = int(start * SR), int((start + attack) * SR)
    h1 = int((start + attack + hold) * SR)
    r1 = int((start + attack + hold + release) * SR)
    e[a0:a1] = np.linspace(0, 1, a1 - a0)
    e[a1:h1] = 1
    e[h1:min(r1, n)] = np.linspace(1, 0, r1 - h1)[: min(r1, n) - h1]
    return e


def lowpass(x, cutoff):
    # einfacher One-Pole-Tiefpass (cutoff darf Array sein)
    a = np.exp(-2 * np.pi * np.broadcast_to(cutoff, x.shape) / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def add(sig, gain=1.0, pan=0.0):
    out[:, 0] += sig * gain * (1 - pan) / 2 * 2 ** 0.5
    out[:, 1] += sig * gain * (1 + pan) / 2 * 2 ** 0.5


# --- 1) Dunkles Pad (Akkord, wechselt nach dem Fenstertausch nach Dur) ---
def chord(freqs, amp):
    s = np.zeros(n)
    for k, f in enumerate(freqs):
        det = 1 + 0.002 * np.sin(2 * np.pi * 0.1 * t + k)
        s += np.sin(2 * np.pi * f * det * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t + k)
    return s * amp


minor = chord([55.0, 110.0, 130.81, 164.81], 0.06)  # A-Moll
major = chord([65.41, 130.81, 164.81, 196.0], 0.06)  # C-Dur
x_swap = np.clip((t - T['swap']) / 1.2, 0, 1)
pad = minor * (1 - x_swap) + major * x_swap
pad *= np.clip(t / 2.0, 0, 1) * (0.55 + 0.45 * np.clip((t - T['thermal']) / 2, 0, 1))
pad *= np.clip((DUR - t) / 1.0, 0, 1)
add(pad, 1.0)

# --- 2) Puls/Beat ab dem Wärmeleck, schneller im Zeitraffer ---
bpm = np.where((t > T['tl_start']) & (t < T['tl_end']), 150, 100)
phase = np.cumsum(bpm / 60 / SR)
beat_env = np.exp(-(phase % 1) * 14)
kick = np.sin(2 * np.pi * 50 * t + 6 * beat_env) * beat_env
gate = ((t > T['leak']) & (t < T['swap'])) | (t > T['swap'] + 1.0) & (t < T['cta'] + 4.5)
add(kick * gate * 0.35)

# Ticken (Uhr) im Zeitraffer
tick_phase = np.cumsum(np.where(t > T['tl_start'], 6 + (t - T['tl_start']) * 3, 0) / SR)
tick = rng.standard_normal(n) * np.exp(-(tick_phase % 1) * 60)
tick *= ((t > T['tl_start']) & (t < T['tl_end'])).astype(float)
add(tick * 0.05, pan=0.3)

# --- 3) Whoosh beim Umschalten auf Wärmebild + Riser vor dem Fenstertausch ---
noise = rng.standard_normal(n)
w1 = env(T['thermal'] - 0.6, 0.6, 0.0, 0.8)
add(lowpass(noise, 200 + 4000 * w1) * w1 * 0.35, pan=-0.2)
riser = env(T['tl_end'] - 2.5, 2.5, 0.0, 0.05)
add(lowpass(noise, 300 + 6000 * riser) * riser * 0.25, pan=0.2)
add(np.sin(2 * np.pi * (200 + 600 * riser) * t) * riser * 0.05)

# --- 4) Impacts ---
def impact(at, gain):
    d = np.clip(t - at, 0, None)
    on = (t >= at).astype(float)
    boom = np.sin(2 * np.pi * (40 + 80 * np.exp(-d * 20)) * d) * np.exp(-d * 3) * on
    crack = noise * np.exp(-d * 30) * on
    add((boom * 0.9 + crack * 0.25) * gain)


impact(T['thermal'], 0.6)
impact(T['swap'], 0.9)

# --- 5) "Klick" der neuen Fenster (8 kurze Klicks) ---
for i in range(8):
    at = T['swap'] + i * 0.07 + 0.15
    d = np.clip(t - at, 0, None)
    click = np.sin(2 * np.pi * 2400 * d) * np.exp(-d * 120) * (t >= at)
    add(click * 0.18, pan=(i / 7 - 0.5))

# --- 6) Glocke beim CTA ---
d = np.clip(t - T['cta'], 0, None)
bell = sum(np.sin(2 * np.pi * f * d) * np.exp(-d * k) for f, k in [(784, 2.2), (1568, 3.5), (2352, 5)])
add(bell * (t >= T['cta']) * 0.12)

# --- Mastern ---
out /= np.max(np.abs(out)) + 1e-9
out *= 0.89
os.makedirs('public/audio', exist_ok=True)
with wave.open('public/audio/bed.wav', 'wb') as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((out * 32767).astype('<i2').tobytes())
print('public/audio/bed.wav geschrieben')
