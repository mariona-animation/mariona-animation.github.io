export const CONFIG = {
  name: "Mariona Molera",
  openToWork: true, // posa false per treure la nota "OPEN to work" de Contact
  email: "mariona.animation@gmail.com",
  linkedin: "https://www.linkedin.com/in/mariona-molera",
  cv: "https://canva.link/zunpbl0tav8vkty",
  showreelId: "eb_JSiHpqLQ",
};

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/animation", label: "Animation" },
  { to: "/rig-tools", label: "Rig & Tools" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const PROJECTS = Array.from({ length: 8 }, (_, i) => ({
  id: `puppet${i + 1}`,
  title: `Project ${i + 1}`,
  text: "Coming soon.",
}));

export const PAPERS = Array.from({ length: 5 }, (_, i) => ({
  id: `paper${i + 1}`,
  title: `Personal piece ${i + 1}`,
}));

export const BOARDS = {
  rigs: { title: "Rigs", text: "Coming soon: the rigging work, character by character." },
  tools: { title: "Anim Tools", text: "Coming soon: the tools built to speed up animation." },
};
