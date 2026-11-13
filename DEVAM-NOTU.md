# Devam notu: MassFensterNRW projesi (13.11.2026)

Yeni bir sohbette Claude'a şunu yaz: **"DEVAM-NOTU.md dosyasını oku ve kaldığımız yerden devam et."**

## Firma
- MassFensterNRW, sahibi Burak Yılmaz, Hanns-Martin-Schleyer-Str. 12, 51503 Rösrath
- +49 179 4755318 · info@massfensternrw.de · Instagram/TikTok @massfensternrw
- Bölge: **NRW**. Dil: Almanca (ana), Türkçe.
- Tüm firma bilgileri: `website/src/data/firma.ts`; reklam ayarları: `src/config.ts`

## Biten işler
- **Reklam videoları** (Remotion, kodla üretildi): `exports/massfenster-ad-v3-de.mp4` (Almanca seslendirmeli, Piper/Thorsten) ve `-tr.mp4`
- **Hesap örneği** (videoda, flyer'da, sitede aynı): 15 m², Uw 2,8 → 0,8, pencerelerden ısı kaybı 3.528 → 1.008 kWh, −71 %, ≈300 €/yıl (0,12 €/kWh)
- **Winter-Aktion:** %35, yalnızca pencerelerde, 01.12.2026'ya kadar geçerli
- **Flyer ve kampanya görselleri:** `exports/flyer/`, `exports/kampagne/`
- **Sosyal medya profil seti:** `exports/profil/PROFIL-ANLEITUNG.md` (biyografiler, profil resmi, Facebook kapağı, öne çıkan hikâye kapakları)
- **Metricool:** gönderiler zamanlandı (marka 7924947, Europe/Berlin), durumları Pending
- **Reels açıklama metni** (Almanca, 5 etiketli) sohbette yazıldı. Henüz Metricool'a aktarılmadı.
- **Yeni web sitesi** (Astro, statik, çerez yok): `website/` klasörü, yüklemeye hazır paket `exports/website/neu/massfensternrw-website.zip`, kılavuz `exports/website/neu/YAYIN-KILAVUZU-checkdomain.md`
- **Eski sitenin yedeği** (yalnızca herkese açık içerik): `exports/website/yedek-eski-site-2026-11-13.zip`

## Açık işler
1. **Yeni siteyi checkdomain'e yüklemek.** Kullanıcı panele kendisi girer, ekran görüntüsü gönderir, Claude adım adım yönlendirir. **Şifre sohbete yazılmaz.**
   - Eski WordPress girişi: massfensternrw.de/mass/ (yeni siteyi yüklemek için değil, yalnızca yedek için)
   - İsteğe bağlı: WordPress'te UpdraftPlus ile tam yedek (veritabanı + dosyalar)
   - Sıra: `massfensternrw-neu` klasörü → zip içeriğini yükle → `neu.massfensternrw.de` + SSL → test → alan adının hedef klasörünü değiştir → Google Search Console
2. Impressum ve Datenschutz için hukuki kontrol önerilir.
3. 01.12.2026'dan sonra Instagram biyografisini kalıcı sürüme geri al (bkz. PROFIL-ANLEITUNG.md).
4. İsteğe bağlı: siteye önce/sonra fotoğrafları ve müşteri yorumları ekle; Türkçe seslendirme.

## Teknik notlar
- Render: `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
- Ses: `scripts/sfx.py` (efekt sesleri), `scripts/voice_piper.py` (seslendirme; Thorsten modeli ~/voices altında, yeni bir ortamda yeniden indirilmesi gerekir)
- Türkçe Piper sesi (dfki) ticari kullanıma izin vermiyor, kullanılmamalı.
- Git dalı: `claude/viral-video-code-ads-9xet54`
