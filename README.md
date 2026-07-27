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

- **🏗️ Tesis sistemi (BenelOil tarzı, CANLI SAHNE)** — Galeri artık hareketli bir oyun sahnesidir: yoldan trafik akar, pompaya müşteri yanaşıp yakıt alır, yıkamada köpükler uçuşur, atölyede iş varsa kıvılcım çıkar, müşteriler vitrine yürür, bulutlar süzülür ve saat ilerledikçe gün batar, ışıklar yanar. Vitrindeki araçlar gerçek envanterinizdir. Binaya tıklayıp yönetirsiniz: her dükkanı ayrı ayrı inşa edip yükseltirsiniz. **Vitrin** (araç kapasitesi), **Tamirhane** (yoksa dış sanayi %30 zamlı; Sv.2 %10, Sv.3 %20 indirim + 1 gün hız), **Oto Yıkama** (günlük gelir + araçları her gün parlatır), **Yedek Parça** (gelir + tamir indirimi), **Kafeterya** (müşteri cömertliği + sabrı), **Akaryakıt Pompası** (en yüksek gelir + yol masrafı indirimi), **Ek Otopark** (+1'er kapasite). Dükkan cirosu her gün sonunda kasaya girer; "Tesis Kralı" başarımı toplam seviyeye ödül verir.
- **🎬 Her sekmede canlı sahne** — Tüm sekmelerin tepesinde oyun durumuna bağlı animasyonlu bir sahne oynar: Galerim'de spot ışıklı showroom (gerçek envanteriniz podyumda, fiyat etiketleri sallanır), İlanlar'da gerçek ilanları dönen dev reklam panolu cadde, Atölye'de liftte tamir edilen araç ve kıvılcımlar (iş yoksa usta çay içer), Müşteriler'de kapı önünde volta atan gerçek müşteriler (düşünce balonlarıyla; kimse yoksa çöl çalısı yuvarlanır), Ofis'te canlı grafikli bilgisayar + kasayla orantılı para destesi + çalışan masaları, Lig'de **kâra göre konumlanan yarış pisti**, Kariyer'de XP'yle zirveye tırmanan araç, Defter'de yazılan muhasebe defteri + KÂRDA/ZARARDA damgası.
- **👤 Hesap & giriş** — Kullanıcı adı + şifreyle kayıt ol / giriş yap. Oturum tarayıcıda saklanır; tarayıcıyı kapatsan bile açık kalır ve **kaldığın yerden devam edersin**. Her kullanıcının ilerlemesi ayrı kaydedilir.
- **👥 Oyuncular Ligi** — Aynı cihazda kayıtlı tüm oyuncular toplam kâra göre sıralanır. Lig sekmesinde "Oyuncular Ligi" (gerçek hesaplar) ve "Yapay Zekâ Rakipler" olarak iki görünüm; galeri, merkez, seviye, satış, kâr ve itibar detaylarıyla.

## 📱 Android (APK)

Oyun Capacitor ile Android uygulamasına sarılmıştır ve dokunmatik ekrana uyarlanmıştır
(44px+ dokunma hedefleri, tek sütun düzen, test sürüşünde iki başparmak pedal kontrolü).

```
npm run build          # web derlemesi
npx cap sync android   # dist'i Android projesine kopyalar
cd android
java -classpath gradle\wrapper\gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain assembleDebug
```

- Çıktı: `android/app/build/outputs/apk/debug/app-debug.apk` — telefona kopyalayıp kurun
  (kurulumda "bilinmeyen kaynaklara izin ver" gerekir).
- Capacitor 8, Java 21 ister. Proje içinde `.tooling/jdk-21.0.11+10` altında taşınabilir
  Temurin JDK 21 vardır; `android/gradle.properties` → `org.gradle.java.home` oraya bakar.
  (`gradlew.bat` PowerShell'de "classpath" hatası verirse yukarıdaki java komutunu kullanın.)
- Android Studio kuruluysa `npx cap open android` deyip Run tuşuyla da telefona yükleyebilirsiniz.

## 🎮 Unity'ye Geçiş

`unity-export/` klasöründe Unity'ye hazır paket vardır: `data.json` (81 il, 34 model, arızalar,
krediler, başarımlar ve tüm denge sabitleri) + C# portları (`GameData.cs`, `Valuation.cs`,
`Negotiation.cs`). Kurulum adımları: `unity-export/README.md`. Veri değişince yenilemek için:
`npm run export:unity`.

## Teknoloji

Vite + React + TypeScript. Kayıt: tarayıcı localStorage (otomatik, hesap bazlı).
Mobil sarmalayıcı: Capacitor 8 (Android).
