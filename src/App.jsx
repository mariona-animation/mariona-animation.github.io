import { useEffect } from "react";
import { NavLink, Routes, Route, Link, useLocation } from "react-router-dom";
import { NAV } from "./content.js";
import { Home, Projects, Animation, RigTools, About, Contact } from "./pages.jsx";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <a className="skip" href="#main">Skip to content</a>
      <header className="bar">
        <Link to="/" className="brand">Mariona Molera</Link>
        <nav aria-label="Main">
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end>{n.label}</NavLink>)}
        </nav>
      </header>
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
    </>
  );
}
