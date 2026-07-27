# Unity Dışa Aktarım Paketi — Galeri Simülatörü

Web prototipindeki (React/TypeScript) **dengelenmiş oyun verileri ve çekirdek mantık**,
Unity'de doğrudan kullanılabilir halde bu klasöre aktarıldı.

## İçerik

| Dosya | Ne işe yarar |
|---|---|
| `data.json` | 81 il (koordinatlı), 34 araç modeli, 13 arıza şablonu, 3 kredi paketi, 7 ayrıcalık, 7 başarım, kariyer/XP tablosu, isim havuzları ve TÜM denge sabitleri |
| `Scripts/GameData.cs` | `data.json`'u `JsonUtility` ile okuyan sınıflar + il arası karayolu mesafe formülü |
| `Scripts/Valuation.cs` | Araç değerleme motoru (gerçek değer vs. alıcının gördüğü değer) |
| `Scripts/Negotiation.cs` | Satıcı ve müşteri pazarlık yapay zekâsı (tur bazlı, Türkçe diyaloglarıyla) |

## Unity'de kurulum (5 dakika)

1. Unity Hub → yeni **3D (URP)** proje aç.
2. `Assets/Resources/` klasörü oluştur, `data.json`'u içine kopyala.
3. `Scripts/` içindeki üç `.cs` dosyasını `Assets/Scripts/GaleriSim/` altına kopyala.
4. Herhangi bir MonoBehaviour içinde:

```csharp
using GaleriSim.Data;
using GaleriSim.Sim;

TextAsset json = Resources.Load<TextAsset>("data");
GameDatabase db = JsonUtility.FromJson<GameDatabase>(json.text);

Debug.Log($"{db.cities.Length} il yüklendi");
Debug.Log($"İstanbul–Ankara: {db.RoadDistance(34, 6)} km");

// Pazarlık örneği:
var nego = SellerNego.Start(askingPrice: 500000, minPrice: 450000, mood: "normal");
NegoResult r = nego.Respond(430000);
Debug.Log($"{r.type}: {r.message} {r.price}");
```

## Taşınırken bilinçli olarak dışarıda bırakılanlar

- **Arıza → sürüş hissi eşlemesi**: Web'de `TestDrive.tsx` içindeki `effectOf()` fonksiyonu
  hangi arızanın sürüşte nasıl hissedileceğini tanımlar (çekme, zayıf fren, tekleme, hararet...).
  Unity'de bunlar araç fiziği parametrelerine bağlanmalı — `data.json`'daki
  `faultTemplates[].driveHint` metinleri ve `drivable` bayrağı aynen kullanılabilir.
- **Gün döngüsü / olaylar**: `src/game/state.tsx` END_DAY akışı ve `events.ts` — Unity'de
  GameManager'a taşınırken referans olarak web kaynak kodura bakın.
- **Marka isimleri**: `data.json`'daki gerçek marka/model adları (BMW, Tofaş vb.) yayınlanacak
  ticari üründe **lisans gerektirir** — mağazaya çıkmadan önce kurgusal adlarla değiştirin
  (tek yapmanız gereken `data.json`'u düzenlemek).

## Yeniden dışa aktarma

Web projesinde denge/veri değiştikçe şu komut bu klasörü tazeler:

```
npm run export:unity
```
