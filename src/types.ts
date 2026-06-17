// ---- Temel oyun tipleri ----

export type PartKey =
  | "motor"
  | "sanziman"
  | "fren"
  | "suspansiyon"
  | "lastik"
  | "aku"
  | "klima";

export const PART_LABELS: Record<PartKey, string> = {
  motor: "Motor",
  sanziman: "Şanzıman",
  fren: "Frenler",
  suspansiyon: "Süspansiyon",
  lastik: "Lastikler",
  aku: "Akü",
  klima: "Klima",
};

export const PART_KEYS: PartKey[] = [
  "motor",
  "sanziman",
  "fren",
  "suspansiyon",
  "lastik",
  "aku",
  "klima",
];

export type Segment = "ekonomi" | "orta" | "ust" | "suv" | "ticari" | "klasik";

export const SEGMENT_LABELS: Record<Segment, string> = {
  ekonomi: "Ekonomi",
  orta: "Orta Sınıf",
  ust: "Üst Sınıf",
  suv: "SUV",
  ticari: "Ticari",
  klasik: "Klasik",
};

export interface ModelDef {
  brand: string;
  model: string;
  segment: Segment;
  /** Sıfır km / temiz referans değeri (₺, 2026) */
  basePrice: number;
  minYear: number;
  maxYear: number;
  fuels: Fuel[];
  weight: number; // ilanlarda çıkma olasılığı ağırlığı
}

export type Fuel = "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";
export const FUEL_LABELS: Record<Fuel, string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  lpg: "LPG",
  hibrit: "Hibrit",
  elektrik: "Elektrik",
};

export type Gear = "manuel" | "otomatik";

export interface Fault {
  id: string;
  part: PartKey;
  label: string; // ör. "Motor yağ yakıyor"
  /** Tamir maliyeti (₺) */
  repairCost: number;
  /** Aracın gerçek değerinden düşen miktar (₺) */
  valueHit: number;
  /** Test sürüşünde fark edilebilir mi? */
  drivable: boolean;
  /** Test sürüşü ipucu mesajı */
  driveHint: string;
}

export interface Cosmetics {
  seatCover: boolean; // koltuk kılıfı / döşeme yenileme
  rims: boolean; // jant
  multimedia: boolean; // multimedya sistemi
  tint: boolean; // cam filmi
  ceramic: boolean; // seramik kaplama
}

export const COSMETIC_LABELS: Record<keyof Cosmetics, string> = {
  seatCover: "Döşeme / Koltuk Kılıfı",
  rims: "Çelik Jant Seti",
  multimedia: "Multimedya Sistemi",
  tint: "Cam Filmi",
  ceramic: "Seramik Kaplama",
};

export interface Car {
  id: string;
  brand: string;
  model: string;
  segment: Segment;
  year: number;
  km: number;
  color: string;
  fuel: Fuel;
  gear: Gear;
  basePrice: number;
  /** Parça kondisyonları 0-100 */
  parts: Record<PartKey, number>;
  /** Boyalı / değişen parça sayıları */
  paintedPanels: number;
  changedPanels: number;
  tramer: number; // ₺ hasar kaydı
  /** Henüz keşfedilmemiş gizli arızalar */
  hiddenFaults: Fault[];
  /** Bilinen (keşfedilmiş) arızalar */
  knownFaults: Fault[];
  cosmetics: Cosmetics;
  cleanliness: number; // 0-100
}

export type SellerType = "sahibinden" | "galeriden";
export type SellerMood = "acil" | "normal" | "sabirli";

export interface Listing {
  id: string;
  car: Car;
  cityPlate: number;
  sellerName: string;
  sellerType: SellerType;
  sellerMood: SellerMood;
  askingPrice: number;
  /** Satıcının kabul edeceği gizli taban fiyat */
  minPrice: number;
  /** Satıcı tramer/arıza bilgisini dürüst beyan ediyor mu? */
  honest: boolean;
  /** İlanın kalkacağı gün */
  expiresDay: number;
  /** Oyuncu bu ilan için ekspertiz yaptırdı mı? */
  expertised: boolean;
  /** Oyuncu test sürüşü yaptı mı? */
  testDriven: boolean;
  /** Pazarlık kilitlendi mi (satıcı çekildi) */
  negotiationDead: boolean;
}

export type CustomerStyle = "normal" | "siki" | "acele" | "titiz";

export const CUSTOMER_STYLE_LABELS: Record<CustomerStyle, string> = {
  normal: "Kararsız",
  siki: "Sıkı pazarlıkçı",
  acele: "Acelesi var",
  titiz: "Titiz",
};

