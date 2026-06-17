// Basit, tamamen tarayıcıda (localStorage) çalışan hesap/oturum sistemi.
// NOT: Bu gerçek bir güvenlik katmanı DEĞİLDİR. Şifreler sadece aynı
// tarayıcıda hesapları birbirinden ayırmak için hafifçe karıştırılır.
// Çok oyunculu/gerçek sunucu istenirse buradaki fonksiyonlar Supabase/Firebase
// çağrılarıyla değiştirilebilir; arayüz aynı kalır.

const ACCOUNTS_KEY = "galeri-sim-accounts-v1";
const SESSION_KEY = "galeri-sim-session-v1";
const PROFILES_KEY = "galeri-sim-profiles-v1";
const SAVE_PREFIX = "galeri-sim-save-v1::";

export interface Account {
  username: string; // görüntülenen ad (orijinal yazım)
  pass: string; // hafifçe karıştırılmış şifre
  createdAt: number;
}

export interface PlayerProfile {
  username: string;
  galleryName: string;
  homeCity: number;
  totalProfit: number;
  carsSold: number;
  reputation: number;
  level: number;
  day: number;
  started: boolean;
  updatedAt: number;
}

function normalize(username: string): string {
  return username.trim().toLowerCase();
}

/** Şifre için basit (güvenli olmayan) karıştırma — sadece localStorage ayrımı için. */
function scramble(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36) + ":" + s.length;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // depolama dolu olabilir
  }
}

export function getAccounts(): Record<string, Account> {
  return readJSON<Record<string, Account>>(ACCOUNTS_KEY, {});
}

export function saveKeyFor(username: string): string {
  return SAVE_PREFIX + normalize(username);
}

/** Şu an giriş yapmış kullanıcının adı (normalize edilmemiş orijinal yazım) ya da null. */
export function currentUser(): string | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const acc = getAccounts()[id];
  return acc ? acc.username : null;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

export function register(username: string, pass: string): AuthResult {
  const name = username.trim();
  const id = normalize(name);
  if (name.length < 2) return { ok: false, error: "Kullanıcı adı en az 2 karakter olmalı." };
  if (pass.length < 3) return { ok: false, error: "Şifre en az 3 karakter olmalı." };
  const accounts = getAccounts();
  if (accounts[id]) return { ok: false, error: "Bu kullanıcı adı zaten alınmış." };
  accounts[id] = { username: name, pass: scramble(pass), createdAt: Date.now() };
  writeJSON(ACCOUNTS_KEY, accounts);
  localStorage.setItem(SESSION_KEY, id);
  return { ok: true };
}

export function login(username: string, pass: string): AuthResult {
  const id = normalize(username);
  const accounts = getAccounts();
  const acc = accounts[id];
  if (!acc) return { ok: false, error: "Böyle bir kullanıcı yok. Önce kayıt olun." };
  if (acc.pass !== scramble(pass)) return { ok: false, error: "Şifre hatalı." };
  localStorage.setItem(SESSION_KEY, id);
  return { ok: true };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Bir kullanıcının lig profilini günceller (her kayıtta state.tsx çağırır). */
export function upsertProfile(p: PlayerProfile): void {
  const profiles = readJSON<Record<string, PlayerProfile>>(PROFILES_KEY, {});
  profiles[normalize(p.username)] = { ...p, updatedAt: Date.now() };
  writeJSON(PROFILES_KEY, profiles);
}

/** Tüm kayıtlı kullanıcıların lig profilleri (kâra göre azalan). */
export function getLeaderboard(): PlayerProfile[] {
  const accounts = getAccounts();
  const profiles = readJSON<Record<string, PlayerProfile>>(PROFILES_KEY, {});
  const rows: PlayerProfile[] = [];
  for (const id of Object.keys(accounts)) {
    const acc = accounts[id];
    const prof = profiles[id];
    if (prof) {
      rows.push({ ...prof, username: acc.username });
    } else {
      rows.push({
        username: acc.username,
        galleryName: "—",
        homeCity: 34,
        totalProfit: 0,
        carsSold: 0,
        reputation: 0,
        level: 1,
        day: 0,
        started: false,
        updatedAt: acc.createdAt,
      });
    }
  }
  return rows.sort((a, b) => {
    if (a.started !== b.started) return a.started ? -1 : 1;
    return b.totalProfit - a.totalProfit;
  });
}
