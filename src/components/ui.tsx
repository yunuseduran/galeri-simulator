import React from "react";

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