export interface Customer {
  id: string;
  name: string;
  emoji: string;
  carId: string; // ilgilendiği envanter aracı
  style: CustomerStyle;
  /** Gizli: ödeyeceği en yüksek tutar */
  maxPay: number;
  /** Pazarlıkta kalan sabır turu */
  patience: number;
  /** Açılış teklifi */
  openingOffer: number;
  /** Müşterinin ayrılacağı gün */
  leavesDay: number;
  /** Pazarlık geçmişi (UI için) */
  lastOffer: number | null;
  gone: boolean;
}

export interface OwnedCar {
  car: Car;
  boughtPrice: number;
  boughtDay: number;
  totalSpent: number; // alış + tamir + masraflar
  askingPrice: number; // vitrindeki satış fiyatı
  inTransitUntilDay?: number; // nakliye ile geliyorsa
}

export type JobType = "repair" | "clean" | "cosmetic";

export interface WorkshopJob {
  id: string;
  carId: string;
  type: JobType;
  partKey?: PartKey;
  cosmeticKey?: keyof Cosmetics;
  faultId?: string;
  label: string;
  cost: number;
  daysLeft: number;
}

export interface MarketModifier {
  segment: Segment;
  factor: number; // 1.1 = %10 yukarı
  untilDay: number;
  label: string;
}

export interface LogEntry {
  day: number;
  text: string;
  amount?: number; // +gelir, -gider
  kind: "info" | "gelir" | "gider" | "olay" | "uyari";
}

export type Difficulty = "kolay" | "normal" | "zor";

export interface Loan {
  id: string;
  name: string;
  principal: number;
  totalDebt: number; // anapara + faiz
  remaining: number;
  dailyPayment: number;
  takenDay: number;
}

export type StaffRole = "usta" | "danisman" | "detayci";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  weeklySalary: number;
  hiredDay: number;
}

export const STAFF_DEFS: Record<
  StaffRole,
  { label: string; emoji: string; weeklySalary: number; desc: string }
> = {
  usta: {
    label: "Usta (Tamirci)",
    emoji: "👨‍🔧",
    weeklySalary: 30000,
    desc: "Atölye işleri %15 daha ucuz ve 1 gün daha hızlı biter (en az 1 gün).",
  },
  danisman: {
    label: "Satış Danışmanı",
    emoji: "👨‍💼",
    weeklySalary: 25000,
    desc: "Galeriye daha fazla müşteri gelir ve müşteriler biraz daha cömert pazarlık eder.",
  },
  detayci: {
    label: "Detaycı (Temizlikçi)",
    emoji: "🧽",
    weeklySalary: 15000,
    desc: "Vitrindeki araçlar tozlanmaz; temizlikleri her gün biraz artar.",
  },
};

export interface Auction {
  day: number;
  cityPlate: number;
  cars: Car[];
  startPrices: number[];
  /** sonuçlanan (alınan ya da kaçırılan) araç id'leri */
  resolved: string[];
}

/** Lig'deki rakip AI galeriler */
export interface Rival {
  id: string;
  name: string;
  emoji: string;
  cityPlate: number;
  /** Satış becerisi 0.6 - 1.5 (günlük kâr çarpanı) */
  skill: number;
  /** Toplam kâr (oyuncunun stats.totalProfit karşılığı) */
  wealth: number;
  carsSold: number;
  reputation: number;
  /** Dünkü kâr/zarar (lig tablosunda trend için) */
  lastDelta: number;
}

export interface GameState {
  version: number;
  started: boolean;
  playerName: string;
  galleryName: string;
  homeCity: number; // plaka
  currentCity: number;
  difficulty: Difficulty;
  day: number;
  hour: number; // 8-24
  money: number;
  reputation: number; // 0-100
  gallerySlots: number;
  inventory: OwnedCar[];
  listings: Listing[];
  customers: Customer[];
  jobs: WorkshopJob[];
  marketModifiers: MarketModifier[];
  loans: Loan[];
  staff: Staff[];
  auction: Auction | null;
  rivals: Rival[];
  log: LogEntry[];
  stats: {
    carsBought: number;
    carsSold: number;
    totalProfit: number;
    bestFlip: number;
    auctionsWon: number;
    repairsDone: number;
    kmTraveled: number;
    citiesVisited: number[];
  };
  /** Kariyer: mevcut seviye içindeki XP */
  xp: number;
  level: number;
  /** Başarım id -> tamamlanan kademe sayısı */
  achievements: Record<string, number>;
  rngSeed: number;
}
