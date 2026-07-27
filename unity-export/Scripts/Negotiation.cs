using System;

// src/game/negotiation.ts'nin birebir C# portu.
// Satıcı pazarlığı (araç alırken) + müşteri pazarlığı (araç satarken).
// UI'dan bağımsız saf mantık: dilediğiniz diyalog ekranına bağlayın.

namespace GaleriSim.Sim
{
    public enum NegoResultType { Accept, Counter, Reject, Walkaway }

    public struct NegoResult
    {
        public NegoResultType type;
        public int price;       // Accept/Counter için geçerli
        public string message;  // Türkçe diyalog cümlesi
    }

    // ---- SATICI ile pazarlık (araç alırken) ----

    [Serializable]
    public class SellerNego
    {
        public int askingPrice;   // ilan fiyatı
        public int minPrice;      // satıcının gizli taban fiyatı
        public int lastCounter;   // satıcının son söylediği fiyat
        public int patience;
        public int round;

        static readonly Random Rng = new Random();

        /// mood: "acil" | "normal" | "sabirli"
        public static SellerNego Start(int askingPrice, int minPrice, string mood)
        {
            return new SellerNego
            {
                askingPrice = askingPrice,
                minPrice = minPrice,
                lastCounter = askingPrice,
                patience = mood == "sabirli" ? 5 : 4,
                round = 0,
            };
        }

        public NegoResult Respond(int offer)
        {
            round++;

            if (offer >= lastCounter)
                return new NegoResult { type = NegoResultType.Accept, price = Math.Min(offer, lastCounter), message = "Anlaştık, hayırlı olsun!" };

            // Çok düşük teklif satıcıyı kızdırır
            if (offer < minPrice * 0.78)
            {
                patience -= 2;
                if (patience <= 0)
                    return new NegoResult { type = NegoResultType.Walkaway, message = "Bu fiyata araba değil bisiklet alırsın. Ben bu işte yokum!" };
                return new NegoResult { type = NegoResultType.Reject, message = "Ciddi olun lütfen, bu fiyat olmaz. Düzgün bir teklif bekliyorum." };
            }

            if (offer >= minPrice)
            {
                double acceptChance = 0.35 + (offer - minPrice) / Math.Max(1.0, askingPrice - minPrice);
                if (Rng.NextDouble() < Math.Min(0.95, acceptChance))
                    return new NegoResult { type = NegoResultType.Accept, price = offer, message = "Eh, hadi senin için olsun. Hayırlı olsun!" };
            }

            patience--;
            if (patience <= 0)
            {
                if (offer >= minPrice)
                    return new NegoResult { type = NegoResultType.Accept, price = offer, message = "Tamam, daha fazla uzatmayalım. Anlaştık." };
                return new NegoResult { type = NegoResultType.Walkaway, message = "Anlaşamayacağız, kolay gelsin." };
            }

            // Karşı teklif: minPrice altına inmez
            double t = Math.Max(minPrice, offer + (lastCounter - offer) * (0.35 + Rng.NextDouble() * 0.25));
            int counter = (int)Math.Round(Math.Min(lastCounter - 1000, t) / 1000.0) * 1000;
            lastCounter = counter;
            string[] messages =
            {
                "O fiyata olmaz ama şöyle yapalım:",
                "Araç temiz, kıyamam ama hadi:",
                "Son fiyat şu olsun:",
                "Biraz daha açın, şöyle anlaşalım:",
            };
            return new NegoResult { type = NegoResultType.Counter, price = counter, message = messages[Math.Min(messages.Length - 1, round - 1)] };
        }
    }

    // ---- MÜŞTERİ ile pazarlık (araç satarken) ----

    [Serializable]
    public class BuyerNego
    {
        public int maxPay;     // müşterinin gizli üst limiti
        public int lastOffer;  // müşterinin son teklifi
        public int patience;
        public int round;

        static readonly Random Rng = new Random();

        /// style: "normal" | "siki" | "acele" | "titiz"
        public static BuyerNego Start(int openingOffer, int maxPay, string style)
        {
            return new BuyerNego
            {
                maxPay = maxPay,
                lastOffer = openingOffer,
                patience = style == "acele" ? 3 : style == "siki" ? 5 : 4,
                round = 0,
            };
        }

        /// Oyuncu fiyat söyler, müşteri cevap verir.
        public NegoResult Respond(int counterPrice)
        {
            round++;

            if (counterPrice <= lastOffer)
                return new NegoResult { type = NegoResultType.Accept, price = counterPrice, message = "Anlaştık! Hemen kaparoyu vereyim." };

            if (counterPrice > maxPay * 1.3)
            {
                patience -= 2;
                if (patience <= 0)
                    return new NegoResult { type = NegoResultType.Walkaway, message = "Bu fiyat çok uçuk, iyi günler..." };
                return new NegoResult { type = NegoResultType.Reject, message = "Yok yok, bu rakamlar bizi aşar. İndirim yoksa ben gideyim." };
            }

            if (counterPrice <= maxPay)
            {
                double acceptChance = 0.3 + (maxPay - counterPrice) / Math.Max(1.0, maxPay * 0.15);
                if (Rng.NextDouble() < Math.Min(0.95, acceptChance))
                    return new NegoResult { type = NegoResultType.Accept, price = counterPrice, message = "Tamamdır, el sıkışalım!" };
            }

            patience--;
            if (patience <= 0)
            {
                if (counterPrice <= maxPay * 1.02)
                    return new NegoResult { type = NegoResultType.Accept, price = Math.Min(counterPrice, maxPay), message = "Hadi tamam, anlaştık." };
                return new NegoResult { type = NegoResultType.Walkaway, message = "Ben biraz daha bakınacağım, kolay gelsin." };
            }

            // Müşteri teklifini yükseltir ama maxPay'i geçmez
            double t = Math.Min(maxPay, lastOffer + (counterPrice - lastOffer) * (0.30 + Rng.NextDouble() * 0.25));
            int newOffer = (int)Math.Round(Math.Max(lastOffer + 1000, t) / 1000.0) * 1000;
            lastOffer = Math.Min(newOffer, maxPay);
            string[] messages =
            {
                "Biraz daha inerseniz şöyle veririm:",
                "Eşimle konuştum, en fazla şu olur:",
                "Son teklifim bu:",
                "Hadi ortada buluşalım:",
            };
            return new NegoResult { type = NegoResultType.Counter, price = lastOffer, message = messages[Math.Min(messages.Length - 1, round - 1)] };
        }
    }
}
