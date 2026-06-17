using System;
using System.Linq;
using UnityEngine;

// data.json'un birebir C# karşılığı.
// Kullanım:
//   TextAsset json = Resources.Load<TextAsset>("data");
//   GameDatabase db = JsonUtility.FromJson<GameDatabase>(json.text);
// Not: JsonUtility sözlük desteklemez; bu yüzden her şey dizi olarak modellendi.

namespace GaleriSim.Data
{
    [Serializable]
    public class GameDatabase
    {
        public Meta meta;
        public Balance balance;
        public CityDef[] cities;
        public ModelDef[] models;
        public string[] colors;
        public FaultTemplate[] faultTemplates;
        public StaffDef[] staff;
        public LoanOffer[] loanOffers;
        public PerkDef[] perks;
        public AchievementDef[] achievements;
        public Career career;
        public NamePools names;
        public Labels labels;

        public CityDef CityByPlate(int plate) => cities.First(c => c.plate == plate);

        /// İki il arası yaklaşık karayolu mesafesi (km) — web prototipiyle aynı formül
        public int RoadDistance(int plateA, int plateB)
        {
            if (plateA == plateB) return 0;
            CityDef a = CityByPlate(plateA);
            CityDef b = CityByPlate(plateB);
            const double R = 6371.0;
            double dLat = (b.lat - a.lat) * Math.PI / 180.0;
            double dLon = (b.lon - a.lon) * Math.PI / 180.0;
            double la = a.lat * Math.PI / 180.0;
            double lb = b.lat * Math.PI / 180.0;
            double h = Math.Pow(Math.Sin(dLat / 2), 2)
                     + Math.Cos(la) * Math.Cos(lb) * Math.Pow(Math.Sin(dLon / 2), 2);
            double straight = 2 * R * Math.Asin(Math.Sqrt(h));
            return (int)Math.Round(straight * balance.roadDistanceFactor);
        }
    }

    [Serializable] public class Meta { public string game; public string exportedAt; public string source; public string note; }

    [Serializable]
    public class Balance
    {
        public int currentYear;
        public int travelCostPerKm;
        public int transportCostPerKm;
        public int expertiseCostBase;
        public int expertiseCostPerkLevel3;
        public float expertiseRevealChance;
        public int maxListings;
        public int newListingsPerDayMin;
        public int newListingsPerDayMax;
        public int auctionPeriodDays;
        public float auctionStartPriceMin;
        public float auctionStartPriceMax;
        public float wholesaleRatio;
        public DifficultyMoney startingMoney;
        public DifficultyMoney weeklyExpenseBase;
        public int weeklyExpensePerSlot;
        public SlotUpgrade[] gallerySlotUpgrades;
        public float yearlyDepreciation;
        public float minDepreciation;
        public int expectedKmPerYear;
        public PartWeight[] partWeights;
        public int testDriveDurationSec;
        public float roadDistanceFactor;
        public int avgTravelSpeedKmh;
    }

    [Serializable] public class DifficultyMoney { public int kolay; public int normal; public int zor; }
    [Serializable] public class SlotUpgrade { public int fromSlots; public int toSlots; public int cost; }
    [Serializable] public class PartWeight { public string part; public float weight; }

    [Serializable] public class CityDef { public int plate; public string name; public float lat; public float lon; }

    [Serializable]
    public class ModelDef
    {
        public string brand;
        public string model;
        public string segment;   // ekonomi | orta | ust | suv | ticari | klasik
        public int basePrice;    // sıfıra yakın referans değeri (₺)
        public int minYear;
        public int maxYear;
        public string[] fuels;   // benzin | dizel | lpg | hibrit | elektrik
        public int weight;       // ilan üretiminde olasılık ağırlığı
    }

    [Serializable]
    public class FaultTemplate
    {
        public string part;      // motor | sanziman | fren | suspansiyon | lastik | aku | klima
        public string label;
        public float costPctMin; // tamir maliyeti, basePrice yüzdesi
        public float costPctMax;
        public float valuePctMin; // değer kaybı, basePrice yüzdesi
        public float valuePctMax;
        public bool drivable;     // test sürüşünde fark edilebilir mi
        public string driveHint;  // sürüşte gösterilecek ipucu metni
    }

    [Serializable] public class StaffDef { public string role; public string label; public string emoji; public int weeklySalary; public string desc; }
    [Serializable] public class LoanOffer { public string key; public string name; public int principal; public float interestPct; public int termDays; public int minReputation; }
    [Serializable] public class PerkDef { public int level; public string emoji; public string label; }

    [Serializable]
    public class AchievementDef
    {
        public string id;
        public string emoji;
        public string name;
        public string unit;
        public int[] thresholds; // sonrası: son eşik * 2.2^n (sonsuz), finite ise biter
        public bool finite;
        public string metricKey; // C# tarafında switch ile istatistiğe bağlanır
    }

    [Serializable] public class Career { public LevelRow[] levels; }
    [Serializable] public class LevelRow { public int level; public int xpToNext; public int reward; public string title; }

    [Serializable] public class NamePools { public string[] first; public string[] last; public string[] gallerySuffixes; }
    [Serializable] public class Labels { public KeyLabel[] parts; public KeyLabel[] segments; public KeyLabel[] fuels; public KeyLabel[] cosmetics; }
    [Serializable] public class KeyLabel { public string key; public string label; }
}
