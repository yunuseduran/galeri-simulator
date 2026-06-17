# 🚗 Galeri Simülatörü

Türkiye temalı ikinci el araba galerisi simülasyonu. Tarayıcıda çalışır, ilerleme otomatik kaydedilir.

## Nasıl Çalıştırılır

```
npm install   (sadece ilk seferde)
npm run dev
```

Sonra tarayıcıda **http://localhost:5180** adresini açın.

## Oyun Özellikleri

- **81 il pazarı** — Türkiye'nin her ilinden ilanlar; aracı incelemek için o ile gitmek gerekir (yol masrafı + saat). Mesafeler gerçek koordinatlardan hesaplanır.
- **Ekspertiz & gizli arızalar** — Bazı satıcılar tramer gizler; ekspertiz gerçeği ortaya çıkarır. Ekspertizsiz alınan araç eve gelince arıza çıkarabilir!
- **3 dakikalık test sürüşü** (mini oyun) — Ok tuşları/WASD ile sür. Arızalı araç sürüşte kendini ele verir: direksiyon çekmesi, zayıf fren, motor teklemesi, hararet, mavi duman... Kaza yaparsan satıcıya hasar ödersin.
- **Pazarlık sistemi** — Hem satıcıyla hem müşteriyle tur bazlı teklif/karşı teklif. Çok düşük teklif satıcıyı masadan kaldırır; sabır biter, fırsat kaçar.
- **Atölye** — Parça tamiri (motor, şanzıman, fren...), arıza giderme, detaylı temizlik, koltuk kılıfı, jant, multimedya, cam filmi, seramik kaplama. Hepsi aracın değerini artırır ama gün sürer.
- **Müşteri tipleri** — Aceleci (yüksek öder), sıkı pazarlıkçı, titiz (gizli arızayı yakalarsa itibarını yakar!).
- **Günlük döngü** — Her gün yeni ilanlar, yeni müşteriler, piyasa dalgalanmaları, rastgele arızalar. Haftada bir kira ödenir.
- **İtibar** — Sorunsuz satışlar itibar kazandırır → daha çok, daha cömert müşteri. Arızalı araç kakalarsan itibarın düşer.
- **Toptancı** — Nakde sıkışırsan aracı anında değerinin ~%78'ine satabilirsin.
- **SVG Türkiye haritası** — Seyahat ekranında tıklanabilir harita; ilan olan iller yeşil rozetle görünür.
- **Ses efektleri** — WebAudio ile sentezlenmiş sesler: satış zili, mezat tokmağı, test sürüşünde hıza göre değişen motor sesi, kaza... Üst bardan kapatılabilir (🔊/🔇).
- **Banka (🏦 Ofis)** — 3 kredi paketi (büyükleri itibar ister). Taksitler her gün sonu otomatik çekilir; erken kapatma itibar kazandırır, kasayı eksiye düşürmek itibar yakar.
- **Mezat günleri** — Her 5 günde bir rastgele bir ilde banka mezadı. Bir gün önceden duyurulur; açılış fiyatları piyasanın yarısı ama ekspertiz/test sürüşü yok ve rakip galericiler canlı teklif yükseltir.
- **Ekip** — Usta (atölye %15 ucuz + 1 gün hızlı), Satış Danışmanı (daha çok ve daha cömert müşteri), Detaycı (araçlar tozlanmaz, her gün parlar). Maaşlar haftalık ödenir.
- **🏆 Galericiler Ligi** — 8 yapay zekâlı rakip galeri her gün alıp satar; sıralama toplam kâra göredir. Lig sekmesinde tablo, sekme rozetinde anlık sıranız. 1 numaraya çıkınca büyük kutlama!
- **Görsel efektler** — Satışta konfeti yağmuru, animasyonlu para sayacı ve uçan +/- tutarlar, gün geçiş ekranı, önemli olaylar için köşe bildirimleri (toast), yumuşak modal/kart animasyonları.
- **🎖️ Sonsuz kariyer** — Oyun bitmez! Her eylem XP verir (alım +40, satış +60 ve kâra göre bonus, mezat +60, tamir +15...). Seviyeler sonsuzdur; her seviye büyüyen para ödülü, unvan ("Çaylak" → "Oto Baronu" → "Otomotiv Efsanesi N") ve belirli seviyelerde **kalıcı ayrıcalıklar** getirir: ucuz ekspertiz (S3), yakıt indirimi (S5), cömert müşteriler (S8), sanayi indirimi (S10), ünlü galeri (S12), mezat nakliyesi yarı fiyat (S15), vergi indirimi (S20).
- **Kademeli başarımlar** — Satış Ustası, Koleksiyoncu, Kâr Makinesi, Anadolu Gezgini (81 il), Mezat Kurdu, Usta Eller, Yol Canavarı... Her kademe para + XP öder; eşikler sonsuza kadar büyür, ödüller de öyle.

## Teknoloji

Vite + React + TypeScript. Kayıt: tarayıcı localStorage (otomatik).
