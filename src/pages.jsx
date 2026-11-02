import { useEffect, useRef, useState } from "react";
import { Art, Modal, useTitle, place, getArt } from "./ui.jsx";
import { CONFIG, PROJECTS, PAPERS, BOARDS } from "./content.js";

/* ---------------- HOME ---------------- */
let opened = false; // les cortines només s'obren la primera vegada que es carrega la web

export function Home() {
  useTitle("Home");
  const [lit, setLit] = useState(false);
  const [opening] = useState(() => { const o = !opened; opened = true; return o; });
  useEffect(() => {
    const k = (e) => e.key === "Escape" && setLit(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <main className="fit">
      <h1 className="sr">Mariona Molera — Animation and rigging</h1>
      <div className={"scene stage" + (lit ? " lit" : "") + (opening ? " opening" : "")}>
        {/* fons */}
        <Art id="stageBg" />
        <Art id="garlandBack" />
        <Art id="homeAnim" />

        {/* cartell de la showreel (cau en encendre) */}
        <section className="reel" style={place("reelBoard")} inert={!lit} aria-label="Showreel">
          <Art id="reelRopes" className="ropes" fill />
          <div className="reel-frame">
            {lit && <iframe title="Mariona Molera showreel" allowFullScreen
              src={`https://www.youtube-nocookie.com/embed/${CONFIG.showreelId}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; picture-in-picture" />}
          </div>
          <Art id="reelBoard" fill />
        </section>

        {/* il·luminació */}
        <Art id="lightIdle" className="idle" />
        <Art id="lampsOff" className="idle" />
        <Art id="lampsOn" className="on flicker" />
        <Art id="beamL" className="on" />
        <Art id="beamR" className="on" />
        <Art id="lightLit" className="on" />

        {/* decoració exterior */}
        <Art id="curtainL" className="curtain l" />
        <Art id="curtainR" className="curtain r" />
        <Art id="valance" />
        <Art id="proscenium" />
        <Art id="garlandFront" />
        <Art id="garlandGlow" className="on" />

        {/* primer pla: palanca (per sota) + màquina */}
        <Art id="lever" className="lever-art" />
        <Art id="machineBody" />
        <Art id="machineGlow" className="on" />
        <button className="lever-hit" aria-pressed={lit} onClick={() => setLit(!lit)}>
          <span className="sr">Showreel</span>
        </button>
      </div>
    </main>
  );
}

/* ---------------- PROJECTS ---------------- */
export function Projects() {
  useTitle("Projects");
  const [sel, setSel] = useState(null);
  return (
    <main className="fit">
      <h1 className="sr">Projects</h1>
      <div className="scene">
        <Art id="projectsBg" />
        {PROJECTS.map((p) => (
          <button key={p.id} className="slot" style={place(p.id)} onClick={() => setSel(p)}>
            <Art id={p.id} fill />
            <span className="plate">{p.title}</span>
          </button>
        ))}
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.title}>
        <p>{sel?.text}</p>
      </Modal>
    </main>
  );
}

/* ---------------- ANIMATION ---------------- */
// Perspectiva 3D real: tots els fitxers són plans iguals. Els de darrere
// (k gran) es fan enrere en profunditat, i el navegador els fa petits.
const ROT = [-1.4, 0.9, -0.7, 1.2, -0.4]; // rotació lleugera, com a fitxers antics

function FileSheet({ f, i, onOpen }) {
  const v = useRef(null);
  const anim = getArt(f.anim);
  const play = () => v.current?.play();
  const stop = () => { if (v.current) { v.current.pause(); v.current.currentTime = 0; } };
  return (
    <button className="file" aria-label={f.title}
      style={{ ...place(f.id), "--k": PAPERS.length - 1 - i, "--rz": `${ROT[i]}deg` }}
      onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop} onClick={() => onOpen(f)}>
      {anim.video && <span className="win"><video ref={v} src={anim.video} muted loop playsInline preload="metadata" /></span>}
      <Art id={f.id} fill />
      <span className="tab-text">{f.title}</span>
    </button>
  );
}

export function Animation() {
  useTitle("Animation");
  const [sel, setSel] = useState(null);
  const selAnim = sel && getArt(sel.anim);
  return (
    <main className="fit">
      <h1 className="sr">Animation</h1>
      <div className="scene">
        <Art id="drawerBg" />
        <div className="files3d">
          {PAPERS.map((f, i) => <FileSheet key={f.id} f={f} i={i} onOpen={setSel} />)}
        </div>
        <Art id="drawerFront" />
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.title} wide>
        {selAnim?.video && <video src={selAnim.video} autoPlay controls playsInline />}
      </Modal>
    </main>
  );
}

/* ---------------- RIG & TOOLS ---------------- */
export function RigTools() {
  useTitle("Rig & Tools");
  const [sel, setSel] = useState(null);
  return (
    <main className="fit">
      <h1 className="sr">Rig &amp; Tools</h1>
      <div className="scene">
        <Art id="workshopBg" />
        <button className="board" style={place("boardRigs")} onClick={() => setSel("rigs")}>
          <Art id="boardRigs" fill /><span className="sr">Open Rigs</span>
        </button>
        <button className="board" style={place("boardTools")} onClick={() => setSel("tools")}>
          <Art id="boardTools" fill /><span className="sr">Open Anim Tools</span>
        </button>
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel && BOARDS[sel].title}>
        <p>{sel && BOARDS[sel].text}</p>
      </Modal>
    </main>
  );
}

/* ---------------- ABOUT (pendent) ---------------- */
export function About() {
  useTitle("About");
  return (
    <main className="wrap about">
      <h1 className="sr">About</h1>
      <Art id="aboutPuppeteer" className="puppeteer" />
      <div className="notices">
        <section className="notice n1"><Art id="aboutPhoto" /><h2>Mariona</h2></section>
        <section className="notice n2"><Art id="aboutBio" /><h2>Who I am</h2><p>Placeholder: a short presentation goes here.</p></section>
        <section className="notice n3"><Art id="aboutExp" /><h2>Experience</h2><p>Placeholder: studios, projects, years.</p></section>
        <section className="notice n4"><Art id="aboutSkills" /><h2>Skills</h2><p>Placeholder: software and tools.</p></section>
      </div>
    </main>
  );
}

/* ---------------- CONTACT (pendent) ---------------- */
export function Contact() {
  useTitle("Contact");
  return (
    <main className="wrap contact">
      <h1 className="sr">Contact</h1>
      <div className="door">
        <Art id="door" fill />
      </div>
      <div className="plaque">
        <h2>Knock knock</h2>
        <ul>
          <li><a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a></li>
          <li><a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href={CONFIG.cv} target="_blank" rel="noopener noreferrer">Download my CV</a></li>
        </ul>
      </div>
    </main>
  );
}
