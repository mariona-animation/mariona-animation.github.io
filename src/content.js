export const CONFIG = {
  name: "Mariona Molera",
  openToWork: true, // (ja no s'usa: el cartell OPEN va dibuixat a la porta)
  email: "mariona.animation@gmail.com",
  linkedin: "https://www.linkedin.com/in/mariona-molera",
  cv: "https://canva.link/zunpbl0tav8vkty",
  showreelId: "eb_JSiHpqLQ",
};

export const NAV = [
  { to: "/", label: "Home", art: "navHome" },
  { to: "/projects", label: "Projects", art: "navProjects" },
  { to: "/animation", label: "Animation", art: "navAnimation" },
  { to: "/rig-tools", label: "Rig & Tools", art: "navRig" },
  { to: "/about", label: "About", art: "navAbout" },
  { to: "/contact", label: "Contact", art: "navContact" },
];

export const PROJECTS = Array.from({ length: 6 }, (_, i) => ({
  id: `puppet${i + 1}`,
  title: `Project ${i + 1}`,
  text: "Coming soon.",
}));

// file = dibuix del fitxer; anim = vídeo de l'animació
export const PAPERS = Array.from({ length: 5 }, (_, i) => ({
  id: `file${i + 1}`,
  anim: `anim${i + 1}`,
  title: `Personal piece ${i + 1}`,
}));

export const BOARDS = {
  rigs: { title: "Rigs", text: "Coming soon: the rigging work, character by character." },
  tools: { title: "Anim Tools", text: "Coming soon: the tools built to speed up animation." },
};
