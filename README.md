# Fenster-Reklamvideoları (tamamen kodla)

Instagram Reels, Facebook ve TikTok için 9:16 reklam videoları. Hiç stok video ve hazır yapay zekâ klibi yok:
3D sahne (Three.js), metinler/HUD (React/Remotion) ve müzik/efektler (numpy ile sentez) tamamen koddan üretiliyor.

## Video 1: "Isıyı görebilseydin?" / "Was, wenn du Wärme sehen könntest?"

| Saniye | Olay |
|---|---|
| 0–2,6 | Hook sorusu, karlı gece, low-poly ev |
| 2,6 | Flaş + termal kameraya geçiş |
| 5,6–9,2 | Eski pencerelerden ısı partikülleri kaçıyor, kWh/€ sayacı başlıyor |
| 9,2–13,6 | Hızlandırılmış "1 kış", sayaç 2.520 kWh'e çıkıyor |
| 13,8 | Darbe sesi: yeni pencereler yerine oturuyor |
| 15–20,6 | Sızıntı durdu, ev soğuk mavi, Uw 2,8 → 0,8 |
| 20,6–26 | CTA: ücretsiz ölçüm ve teklif + dipnot + baştaki soruya dönüş (loop) |

Viral formül (analiz edilen referans videolardan): soru hook'u, ekranda sürekli sayaç, adım adım tırmanış,
hikâyeyle değişen görsel stil, en fazla iki satırlık altyazılar, HUD etiketleri, sonda ters köşe ve loop.

## Kullanım

```bash
npm install
npm run sfx            # müzik + efektleri üretir -> public/audio/bed.wav
npm run studio         # tarayıcıda canlı önizleme ve düzenleme
npm run render         # Almanca  -> out/fenster-ad-de.mp4
npm run render:tr      # Türkçe   -> out/fenster-ad-tr.mp4
node scripts/voice.mjs de   # ElevenLabs seslendirmesi (API anahtarı gerekir)
```

Seslendirmeden sonra `src/Root.tsx` dosyasında `voice: true` yap.
Bulut ortamında Chrome indirilemiyorsa `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` ekle.

## Neyi nereden değiştirebilirsin

- **Firma adı, kullanıcı adı, renkler:** `src/config.ts` → `BRAND`
- **Tüm metinler (DE/TR):** `src/config.ts` → `TEXT`
- **Rakamlar / örnek hesap:** `src/config.ts` → `CALC` (dipnotta şeffaf şekilde gösteriliyor)
- **Zamanlama:** `src/config.ts` → `T` (değişirse `scripts/sfx.py` içindeki `T` de güncellenmeli)
- **3D ev, kamera, partiküller:** `src/scene/House.tsx`
