import { setArt, getArt, place, art, h, openModal, setTitle } from "./components.js";

const load = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(`${p}: ${r.status}`); return r.json(); });
const ROT = [-1.4, 0.9, -0.7, 1.2, -0.4]; // rotació lleugera dels fitxers antics
let C; // content.json
let opened = false; // les cortines només s'obren la primera vegada que es carrega la web

/* ================= PÀGINES =================
   Cada pàgina retorna { el, destroy? } */

function Home() {
  setTitle("Home");
  let lit = false;
  const opening = !opened; opened = true;
  const stage = h("div", { class: "scene stage" + (opening ? " opening" : "") });
  const frame = h("div", { class: "reel-frame" });
  const reel = h("section", { class: "reel", style: place("reelBoard"), "aria-label": "Showreel", inert: true },
    art("reelRopes", { className: "ropes", fill: true }), frame, art("reelBoard", { fill: true }));
  const hit = h("button", { class: "lever-hit", "aria-pressed": "false" }, h("span", { class: "sr" }, "Showreel"));
  const set = (v) => {
    lit = v; stage.classList.toggle("lit", lit); hit.setAttribute("aria-pressed", String(lit)); reel.inert = !lit;
    frame.replaceChildren(...(lit ? [h("iframe", { title: "Mariona Molera showreel", allowFullscreen: true,
      src: `https://www.youtube-nocookie.com/embed/${C.CONFIG.showreelId}?autoplay=1&rel=0`,
      allow: "autoplay; encrypted-media; picture-in-picture" })] : []));
  };
  hit.addEventListener("click", () => set(!lit));
  stage.append(
    art("stageBg"), art("garlandBack"), art("homeAnim"), reel,
    art("lightIdle", { className: "idle" }), art("lampsOff", { className: "idle" }), art("lampsOn", { className: "on flicker" }),
    art("beamL", { className: "on" }), art("beamR", { className: "on" }), art("lightLit", { className: "on" }),
    art("curtainL", { className: "curtain l" }), art("curtainR", { className: "curtain r" }),
    art("valance"), art("proscenium"), art("garlandFront"), art("garlandGlow", { className: "on" }),
    art("lever", { className: "lever-art" }), art("machineBody"), art("machineGlow", { className: "on" }), hit);
  const onKey = (e) => e.key === "Escape" && set(false);
  window.addEventListener("keydown", onKey);
  return {
    el: h("main", { class: "fit" }, h("h1", { class: "sr" }, "Mariona Molera — Animation and rigging"), stage),
    destroy: () => window.removeEventListener("keydown", onKey),
  };
}

function Projects() {
  setTitle("Projects");
  const scene = h("div", { class: "scene" }, art("projectsBg"),
    ...C.PROJECTS.map((p) => h("button", { class: "slot", style: place(p.id), onclick: () => openModal({ title: p.title, body: h("p", {}, p.text) }) },
      art(p.id, { fill: true }), h("span", { class: "plate" }, p.title))));
  return { el: h("main", { class: "fit" }, h("h1", { class: "sr" }, "Projects"), scene) };
}

// Perspectiva 3D real: tots els fitxers són plans iguals; els de darrere (k gran) es fan enrere.
function FileSheet(f, i, open) {
  const anim = getArt(f.anim);
  let v;
  const play = () => v?.play().catch(() => {});
  const stop = () => { if (v) { v.pause(); v.currentTime = 0; } };
  const kids = [];
  if (anim.video) {
    v = h("video", { src: anim.video, loop: true, playsInline: true, preload: "metadata" }); v.muted = true;
    kids.push(h("span", { class: "win" }, v));
  }
  kids.push(art(f.id, { fill: true }), h("span", { class: "tab-text" }, f.title));
  return h("button", { class: "file", "aria-label": f.title,
    style: { ...place(f.id), "--k": C.PAPERS.length - 1 - i, "--rz": `${ROT[i % ROT.length]}deg` },
    onmouseenter: play, onmouseleave: stop, onfocus: play, onblur: stop, onclick: () => open(f) }, ...kids);
}

function Animation() {
  setTitle("Animation");
  const open = (f) => {
    const a = getArt(f.anim);
    openModal({ title: f.title, wide: true, body: a.video ? h("video", { src: a.video, autoplay: true, controls: true, playsInline: true }) : h("span") });
  };
  const files = h("div", { class: "files3d" }, ...C.PAPERS.map((f, i) => FileSheet(f, i, open)));
  return { el: h("main", { class: "fit" }, h("h1", { class: "sr" }, "Animation"),
    h("div", { class: "scene" }, art("drawerBg"), files, art("drawerFront"))) };
}

function RigTools() {
  setTitle("Rig & Tools");
  const board = (key, boardId, label) => h("button", { class: "board", style: place(boardId),
    onclick: () => openModal({ title: C.BOARDS[key].title, body: h("p", {}, C.BOARDS[key].text) }) },
    art(boardId, { fill: true }), h("span", { class: "sr" }, label));
  return { el: h("main", { class: "fit" }, h("h1", { class: "sr" }, "Rig & Tools"),
    h("div", { class: "scene" }, art("workshopBg"), board("rigs", "boardRigs", "Open Rigs"), board("tools", "boardTools", "Open Anim Tools"))) };
}

