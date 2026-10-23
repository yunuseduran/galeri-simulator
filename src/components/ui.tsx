import React, { useEffect, useRef, useState } from "react";

/**
 * Para/sayı girişi: tamamen silinebilir (boş kalabilir), binlik ayraçla gösterir,
 * sadece rakam kabul eder. Boşken onChange(0) çağrılır; üst bileşen 0'ı "geçersiz" sayabilir.
 */
export function MoneyInput({
  value,
  onChange,
  step = 1000,
  max,
  style,
  onEnter,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  max?: number;
  style?: React.CSSProperties;
  onEnter?: () => void;
  ariaLabel?: string;
}) {
  const fmt = (n: number) => (n > 0 ? n.toLocaleString("tr-TR") : "");
  const [text, setText] = useState(fmt(value));
  const last = useRef(value);

  // Dışarıdan değer değişirse (ör. karşı teklif) yazıyı güncelle
  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setText(fmt(value));
    }
  }, [value]);

  function commit(raw: string) {
    const digits = raw.replace(/\D/g, "");
    let n = digits === "" ? 0 : Number(digits);
    if (max !== undefined) n = Math.min(max, n);
    last.current = n;
    setText(fmt(n));
    onChange(n);
  }

  return (
    <div className="money-input" style={style}>
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={text}
        placeholder="0"
        onChange={(e) => commit(e.target.value)}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
          else if (e.key === "ArrowUp") {
            e.preventDefault();
            commit(String(value + step));
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            commit(String(Math.max(0, value - step)));
          }
        }}
      />
      <span className="money-unit">₺</span>
    </div>
  );
}

/** Sohbet balonları listesi: yeni mesaj gelince otomatik en alta kayar */
export function ChatBox({
  children,
  dep,
  style,
}: {
  children: React.ReactNode;
  /** Değiştiğinde en alta kaydırır (ör. mesaj sayısı) */
  dep: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [dep]);
  return (
    <div className="chat" ref={ref} style={style}>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={wide ? { maxWidth: 900 } : undefined}>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function PartBar({ name, value, unknown }: { name: string; value: number; unknown?: boolean }) {
  const color = value >= 75 ? "var(--green)" : value >= 50 ? "var(--accent2)" : "var(--red)";
  return (
    <div className="partbar">
      <span className="name">{name}</span>
      <div className="track">
        {!unknown && <div className="fill" style={{ width: `${value}%`, background: color }} />}
        {unknown && <div className="fill" style={{ width: "100%", background: "#39435e" }} />}
      </div>
      <span className="pct" style={{ color: unknown ? "var(--muted)" : color }}>
        {unknown ? "?" : `%${value}`}
      </span>
    </div>
  );
}
