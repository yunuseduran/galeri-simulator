import type { FlyTarget, PanelKey } from "./Hub3D";

export interface TourStep {
  /** Kameranın uçacağı yer */
  fly: FlyTarget;
  /** "Ekranı Aç" butonunun açacağı panel (yoksa yalnızca anlatım) */
  panel?: PanelKey;
  emoji: string;
  title: string;
  text: string;
  tip?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    fly: "overview",
    emoji: "👋",
    title: "Galerine hoş geldin!",
    text: "Burası senin galeri kompleksin. Amaç: ucuza araç al, değerini artır, kârıyla sat — ve imparatorluğunu büyüt. Bu turda her ofisi tek tek gezeceğiz.",
    tip: "Kamerayı sürükleyerek döndür, tekerlek / iki parmakla yakınlaştır. Binalara ve müşterilere dokunabilirsin.",
  },
  {
    fly: "pazar",
    panel: "pazar",
    emoji: "🛒",
    title: "1) İlanlar — araç bul",
    text: "Reklam panosu Türkiye'nin 81 ilindeki ilanları gösterir; her ilde en az 5 araç vardır. Raflardan seç: Fırsat (acil satılık), Bulunduğun il, Yakın, Uzak.",
    tip: "Aracı görmek için o ile gitmen gerekir. Ekspertiz, hukuki sorgu ve 3D test sürüşüyle gizli sorunları ara, sonra pazarlık et. Satın alınca nakliye ya da 'kendin sür' seç.",
  },
  {
    fly: "showroom",
    panel: "galeri",
    emoji: "🏢",
    title: "2) Galerim — vitrin",
    text: "Aldığın araçlar vitrinde sergilenir. Etiket fiyatını buradan ayarlar, aracı 10/20/30 günlüğüne kiraya verir ya da toptancıya satarsın.",
    tip: "Vitrin kapasitesi sınırlıdır: Tesis'ten Vitrin ve Ek Otopark'ı büyüt.",
  },
  {
    fly: "atolye",
    panel: "atolye",
    emoji: "🔧",
    title: "3) Atölye — değer kat",
    text: "Arızaları tamir et, parçaları yenile; temizlik, koltuk kılıfı, jant, seramik kaplama gibi işlemlerle aracın değerini artır. İşler gün sürer.",
    tip: "Kendi tamirhaneni kurmazsan işler dış sanayiye %30 zamlı yaptırılır.",
  },
  {
    fly: "musteri",
    panel: "musteri",
    emoji: "🧑‍🤝‍🧑",
    title: "4) Müşteriler — sat",
    text: "Her gün kaldırımdaki müşteriler vitrindeki araçlara bakar. Müşteriye dokun, pazarlık et. Fiyatta anlaşınca Peşin ya da Senetli (taksitli) satış seç.",
    tip: "Aceleci müşteri yüksek öder; sıkı pazarlıkçı ezer; titiz olan gizli arızayı yakalar — dürüst ol, itibarın artsın.",
  },
  {
    fly: "showroom",
    panel: "tesis",
    emoji: "🏗️",
    title: "5) Tesis — dükkanlar",
    text: "Komplekse yeni dükkanlar kur: Tamirhane, Oto Yıkama, Yedek Parça, Kafeterya, Pompa, Otopark. Kimi günlük pasif gelir getirir, kimi işini kolaylaştırır.",
    tip: "Boş arsadaki '+ İnşa Et' tabelasına dokunarak da inşaata başlayabilirsin.",
  },
  {
    fly: "ofis",
    panel: "ofis",
    emoji: "🏦",
    title: "6) Ofis — banka ve ekip",
    text: "Nakde mi ihtiyacın var? Banka kredisi çek (taksitler her gün otomatik ödenir). Usta, Satış Danışmanı, Detaycı ve Avukat gibi elemanları buradan işe al.",
    tip: "Haftalık kira ve maaşları unutma. Kasa eksiye düşerse itibarın zarar görür.",
  },
  {
    fly: "avukat",
    panel: "avukat",
    emoji: "⚖️",
    title: "7) Avukat — hukuk bürosu",
    text: "Bazı araçlarda gizli haciz/rehin olabilir: ilandaki Hukuki Sorgu ile tespit et. Sorunlu aracı 3 gün içinde uzlaşma ya da davayla çözmezsen icradan alınır. Senetle sattığın müşteri ödemezse de ihtar ve icra takibini buradan yaparsın.",
  },
  {
    fly: "borsa",
    panel: "borsa",
    emoji: "📈",
    title: "8) Borsa & Kripto",
    text: "Atıl nakdini hisse, kripto ve dövizde değerlendir. Fiyatlar her gün değişir; kripto hem en çok kazandıran hem en çok kaybettiren yerdir.",
    tip: "Hepsini tek varlığa yatırma — kriptoda bir gecede %30 düşüş olabilir.",
  },
  {
    fly: "ihracat",
    panel: "ihracat",
    emoji: "🚢",
    title: "9) İhracat Ofisi",
    text: "Yurt dışı alıcılar şartlara uyan araca piyasanın %10–30 üstünde öder. Dikkat: alıcının ekspertizi gizli arıza bulursa ihracat reddedilir.",
    tip: "İhracat için aracı önce ekspertiz ve tamirle temizle.",
  },
  {
    fly: "lig",
    panel: "lig",
    emoji: "🏆",
    title: "10) Lig",
    text: "Bayraktaki Lig ekranında yapay zekâlı rakip galerilerle ve diğer oyuncularla toplam kâra göre yarışırsın. 1 numaraya çıkınca büyük kutlama!",
  },
  {
    fly: "overview",
    panel: "kariyer",
    emoji: "🎖️",
    title: "11) Kariyer — oyun hiç bitmez",
    text: "Her işlem XP kazandırır. Seviye atladıkça para ödülü ve kalıcı ayrıcalıklar (ucuz ekspertiz, yol indirimi…) açılır; başarımlar sonsuza kadar kademelenir.",
  },
  {
    fly: "overview",
    emoji: "🌙",
    title: "12) Günü bitir — döngü",
    text: "Sağ üstteki 🌙 Günü Bitir: atölye işleri ilerler, yeni ilanlar ve müşteriler gelir, taksitler tahsil edilir, borsa değişir. Üst bardan 🗺️ Seyahat ile başka illere gidersin.",
    tip: "İlk hamlen: İlanlar → bulunduğun ildeki bir araca bak, ekspertiz yaptır ve pazarlığa otur. Bol kazançlar! 🚗💨",
  },
];

