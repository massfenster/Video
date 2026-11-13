# Yeni siteyi checkdomain'de yayına alma

**Yöntem:** Eski WordPress sitesi **silinmez**. Yeni site ayrı bir klasöre konur, önce bir test adresinde denenir, sonra alan adı yeni klasöre yönlendirilir. Bir sorun çıkarsa alan adını eski klasöre geri yönlendirmek yeterli.

> ℹ️ checkdomain'in menü adları bu kılavuzdakilerden biraz farklı olabilir. Bulamadığın bir adım olursa checkdomain destek hattına "Wie ändere ich das Zielverzeichnis meiner Domain?" diye sorabilirsin.

> ✅ **E-posta etkilenmez.** info@massfensternrw.de posta kutusu web klasöründen bağımsızdır. Bu işlemde DNS ya da MX kayıtlarına **dokunma**.

İhtiyacın olan dosya: `massfensternrw-website.zip`

---

## 1. Yedek al (5–10 dk)

1. checkdomain → **Kundenmenü** (müşteri paneli) → Hosting paketin.
2. **Dosyalar:** FTP ile ya da paneldeki dosya yöneticisiyle WordPress klasörünü (içinde `wp-content`, `wp-config.php` olan klasör) **bilgisayarına indir**.
3. **Veritabanı:** Paneldeki **phpMyAdmin** → WordPress veritabanı → **Exportieren** → `.sql` dosyasını indir.

İkisi de bilgisayarında durduğu sürece eski site her zaman geri getirilebilir.

## 2. Yeni klasör oluştur ve dosyaları yükle

1. Hosting alanında yeni bir klasör aç: `massfensternrw-neu`
2. `massfensternrw-website.zip` dosyasını bilgisayarında **aç (unzip)**.
3. **İçindeki** her şeyi (`index.html`, `img`, `fonts`, `media`, `impressum` …) `massfensternrw-neu` klasörüne yükle.
   - Yükleme için FileZilla programı ve Kundenmenü'deki **FTP-Zugang** bilgileri gerekir.
   - Panelde zip dosyası açma özelliği varsa: zip'i yükle, sunucuda aç.
   - ⚠️ `index.html` doğrudan `massfensternrw-neu` klasörünün içinde olmalı, alt klasörde değil.

## 3. Test adresi (subdomain) oluştur

1. Kundenmenü → **Domains** → massfensternrw.de → **Subdomain anlegen**: `neu`
2. Hedef (Ziel / Verzeichnis) olarak `massfensternrw-neu` klasörünü seç.
3. Bu subdomain için **SSL (https)** özelliğini aç.
4. Birkaç dakika sonra telefondan ve bilgisayardan aç: **https://neu.massfensternrw.de**

Kontrol listesi:
- [ ] Sayfa açılıyor, ev görseli ve video görünüyor
- [ ] "WhatsApp" butonu WhatsApp'ı hazır mesajla açıyor
- [ ] "Anrufen" butonu telefonda aramayı başlatıyor
- [ ] Impressum ve Datenschutz açılıyor, bilgiler doğru

## 4. Ana alan adını yeni siteye çevir

1. Kundenmenü → Domains → **massfensternrw.de** (ve **www.massfensternrw.de**) → Hedef klasör: `massfensternrw-neu`
2. Birkaç dakika bekle, https://massfensternrw.de adresini aç.
3. Eski linkler otomatik yönlendirilir (örn. `/datenschutzerklaerung/` → `/datenschutz/`).

**Geri dönmek gerekirse:** Hedef klasörü eski WordPress klasörüne geri ayarla.

## 5. Sonrası

- **Google Search Console** (ücretsiz): Alan adını ekle → `https://massfensternrw.de/sitemap.xml` adresini gönder. Google yeni sayfayı daha hızlı tanır.
- **Eski WordPress:** 2–4 hafta yedek olarak dursun, sonra kaldır. Kullanılmayan bir WordPress'i güncellemeden bırakmak güvenlik riski oluşturur.
- **Kış aksiyonu:** 01.12.2026'dan sonra sitede kendiliğinden kaybolur, bir şey yapman gerekmez.
