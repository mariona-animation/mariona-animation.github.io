import { useEffect, useRef } from "react";
import { ART } from "./art.js";

export function Art({ id, className = "", style, children }) {
  const a = ART[id] || { color: "#888", label: id };
  return (
    <div className={"art " + className} style={{ background: a.src || a.video ? undefined : a.color, ...style }}>
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
