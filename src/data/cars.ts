import type { ModelDef } from "../types";

// basePrice: temiz, sıfıra yakın referans değeri (₺, 2026 yaklaşık)
export const MODELS: ModelDef[] = [
  // Ekonomi
  { brand: "Tofaş", model: "Şahin 1.6", segment: "klasik", basePrice: 420000, minYear: 1990, maxYear: 2002, fuels: ["benzin", "lpg"], weight: 5 },
  { brand: "Tofaş", model: "Doğan SLX", segment: "klasik", basePrice: 480000, minYear: 1990, maxYear: 2001, fuels: ["benzin", "lpg"], weight: 4 },
  { brand: "Renault", model: "Toros", segment: "klasik", basePrice: 390000, minYear: 1991, maxYear: 2000, fuels: ["benzin", "lpg"], weight: 4 },
  { brand: "Fiat", model: "Egea 1.4 Fire", segment: "ekonomi", basePrice: 1150000, minYear: 2016, maxYear: 2026, fuels: ["benzin", "lpg", "dizel"], weight: 10 },
  { brand: "Renault", model: "Clio 1.0 TCe", segment: "ekonomi", basePrice: 1250000, minYear: 2013, maxYear: 2026, fuels: ["benzin", "lpg"], weight: 9 },
  { brand: "Renault", model: "Symbol 1.5 dCi", segment: "ekonomi", basePrice: 850000, minYear: 2009, maxYear: 2021, fuels: ["dizel", "benzin"], weight: 7 },
  { brand: "Hyundai", model: "i20 1.4 MPI", segment: "ekonomi", basePrice: 1200000, minYear: 2012, maxYear: 2026, fuels: ["benzin"], weight: 7 },
  { brand: "Opel", model: "Corsa 1.2", segment: "ekonomi", basePrice: 1180000, minYear: 2010, maxYear: 2026, fuels: ["benzin"], weight: 6 },
  { brand: "Dacia", model: "Sandero Stepway", segment: "ekonomi", basePrice: 1100000, minYear: 2013, maxYear: 2026, fuels: ["benzin", "lpg"], weight: 6 },
  { brand: "Peugeot", model: "208 1.2 PureTech", segment: "ekonomi", basePrice: 1350000, minYear: 2013, maxYear: 2026, fuels: ["benzin"], weight: 5 },
  // Orta
  { brand: "Toyota", model: "Corolla 1.6", segment: "orta", basePrice: 1750000, minYear: 2005, maxYear: 2026, fuels: ["benzin", "lpg", "hibrit"], weight: 9 },
  { brand: "Honda", model: "Civic 1.6 Eco", segment: "orta", basePrice: 1850000, minYear: 2006, maxYear: 2026, fuels: ["benzin", "lpg"], weight: 8 },
  { brand: "Renault", model: "Megane 1.3 TCe", segment: "orta", basePrice: 1550000, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 8 },
  { brand: "Volkswagen", model: "Golf 1.4 TSI", segment: "orta", basePrice: 1900000, minYear: 2008, maxYear: 2026, fuels: ["benzin"], weight: 7 },
  { brand: "Ford", model: "Focus 1.5 Ti-VCT", segment: "orta", basePrice: 1500000, minYear: 2008, maxYear: 2025, fuels: ["benzin", "dizel"], weight: 7 },
  { brand: "Opel", model: "Astra 1.4 Turbo", segment: "orta", basePrice: 1450000, minYear: 2008, maxYear: 2025, fuels: ["benzin"], weight: 6 },
  { brand: "Skoda", model: "Octavia 1.5 TSI", segment: "orta", basePrice: 1800000, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 6 },
  { brand: "Fiat", model: "Egea Cross 1.5 Hybrid", segment: "orta", basePrice: 1500000, minYear: 2021, maxYear: 2026, fuels: ["hibrit"], weight: 5 },
  { brand: "Togg", model: "T10X V2", segment: "suv", basePrice: 2300000, minYear: 2023, maxYear: 2026, fuels: ["elektrik"], weight: 4 },
  // Üst
  { brand: "Volkswagen", model: "Passat 1.5 TSI", segment: "ust", basePrice: 2600000, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 6 },
  { brand: "BMW", model: "3.20i", segment: "ust", basePrice: 3400000, minYear: 2005, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 5 },
  { brand: "Mercedes-Benz", model: "C200 AMG", segment: "ust", basePrice: 3700000, minYear: 2008, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 5 },
  { brand: "Audi", model: "A4 40 TFSI", segment: "ust", basePrice: 3500000, minYear: 2008, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 4 },
  { brand: "Volvo", model: "S60 T4", segment: "ust", basePrice: 2900000, minYear: 2012, maxYear: 2026, fuels: ["benzin"], weight: 3 },
  { brand: "Skoda", model: "Superb 1.5 TSI", segment: "ust", basePrice: 2500000, minYear: 2012, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 4 },
  // SUV
  { brand: "Nissan", model: "Qashqai 1.3 DIG-T", segment: "suv", basePrice: 1950000, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 7 },
  { brand: "Dacia", model: "Duster 1.3 TCe", segment: "suv", basePrice: 1450000, minYear: 2012, maxYear: 2026, fuels: ["benzin", "dizel", "lpg"], weight: 7 },
  { brand: "Hyundai", model: "Tucson 1.6 T-GDI", segment: "suv", basePrice: 2400000, minYear: 2015, maxYear: 2026, fuels: ["benzin", "hibrit"], weight: 5 },
  { brand: "Kia", model: "Sportage 1.6 CRDi", segment: "suv", basePrice: 2300000, minYear: 2014, maxYear: 2026, fuels: ["dizel", "benzin"], weight: 5 },
  { brand: "Peugeot", model: "3008 1.2 PureTech", segment: "suv", basePrice: 2350000, minYear: 2016, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 5 },
  // Ticari
  { brand: "Fiat", model: "Doblo 1.6 Multijet", segment: "ticari", basePrice: 1150000, minYear: 2008, maxYear: 2025, fuels: ["dizel"], weight: 6 },
  { brand: "Ford", model: "Transit Custom", segment: "ticari", basePrice: 1900000, minYear: 2013, maxYear: 2026, fuels: ["dizel"], weight: 4 },
  { brand: "Volkswagen", model: "Transporter 2.0 TDI", segment: "ticari", basePrice: 2200000, minYear: 2010, maxYear: 2026, fuels: ["dizel"], weight: 4 },
  { brand: "Renault", model: "Kangoo Multix", segment: "ticari", basePrice: 950000, minYear: 2008, maxYear: 2021, fuels: ["dizel"], weight: 4 },
];

export const COLORS = [
  "Beyaz",
  "Siyah",
  "Gri",
  "Gümüş",
  "Kırmızı",
  "Lacivert",
  "Mavi",
  "Bordo",
  "Yeşil",
  "Kahverengi",
];