function About() {
  setTitle("About");
  const n = (cls, id, title, text) => h("section", { class: `notice ${cls}` }, art(id), h("h2", {}, title), text && h("p", {}, text));
  return { el: h("main", { class: "wrap about" }, h("h1", { class: "sr" }, "About"), art("aboutPuppeteer", { className: "puppeteer" }),
    h("div", { class: "notices" },
      n("n1", "aboutPhoto", "Mariona"),
      n("n2", "aboutBio", "Who I am", "Placeholder: a short presentation goes here."),
      n("n3", "aboutExp", "Experience", "Placeholder: studios, projects, years."),
      n("n4", "aboutSkills", "Skills", "Placeholder: software and tools."))) };
}

function Contact() {
  setTitle("Contact");
  const { email, linkedin, cv } = C.CONFIG;
  const ext = { target: "_blank", rel: "noopener noreferrer" };
  return { el: h("main", { class: "wrap contact" }, h("h1", { class: "sr" }, "Contact"),
    h("div", { class: "door" }, art("door", { fill: true })),
    h("div", { class: "plaque" }, h("h2", {}, "Knock knock"), h("ul", {},
      h("li", {}, h("a", { href: `mailto:${email}` }, email)),
      h("li", {}, h("a", { href: linkedin, ...ext }, "LinkedIn")),
      h("li", {}, h("a", { href: cv, ...ext }, "Download my CV"))))) };
}

function NotFound() {
  setTitle("Page not found");
  return { el: h("main", { class: "plain" }, h("h1", {}, "Page not found"), h("a", { href: "#/" }, "Back to the stage")) };
}

const ROUTES = { "/": Home, "/projects": Projects, "/animation": Animation, "/rig-tools": RigTools, "/about": About, "/contact": Contact };

/* ================= ESTRUCTURA GLOBAL ================= */
const path = () => (location.hash.replace(/^#/, "") || "/").replace(/\/+$/, "") || "/";

function shell() {
  const view = h("div", { class: "view", id: "view" }, h("div", { id: "main", tabindex: "-1" }));
  const links = C.NAV.map((n) => h("a", { href: `#${n.to}`, class: "sign", "data-to": n.to }, art(n.art, { fill: true }), h("span", { class: "sr" }, n.label)));
  const posters = h("nav", { class: "posters", "aria-label": "Contact links" },
    h("a", { href: C.CONFIG.linkedin, target: "_blank", rel: "noopener noreferrer", "aria-label": "LinkedIn" }, art("posterLinkedin", { fill: true })),
    h("a", { href: `mailto:${C.CONFIG.email}`, "aria-label": "Email" }, art("posterMail", { fill: true })),
    h("a", { href: C.CONFIG.cv, target: "_blank", rel: "noopener noreferrer", "aria-label": "CV" }, art("posterCv", { fill: true })));
  const skip = h("a", { class: "skip", href: "#main", onclick: (e) => { e.preventDefault(); document.getElementById("main").focus(); } }, "Skip to content");
  const frame = h("div", { class: "frame" + (getArt("frame").src ? "" : " ph"), "aria-hidden": "true" }, art("frame", { fill: true }));
  const fx = h("div", { class: "fx", "aria-hidden": "true" }, art("fxParticles", { fill: true }), art("fxGrain", { fill: true }), art("fxVignette", { fill: true }));
  document.getElementById("app").replaceChildren(skip,
    h("div", { class: "inner" }, view,
      h("header", { class: "bar" }, h("a", { href: "#/", class: "brand" }, "Mariona Molera"), h("nav", { "aria-label": "Main" }, ...links)), posters),
    frame, fx);
  return { view, main: view.querySelector("#main"), links, posters };
}

function posterBehaviour(posters) {
  let peek = false, t;
  const sync = () => posters.classList.toggle("peek", peek && !posters.classList.contains("full"));
  window.addEventListener("wheel", (e) => {
    if (e.deltaY > 0) { peek = true; clearTimeout(t); t = setTimeout(() => { peek = false; sync(); }, 3500); }
    else if (e.deltaY < 0) peek = false;
    sync();
  }, { passive: true });
  return { reset: () => { peek = false; clearTimeout(t); sync(); } };
}

async function start() {
  try { [C, ] = [await load("src/data/content.json")]; setArt(await load("src/data/art.json")); }
  catch (e) { document.getElementById("app").textContent = "Could not load site data. Serve the folder over HTTP (e.g. GitHub Pages)."; console.error(e); return; }
  const ui = shell(); const pb = posterBehaviour(ui.posters); let current;
  const render = () => {
    const p = path(); current?.destroy?.();
    current = (ROUTES[p] || NotFound)();
    ui.main.replaceChildren(current.el);
    ui.view.scrollTo(0, 0);
    ui.links.forEach((a) => { const on = a.dataset.to === p; a.classList.toggle("active", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
    ui.posters.classList.toggle("full", p === "/"); pb.reset();
  };
  window.addEventListener("hashchange", render);
  render();
}
start();
