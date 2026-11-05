// Components reutilitzables (sense frameworks). Tot són funcions que retornen nodes DOM.

let ART = {};
export const setArt = (data) => { ART = data; };

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

// Creador de nodes: h("div", {class:"x", style:{}, onclick}, ...fills)
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style") typeof v === "string" ? (el.style.cssText = v) : applyStyle(el, v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...kids.flat().filter((x) => x != null && x !== false));
  return el;
}
export function applyStyle(el, s) {
  for (const [k, v] of Object.entries(s)) {
    if (v == null) continue;
    k.startsWith("--") ? el.style.setProperty(k, v) : (el.style[k] = v);
  }
}

// Dibuix. fill = omple el seu pare (ignora `pos`). Si la imatge no carrega,
// torna al placeholder de color amb l'etiqueta (mai queda una imatge trencada).
export function art(id, { className = "", style, fill, children = [] } = {}) {
  const a = getArt(id);
  const media = a.src || a.video;
  const cls = ["art", fill && "fill", a.ghost && !media && "ghost", a.flip && "flip", className].filter(Boolean).join(" ");
  const el = h("div", { class: cls });
  applyStyle(el, {
    background: media || a.ghost ? null : a.color,
    ...(fill ? null : place(id)),
    "--o": a.opacity != null ? a.opacity : null,
    mixBlendMode: a.blend || null,
    ...style,
  });
  const label = () => h("span", { class: "art-label" }, a.label);
  const fallback = () => { el.replaceChildren(label()); el.classList.add(a.ghost ? "ghost" : "missing"); el.style.background = a.ghost ? "" : a.color; };
  if (a.video) {
    const v = h("video", { src: a.video, autoplay: true, loop: true, playsInline: true });
    v.muted = true;
    v.addEventListener("error", fallback, { once: true });
    el.append(v);
  } else if (a.src) {
    const img = h("img", { src: a.src, alt: a.alt || "", draggable: "false", decoding: "async" });
    img.addEventListener("error", fallback, { once: true });
    el.append(img);
  } else el.append(label());
  el.append(...children);
  return el;
}

// Finestra modal (<dialog>). Retorna { close }.
export function openModal({ title, wide, body }) {
  const dlg = h("dialog", { class: wide ? "wide" : "" });
  const close = () => dlg.open && dlg.close();
  dlg.append(h("article", {}, h("h2", {}, title || ""), body, h("button", { class: "btn", autofocus: true, onclick: close }, "Close")));
  dlg.addEventListener("click", (e) => e.target === dlg && close());
  dlg.addEventListener("close", () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  return { close };
}

export const setTitle = (t) => { document.title = t ? `${t} — Mariona Molera` : "Mariona Molera"; };
