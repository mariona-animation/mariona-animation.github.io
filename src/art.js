// ============================================================
//  Tots els dibuixos de la web. Cada entrada és un placeholder
//  de color sòlid. Quan tinguis el PNG, copia'l a public/assets
//  i escriu el camí a `src`, p. ex.  src: "/assets/curtain-left.png"
//  Per a vídeos (MP4/WebM) fes servir `video` en comptes de `src`.
// ============================================================
const hue = (i, n) => `hsl(${Math.round((i * 360) / n)} 45% 42%)`;

export const ART = {
  // MENÚ (cartells de dalt)
  navHome:      { color: "#8c1d2c", label: "Home" },
  navProjects:  { color: "#2b5d9b", label: "Projects" },
  navAnimation: { color: "#4f8a4b", label: "Animation" },
  navRig:       { color: "#c46b2d", label: "Rig & Tools" },
  navAbout:     { color: "#7b4d8f", label: "About" },
  navContact:   { color: "#4c8c8a", label: "Contact" },
  // HOME
  homeBg:    { color: "#3b2a4a", label: "Theatre back wall" },
  homeAnim:  { color: "#2f6f73", label: "Autoplay animation (best work)", video: "" },
  curtainL:  { color: "#8c1d2c", label: "Curtain left" },
  curtainR:  { color: "#a8323f", label: "Curtain right" },
  floor:     { color: "#6b4426", label: "Stage floor" },
  lever:     { color: "#d4a017", label: "Lever" },
  posterLinkedin: { color: "#2b5d9b", label: "LinkedIn poster" },
  posterMail:     { color: "#b5483a", label: "Gmail poster" },
  posterCv:       { color: "#4f8a4b", label: "CV poster" },
  // PROJECTS
  ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`puppet${i + 1}`, { color: hue(i, 6), label: `Puppet ${i + 1}` }])),
  // ANIMATION
  animBg:      { color: "#5a3d28", label: "Open drawer (back)" },
  drawerFront: { color: "#7d5233", label: "Drawer front" },
  ...Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`paper${i + 1}`, { color: hue(i + 0.5, 5), label: `Paper ${i + 1}`, video: "" }])),
  // RIG & TOOLS
  workshopBg:  { color: "#44505a", label: "Workshop wall" },
  boardRigs:   { color: "#27403a", label: "Chalkboard: Rigs" },
  boardTools:  { color: "#3a3a5c", label: "Chalkboard: Anim Tools" },
  tools:       { color: "#c46b2d", label: "Tools" },
  parts:       { color: "#7a8f3c", label: "Parts" },
  blueprints:  { color: "#2d6ca3", label: "Blueprints" },
  // ABOUT
  aboutPuppeteer: { color: "#7b4d8f", label: "Mariona as puppeteer (workshop)" },
  aboutPhoto:     { color: "#c9774d", label: "Photo poster" },
  aboutBio:       { color: "#4c8c8a", label: "Bio poster" },
  aboutExp:       { color: "#a3a33a", label: "Experience poster" },
  aboutSkills:    { color: "#b0507a", label: "Skills poster" },
  // CONTACT
  door:     { color: "#5b3a24", label: "Workshop door (amb cartell OPEN to work dibuixat)" },
};