export function TourCard({
  step,
  index,
  onNext,
  onPrev,
  onSkip,
  onOpenPanel,
}: {
  step: TourStep;
  index: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onOpenPanel: () => void;
}) {
  const last = index === TOUR_STEPS.length - 1;
  return (
    <div className="tour-card" role="dialog" aria-label="Oyun turu">
      <div className="tour-head">
        <strong>
          {step.emoji} {step.title}
        </strong>
        <span className="tour-count">
          {index + 1}/{TOUR_STEPS.length}
        </span>
      </div>
      <div className="tour-progress">
        <div style={{ width: `${((index + 1) / TOUR_STEPS.length) * 100}%` }} />
      </div>
      <p className="tour-text">{step.text}</p>
      {step.tip && <p className="tour-tip">💡 {step.tip}</p>}
      <div className="tour-actions">
        <button className="small" onClick={onSkip}>
          Turu Kapat
        </button>
        <span style={{ flex: 1 }} />
        {step.panel && (
          <button className="small success" onClick={onOpenPanel}>
            Ekranı Gör
          </button>
        )}
        <button className="small" disabled={index === 0} onClick={onPrev}>
          ← Geri
        </button>
        <button className="small primary" onClick={onNext}>
          {last ? "Bitir 🎉" : "İleri →"}
        </button>
      </div>
    </div>
  );
}
