import { useEffect, useRef } from "react";
import { ART } from "./art.js";

// Resol una entrada d'ART (si té `same`, hereda el dibuix d'una altra)
export const getArt = (id) => {
  const b = ART[id] || { color: "#888", label: id };
  return b.same ? { ...ART[b.same], ...b } : b;
};

// Estil de posició (en % de l'escena) per a contenidors/botons
export const place = (id) => {
  const p = getArt(id).pos;
  return p ? { position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%`, zIndex: p.z } : {};
};

// fill = omple el seu pare (ignora `pos`)
export function Art({ id, className = "", style, fill, children }) {
  const a = getArt(id);
  const media = a.src || a.video;
  const cls = ["art", fill && "fill", a.ghost && !media && "ghost", a.flip && "flip", className].filter(Boolean).join(" ");
  const st = {
    background: media || a.ghost ? undefined : a.color,
    ...(fill ? null : place(id)),
    ...(a.opacity != null ? { "--o": a.opacity } : null),
    ...(a.blend ? { mixBlendMode: a.blend } : null),
    ...style,
  };
  return (
    <div className={cls} style={st}>
      {a.video ? <video src={a.video} autoPlay muted loop playsInline /> :
       a.src ? <img src={a.src} alt={a.alt || ""} draggable="false" /> :
       <span className="art-label">{a.label}</span>}
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, wide, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog className={wide ? "wide" : ""} ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <article>
        <h2>{title}</h2>
        {children}
        <button className="btn" autoFocus onClick={onClose}>Close</button>
      </article>
    </dialog>
  );
}

export function useTitle(t) {
  useEffect(() => { document.title = `${t} — Mariona Molera`; }, [t]);
}
