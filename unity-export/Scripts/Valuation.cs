using System;
using System.Collections.Generic;
using System.Linq;
using GaleriSim.Data;

// src/game/valuation.ts'nin birebir C# portu.
// Web prototipinde dengelenmiş formüller — değiştirmeden kullanın,
// oynanış hissi aynı kalsın.

namespace GaleriSim.Sim
{
    public enum PartKey { Motor, Sanziman, Fren, Suspansiyon, Lastik, Aku, Klima }

    [Serializable]
    public class Fault
    {
        public string id;
        public PartKey part;
        public string label;
        public int repairCost;   // ₺
        public int valueHit;     // gerçek değerden düşen ₺
        public bool drivable;
        public string driveHint;
    }

    [Serializable]
    public class Cosmetics
    {
        public bool seatCover;
        public bool rims;
        public bool multimedia;
        public bool tint;
        public bool ceramic;
    }

    [Serializable]
    public class Car
    {
        public string id;
        public string brand;
        public string model;
        public string segment;
        public int year;
        public int km;
        public string color;
        public string fuel;
        public bool automatic;
        public int basePrice;
        /// PartKey enum sırasıyla 0-100 kondisyon
        public float[] parts = new float[7];
        public int paintedPanels;
        public int changedPanels;
        public int tramer;
        public List<Fault> hiddenFaults = new List<Fault>();
        public List<Fault> knownFaults = new List<Fault>();
        public Cosmetics cosmetics = new Cosmetics();
        public float cleanliness; // 0-100
    }

    public static class Valuation
    {
        // valuation.ts PART_WEIGHTS ile aynı sıra: motor, sanziman, fren, suspansiyon, lastik, aku, klima
        static readonly float[] PartWeights = { 0.32f, 0.20f, 0.12f, 0.12f, 0.08f, 0.06f, 0.10f };

        public static int ExpectedKm(Balance bal, int year)
            => Math.Max(5000, (bal.currentYear - year) * bal.expectedKmPerYear);

        /// Aracın GERÇEK piyasa değeri (gizli arızalar dahil).
        public static int CarValue(Balance bal, Car car)
        {
            double v = car.basePrice;

            // Yaş amortismanı
            int age = bal.currentYear - car.year;
            v *= Math.Max(bal.minDepreciation, Math.Pow(bal.yearlyDepreciation, age));

            // Km sapması
            double exp = ExpectedKm(bal, car.year);
            double kmRatio = car.km / exp;
            if (kmRatio > 1) v *= Math.Max(0.72, 1 - (kmRatio - 1) * 0.18);
            else v *= Math.Min(1.12, 1 + (1 - kmRatio) * 0.10);

            // Parça kondisyonu -> 0.65 - 1.04 çarpanı
            double cond = 0;
            for (int i = 0; i < 7; i++) cond += car.parts[i] * PartWeights[i];
            v *= 0.65 + (cond / 100.0) * 0.39;

            // Boyalı / değişen paneller
            v *= 1 - car.paintedPanels * 0.012 - car.changedPanels * 0.03;

            // Tramer kaydı
            if (car.tramer > 0)
            {
                double ratio = Math.Min(0.5, car.tramer / Math.Max(1.0, v));
                v *= 1 - ratio * 0.45;
            }

            // Arızalar (gizli + bilinen)
            foreach (Fault f in car.hiddenFaults) v -= f.valueHit;
            foreach (Fault f in car.knownFaults) v -= f.valueHit;

            // Kozmetik artılar
            if (car.cosmetics.seatCover) v += Math.Min(25000, v * 0.015);
            if (car.cosmetics.rims) v += Math.Min(35000, v * 0.02);
            if (car.cosmetics.multimedia) v += Math.Min(20000, v * 0.012);
            if (car.cosmetics.tint) v += Math.Min(8000, v * 0.005);
            if (car.cosmetics.ceramic) v += Math.Min(30000, v * 0.018);

            // Temizlik
            v *= 0.96 + (car.cleanliness / 100.0) * 0.06;

            return Math.Max(30000, (int)Math.Round(v / 1000.0) * 1000);
        }

        /// Alıcıların gördüğü değer: gizli arızaları bilmezler.
        public static int PerceivedValue(Balance bal, Car car)
        {
            List<Fault> hidden = car.hiddenFaults;
            car.hiddenFaults = new List<Fault>();
            int v = CarValue(bal, car);
            car.hiddenFaults = hidden;
            return v;
        }

        public static float AvgCondition(Car car)
        {
            float cond = 0;
            for (int i = 0; i < 7; i++) cond += car.parts[i] * PartWeights[i];
            return cond;
        }

        public static string ConditionLabel(float score)
        {
            if (score >= 90) return "Çok iyi";
            if (score >= 75) return "İyi";
            if (score >= 55) return "Orta";
            if (score >= 35) return "Yıpranmış";
            return "Kötü";
        }
    }
}
