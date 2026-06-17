export interface City {
  plate: number;
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { plate: 1, name: "Adana", lat: 37.0, lon: 35.32 },
  { plate: 2, name: "Adıyaman", lat: 37.76, lon: 38.28 },
  { plate: 3, name: "Afyonkarahisar", lat: 38.76, lon: 30.54 },
  { plate: 4, name: "Ağrı", lat: 39.72, lon: 43.05 },
  { plate: 5, name: "Amasya", lat: 40.65, lon: 35.83 },
  { plate: 6, name: "Ankara", lat: 39.93, lon: 32.86 },
  { plate: 7, name: "Antalya", lat: 36.89, lon: 30.71 },
  { plate: 8, name: "Artvin", lat: 41.18, lon: 41.82 },
  { plate: 9, name: "Aydın", lat: 37.85, lon: 27.85 },
  { plate: 10, name: "Balıkesir", lat: 39.65, lon: 27.89 },
  { plate: 11, name: "Bilecik", lat: 40.15, lon: 29.98 },
  { plate: 12, name: "Bingöl", lat: 38.88, lon: 40.5 },
  { plate: 13, name: "Bitlis", lat: 38.4, lon: 42.11 },
  { plate: 14, name: "Bolu", lat: 40.74, lon: 31.61 },
  { plate: 15, name: "Burdur", lat: 37.72, lon: 30.29 },
  { plate: 16, name: "Bursa", lat: 40.18, lon: 29.07 },
  { plate: 17, name: "Çanakkale", lat: 40.15, lon: 26.41 },
  { plate: 18, name: "Çankırı", lat: 40.6, lon: 33.62 },
  { plate: 19, name: "Çorum", lat: 40.55, lon: 34.95 },
  { plate: 20, name: "Denizli", lat: 37.78, lon: 29.09 },
  { plate: 21, name: "Diyarbakır", lat: 37.91, lon: 40.24 },
  { plate: 22, name: "Edirne", lat: 41.68, lon: 26.56 },
  { plate: 23, name: "Elazığ", lat: 38.68, lon: 39.22 },
  { plate: 24, name: "Erzincan", lat: 39.75, lon: 39.49 },
  { plate: 25, name: "Erzurum", lat: 39.9, lon: 41.27 },
  { plate: 26, name: "Eskişehir", lat: 39.78, lon: 30.52 },
  { plate: 27, name: "Gaziantep", lat: 37.07, lon: 37.38 },
  { plate: 28, name: "Giresun", lat: 40.91, lon: 38.39 },
  { plate: 29, name: "Gümüşhane", lat: 40.46, lon: 39.48 },
  { plate: 30, name: "Hakkari", lat: 37.58, lon: 43.74 },
  { plate: 31, name: "Hatay", lat: 36.2, lon: 36.16 },
  { plate: 32, name: "Isparta", lat: 37.77, lon: 30.55 },
  { plate: 33, name: "Mersin", lat: 36.81, lon: 34.64 },
  { plate: 34, name: "İstanbul", lat: 41.01, lon: 28.98 },
  { plate: 35, name: "İzmir", lat: 38.42, lon: 27.13 },
  { plate: 36, name: "Kars", lat: 40.6, lon: 43.1 },
  { plate: 37, name: "Kastamonu", lat: 41.38, lon: 33.78 },
  { plate: 38, name: "Kayseri", lat: 38.73, lon: 35.49 },
  { plate: 39, name: "Kırklareli", lat: 41.74, lon: 27.23 },
  { plate: 40, name: "Kırşehir", lat: 39.15, lon: 34.16 },
  { plate: 41, name: "Kocaeli", lat: 40.85, lon: 29.88 },
  { plate: 42, name: "Konya", lat: 37.87, lon: 32.48 },
  { plate: 43, name: "Kütahya", lat: 39.42, lon: 29.98 },
  { plate: 44, name: "Malatya", lat: 38.35, lon: 38.31 },
  { plate: 45, name: "Manisa", lat: 38.61, lon: 27.43 },
  { plate: 46, name: "Kahramanmaraş", lat: 37.58, lon: 36.94 },
  { plate: 47, name: "Mardin", lat: 37.31, lon: 40.74 },
  { plate: 48, name: "Muğla", lat: 37.22, lon: 28.36 },
  { plate: 49, name: "Muş", lat: 38.73, lon: 41.49 },
  { plate: 50, name: "Nevşehir", lat: 38.62, lon: 34.71 },
  { plate: 51, name: "Niğde", lat: 37.97, lon: 34.68 },
  { plate: 52, name: "Ordu", lat: 40.98, lon: 37.88 },
  { plate: 53, name: "Rize", lat: 41.02, lon: 40.52 },
  { plate: 54, name: "Sakarya", lat: 40.77, lon: 30.4 },
  { plate: 55, name: "Samsun", lat: 41.29, lon: 36.33 },
  { plate: 56, name: "Siirt", lat: 37.93, lon: 41.94 },
  { plate: 57, name: "Sinop", lat: 42.03, lon: 35.15 },
  { plate: 58, name: "Sivas", lat: 39.75, lon: 37.02 },
  { plate: 59, name: "Tekirdağ", lat: 40.98, lon: 27.51 },
  { plate: 60, name: "Tokat", lat: 40.31, lon: 36.55 },
  { plate: 61, name: "Trabzon", lat: 41.0, lon: 39.72 },
  { plate: 62, name: "Tunceli", lat: 39.11, lon: 39.55 },
  { plate: 63, name: "Şanlıurfa", lat: 37.16, lon: 38.79 },
  { plate: 64, name: "Uşak", lat: 38.68, lon: 29.41 },
  { plate: 65, name: "Van", lat: 38.49, lon: 43.38 },
  { plate: 66, name: "Yozgat", lat: 39.82, lon: 34.81 },
  { plate: 67, name: "Zonguldak", lat: 41.45, lon: 31.79 },
  { plate: 68, name: "Aksaray", lat: 38.37, lon: 34.03 },
  { plate: 69, name: "Bayburt", lat: 40.26, lon: 40.22 },
  { plate: 70, name: "Karaman", lat: 37.18, lon: 33.22 },
  { plate: 71, name: "Kırıkkale", lat: 39.85, lon: 33.51 },
  { plate: 72, name: "Batman", lat: 37.88, lon: 41.13 },
  { plate: 73, name: "Şırnak", lat: 37.52, lon: 42.46 },
  { plate: 74, name: "Bartın", lat: 41.64, lon: 32.34 },
  { plate: 75, name: "Ardahan", lat: 41.11, lon: 42.7 },
  { plate: 76, name: "Iğdır", lat: 39.92, lon: 44.05 },
  { plate: 77, name: "Yalova", lat: 40.65, lon: 29.27 },
  { plate: 78, name: "Karabük", lat: 41.2, lon: 32.62 },
  { plate: 79, name: "Kilis", lat: 36.72, lon: 37.12 },
  { plate: 80, name: "Osmaniye", lat: 37.07, lon: 36.25 },
  { plate: 81, name: "Düzce", lat: 40.84, lon: 31.16 },
];

export function cityByPlate(plate: number): City {
  const c = CITIES.find((c) => c.plate === plate);
  if (!c) throw new Error("Bilinmeyen plaka: " + plate);
  return c;
}

/** İki il arası yaklaşık karayolu mesafesi (km) */
export function roadDistance(a: number, b: number): number {
  if (a === b) return 0;
  const ca = cityByPlate(a);
  const cb = cityByPlate(b);
  const R = 6371;
  const dLat = ((cb.lat - ca.lat) * Math.PI) / 180;
  const dLon = ((cb.lon - ca.lon) * Math.PI) / 180;
  const la = (ca.lat * Math.PI) / 180;
  const lb = (cb.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(straight * 1.32); // karayolu sapma katsayısı
}
