# massfensternrw.de – İnceleme ve iyileştirme listesi

İnceleme tarihi: 13.11.2026 · Test: iPhone 13 görünümü (mobil), ana sayfa
Altyapı: **WordPress + Elementor**, tema "Rife Free", SEO: "All in One SEO", form: "WPForms"

## Ölçümler

| | Sonuç | Hedef |
|---|---|---|
| Yüklenme süresi (mobil, "load") | **7,2 sn** | < 3 sn |
| Toplam boyut | **≈ 3,9 MB**, 76 istek | < 1,5 MB |
| Görseller | 2560 px genişliğinde fotoğraflar 310 px'te gösteriliyor | gösterilen boyutta, WebP |
| Alternatif metni (alt) olmayan görsel | **17 / 17** | 0 |
| H1 başlığı | **yok** | 1 adet |
| Tıklanabilir telefon / e-posta / WhatsApp | **yok** | hepsi |

---

## 🔴 Öncelik 1: Müşteri kaybettiren sorunlar

### 1. Mobilde başlıklar ekrandan taşıyor
"FENSTERLÖSUNG…", "MASSFENSTERN…", "UNSERE DIENSTLEISTU…" sağdan kesiliyor.
**Çözüm:** Elementor → başlık widget'ı → 📱 mobil görünüm → yazı boyutu **28–32 px**.

### 2. Telefon, e-posta ve WhatsApp tıklanamıyor
Numara sadece düz metin olarak duruyor; mobilde dokununca arama başlamıyor.
**Çözüm:**
- Telefon linki: `tel:+491794755318`
- E-posta linki: `mailto:info@massfensternrw.de`
- **Sabit WhatsApp butonu** (sağ alt köşe), örneğin ücretsiz "Click to Chat" eklentisiyle. Link:
  `https://wa.me/491794755318?text=Hallo%2C%20ich%20m%C3%B6chte%20ein%20kostenloses%20Aufma%C3%9F%20anfragen.`

### 3. Açılış bölümü (hero) teklif ve buton içermiyor
Şu an: daktilo efektiyle "FENSTER TÜR ROLLADEN" ve İngilizce bir "Show Me More" butonu var.
**Yeni metin önerisi:**
- **H1:** `Fenster nach Maß – deutschlandweit`
- Alt satır: `Kostenloses Aufmaß, unverbindliches Angebot und Energieberater für BAFA- und KfW-Förderung.`
- Buton 1 (turkuaz): `Kostenloses Aufmaß anfragen` → WhatsApp linki
- Buton 2 (çerçeveli): `Jetzt anrufen` → `tel:+491794755318`

### 4. Site yavaş (7,2 sn)
- Fotoğrafları küçült ve WebP'ye çevir (örn. "Converter for Media" ya da Elementor görsel optimizasyonu).
- Kullanılmayan efektleri kapat (daktilo yazısı, slider, çok sayıda giriş animasyonu).
- Bir önbellek eklentisi kur (örn. "LiteSpeed Cache" ya da "WP Super Cache"; hangisinin uygun olduğu hostinge bağlı).

### 5. Giriş animasyonları içeriği gizliyor
Otomatik testimde sayfanın büyük bölümleri **boş** göründü, çünkü içerik ancak kaydırınca beliriyor. Eski telefonlarda ve Google'ın tarayıcısında bu risk oluşturur.
**Çözüm:** Elementor → bölümler → Gelişmiş → Hareket efektleri → **Giriş animasyonu: yok**.

---

## 🟠 Öncelik 2: Yazım ve dil hataları (güven kaybettiriyor)

| Şu an | Doğrusu |
|---|---|
| KontaKt (menü) | Kontakt |
| WIr erledIgen Ihre ArbeIt zuverlässIg und schnell. | Wir erledigen Ihre Arbeit zuverlässig und schnell. |
| Unsere DIenstleIstungen | Unsere Dienstleistungen |
| EntscheIden SIe selbst. Den Rest überlassen SIe uns. | Entscheiden Sie selbst. Den Rest überlassen Sie uns. |
| Burak YILMAZ - FirmenInhaber | Burak Yılmaz – Firmeninhaber |
| Rolladen | Rollladen (yeni yazım kuralı: üç "l") |
| ADRESS | Adresse |
| Show Me More | Mehr erfahren |
| Montage Free | Fachgerechte Montage *(montaj gerçekten ücretsizse: „Kostenlose Montage")* |
| Form: Message / Phone / Submit | Nachricht / Telefon / Absenden |
| Mon. - Fri. 08.00 - 18.00 | Mo.–Fr. 08:00–18:00 Uhr |
| Januar 29, 2019 (blog tarihleri) | 29. Januar 2019 → WordPress → Ayarlar → Genel → Tarih biçimi: `j. F Y` |

Not: Blog yazıları **2019** tarihli görünüyor; site bakımsız izlenimi veriyor. Tarihleri güncelle ya da yeni yazılar ekle (örn. "BAFA-Förderung für neue Fenster 2026").

---

## 🟡 Öncelik 3: Google'da bulunma (SEO)

All in One SEO → Ana sayfa:
- **SEO başlığı** (51/60):
  ```
  Fenster nach Maß – deutschlandweit | MassFensterNRW
  ```
- **Meta açıklama** (139/155). Şu anki otomatik metin anlamsız ("FENSTER TÜR ROLLADEN MASSFENSTERNRW Show Me More…"):
  ```
  Fenster, Türen & Rollläden nach Maß: kostenloses Aufmaß, unverbindliches Angebot und Energieberater für BAFA/KfW-Förderung. Jetzt anfragen!
  ```
- **Alternatif metinler:** Her görsele kısa bir açıklama ekle, örn. `Monteur justiert neues Kunststofffenster`.
- **Bölge tutarlılığı:** Site "in NRW" diyor, sosyal medya artık "deutschlandweit". Birine karar verip ikisini eşitle.
- **Google Business Profile:** Rösrath adresiyle ücretsiz işletme profili aç ya da mevcut profili güncelle (harita, yorumlar, telefon). Yerel aramada en çok etkiyi bu yapar.

---

## 🟢 Öncelik 4: Daha fazla talep için

- **Kampanya şeridi** (sayfanın en üstü, 01.12.2026'ya kadar):
  `❄️ Winter-Aktion: 35 % Rabatt auf Fenster – gültig bis 01.12.2026. Jetzt kostenloses Aufmaß anfragen →`
  Bunun için hazır **kampanya görselini** kullanabilirsin: `exports/kampagne/winter-aktion-1080x1350-de.png`
- **"Förderung" bölümü:**
  > **Förderung nutzen – mit unserem Energieberater**
  > Neue Fenster können über BAFA bzw. KfW gefördert werden. Unser Energieberater unterstützt Sie bei Antrag und Nachweisen. Sprechen Sie uns beim kostenlosen Aufmaß darauf an.
  *(Teşvik oranı ya da tutarı yazmadım. Bunlar sık değişiyor, yanlış tutar yazmak hukuki risk yaratır.)*
- **Referanslar:** Öncesi/sonrası fotoğrafları ve 3–5 müşteri yorumu.
- **"Isıyı görebilseydin?" videosunu** ana sayfaya ekle (dosya: `exports/massfenster-ad-v3-de.mp4`).

---

## ⚖️ Kontrol (hukuki, uzman gözüyle)
- İletişim formunda Datenschutz onay kutusu var mı?
- Çerez bandı Instagram embed'ini ve Google Fonts'u kapsıyor mu?
- Kampanya koşulları (yalnızca pencereler, 01.12.2026'ya kadar) sitede de yazıyor mu?
