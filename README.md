# Fenster-Reklamvideoları (tamamen kodla)

Instagram Reels, Facebook ve TikTok için 9:16 reklam videoları. Hiç stok video ve hazır yapay zekâ klibi yok:
3D sahne (Three.js), metinler/HUD (React/Remotion) ve müzik/efektler (numpy ile sentez) tamamen koddan üretiliyor.

## Video 1: "Isıyı görebilseydin?" / "Was, wenn du Wärme sehen könntest?" (v2)

| Saniye | Olay |
|---|---|
| 0–3 | Karlı gece, sabit kadraj, hafif kamera yaklaşması, açılış sorusu |
| 3–6 | Kontrollü ışık geçişiyle aynı kadraj termal görünüme dönüyor, pencere kenarları sıcak |
| 6–14 | Kenarlardan ince amber ısı akışları; sayaç kasımdan marta 3.528 kWh'e çıkıyor |
| 14,3 | Tok bir sesle yeni pencereler oturuyor, sızıntı hızla duruyor |
| 15–21 | Sayaç 1.008 kWh'e iniyor; "−%71, pencerelerden kaynaklanan ısı kaybı" |
| 21–26 | Logo, "Ücretsiz ölçüm ve teklif", tek buton; açılış kadrajına dönüş (loop) |

Palet: dış mekân #101C30, kar #EDF2F5, soğuk yüzeyler indigo/koyu mavi, ısı #FFB547 ve #FFE19A.
Tipografi: yalnızca Inter, 500 ve 700.

## Rakamlar nereden geliyor (src/config.ts → CALC)

Pencerelerden ısı kaybı / kış = pencere alanı × Uw × ısıtma derece-saati

| | Hesap | Sonuç |
|---|---|---|
| Eski pencereler (Uw 2,8) | 15 m² × 2,8 W/m²K × 84.000 Kh | **3.528 kWh ≈ 423 €** |
| Yeni pencereler (Uw 0,8) | 15 m² × 0,8 W/m²K × 84.000 Kh | **1.008 kWh ≈ 121 €** |
| Tasarruf | 3.528 − 1.008 | **2.520 kWh ≈ 302 € → "≈ 300 €"** |
| Yüzde | (2,8 − 0,8) / 2,8 | **%71 → "yaklaşık %70"** |

Yüzde, **yalnızca pencerelerden kaynaklanan ısı kaybını** anlatır, evin toplam ısıtma maliyetini değil.
Fiyat: 0,12 €/kWh. Tüm değerler tek yerden hesaplanır; birini değiştirirsen video, sayaç ve dipnot birlikte güncellenir.

## Kullanım

```bash
npm install
npm run sfx            # müzik + efektleri üretir -> public/audio/bed.wav
python3 scripts/voice_piper.py de   # ücretsiz Almanca seslendirme (Thorsten, CC0)
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
