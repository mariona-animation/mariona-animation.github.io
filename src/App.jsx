import { useEffect, useState } from "react";
import { NavLink, Routes, Route, Link, useLocation } from "react-router-dom";
import { NAV, CONFIG } from "./content.js";
import { Art, getArt } from "./ui.jsx";
import { Home, Projects, Animation, RigTools, About, Contact } from "./pages.jsx";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { document.getElementById("view")?.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Pòsters penjats a la part baixa del marc. Home: sempre visibles.
// Resta: mig amagats; surten amb hover, focus o rodeta cap avall.
function Posters() {
  const { pathname } = useLocation();
  const home = pathname === "/";
  const [peek, setPeek] = useState(false);
  useEffect(() => {
    let t;
    const onWheel = (e) => {
      if (e.deltaY > 0) { setPeek(true); clearTimeout(t); t = setTimeout(() => setPeek(false), 3500); }
      else if (e.deltaY < 0) setPeek(false);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => { window.removeEventListener("wheel", onWheel); clearTimeout(t); };
  }, []);
  useEffect(() => { setPeek(false); }, [pathname]);
  return (
    <nav className={"posters" + (home ? " full" : peek ? " peek" : "")} aria-label="Contact links">
      <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Art id="posterLinkedin" fill /></a>
      <a href={`mailto:${CONFIG.email}`} aria-label="Email"><Art id="posterMail" fill /></a>
      <a href={CONFIG.cv} target="_blank" rel="noopener noreferrer" aria-label="CV"><Art id="posterCv" fill /></a>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="inner">
        <div className="view" id="view">
          <ScrollTop />
          <div id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/animation" element={<Animation />} />
              <Route path="/rig-tools" element={<RigTools />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<main className="plain"><h1>Page not found</h1><Link to="/">Back to the stage</Link></main>} />
            </Routes>
          </div>
        </div>
        <header className="bar">
          <Link to="/" className="brand">Mariona Molera</Link>
          <nav aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end className="sign">
                <Art id={n.art} fill />
                <span className="sr">{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </header>
        <Posters />
      </div>
      <div className={"frame" + (getArt("frame").src ? "" : " ph")} aria-hidden="true"><Art id="frame" fill /></div>
      <div className="fx" aria-hidden="true">
        <Art id="fxParticles" fill />
        <Art id="fxGrain" fill />
        <Art id="fxVignette" fill />
      </div>
    </>
  );
}
