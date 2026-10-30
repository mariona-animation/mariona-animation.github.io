import { useEffect, useState } from "react";
import { Art, Modal, useTitle } from "./ui.jsx";
import { CONFIG, PROJECTS, PAPERS, BOARDS } from "./content.js";

/* ---------------- HOME ---------------- */
export function Home() {
  useTitle("Home");
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && setLit(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <main className="home">
      <h1 className="sr">Mariona Molera — Animation and rigging</h1>
      <div className={"stage" + (lit ? " lit" : "")}>
        <Art id="homeBg" className="fill" />
        <Art id="homeAnim" className="anim" />
        <div className="spot" aria-hidden="true" />
        <section className="reel" inert={!lit} aria-label="Showreel">
          <div className="reel-frame">
            {lit && <iframe title="Mariona Molera showreel" allowFullScreen
              src={`https://www.youtube-nocookie.com/embed/${CONFIG.showreelId}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; picture-in-picture" />}
          </div>
        </section>
        <Art id="curtainL" className="curtain l" />
        <Art id="curtainR" className="curtain r" />
        <Art id="floor" className="floor" />
        <button className="lever-btn" aria-pressed={lit} onClick={() => setLit(!lit)}>
          <Art id="lever" className="lever-art" />
          <span className="plank">Showreel</span>
        </button>
      </div>
      <nav className="posters" aria-label="Contact links">
        <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Art id="posterLinkedin" /></a>
        <a href={`mailto:${CONFIG.email}`} aria-label="Email"><Art id="posterMail" /></a>
        <a href={CONFIG.cv} target="_blank" rel="noopener noreferrer" aria-label="CV"><Art id="posterCv" /></a>
      </nav>
    </main>
  );
}

/* ---------------- PROJECTS ---------------- */
export function Projects() {
  useTitle("Projects");
  const [sel, setSel] = useState(null);
  return (
    <main className="wrap">
      <h1>Projects</h1>
      <p className="lead">The puppet shop. Open a drawer to meet the puppet and the project behind it.</p>
      <div className="wardrobe">
        {PROJECTS.map((p) => (
          <button key={p.id} className="drawer" onClick={() => setSel(p)}>
            <Art id={p.id} />
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
export function Animation() {
  useTitle("Animation");
  const [up, setUp] = useState(null);
  return (
    <main className="wrap">
      <h1>Animation</h1>
      <p className="lead">Old projects, kept in a drawer. Pull a paper to see it move.</p>
      <div className="drawer-scene">
        <Art id="animBg" className="fill" />
        <div className="papers">
          {PAPERS.map((p, i) => (
            <button key={p.id} className={"paper" + (up === i ? " up" : "")} style={{ "--tilt": `${(i - 2) * 2}deg` }}
              onClick={() => setUp(up === i ? null : i)}>
              <Art id={p.id} />
              <span>{p.title}</span>
            </button>
          ))}
        </div>
        <Art id="drawerFront" className="front" />
      </div>
    </main>
  );
}

/* ---------------- RIG & TOOLS ---------------- */
export function RigTools() {
  useTitle("Rig & Tools");
  const [sel, setSel] = useState(null);
  return (
    <main className="wrap">
      <h1>Rig &amp; Tools</h1>
      <p className="lead">The mechanical workshop, where the puppets are built.</p>
      <div className="workshop">
        <Art id="workshopBg" className="fill" />
        <button className="board b1" onClick={() => setSel("rigs")}><Art id="boardRigs" /><span className="sr">Open Rigs</span></button>
        <button className="board b2" onClick={() => setSel("tools")}><Art id="boardTools" /><span className="sr">Open Anim Tools</span></button>
        <Art id="tools" className="prop p1" />
        <Art id="parts" className="prop p2" />
        <Art id="blueprints" className="prop p3" />
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel && BOARDS[sel].title}>
        <p>{sel && BOARDS[sel].text}</p>
      </Modal>
    </main>
  );
}

/* ---------------- ABOUT ---------------- */
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

/* ---------------- CONTACT ---------------- */
export function Contact() {
  useTitle("Contact");
  return (
    <main className="wrap contact">
      <h1 className="sr">Contact</h1>
      <div className="door">
        <Art id="door" className="fill" />
        <Art id="openSign" className="open-sign" />
        {CONFIG.openToWork && <p className="note">OPEN to work</p>}
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
