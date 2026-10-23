import { Component, type ErrorInfo, type ReactNode } from "react";

/** Beklenmeyen bir hata oyunu beyaz ekrana düşürmesin: kullanıcıya kurtarma seçenekleri sunar. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Oyun hatası:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="newgame" style={{ textAlign: "center" }}>
        <div className="logo">🛠️</div>
        <h1>Bir şeyler ters gitti</h1>
        <p className="tagline">
          Oyun beklenmeyen bir hatayla karşılaştı. İlerlemeniz cihazda kayıtlı; sayfayı yenilemek çoğu zaman çözer.
        </p>
        <div className="card">
          <p style={{ fontSize: 12, color: "var(--muted)", wordBreak: "break-word" }}>{this.state.error.message}</p>
          <button className="primary" style={{ width: "100%", padding: 12 }} onClick={() => window.location.reload()}>
            🔄 Oyunu Yeniden Yükle
          </button>
        </div>
      </div>
    );
  }
}
