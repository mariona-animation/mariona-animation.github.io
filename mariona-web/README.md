# Mariona Molera — web (React + Vite)

Web del taller de titelles. Sis pàgines: Home, Projects, Animation, Rig & Tools, About, Contact.

## Posar-la en marxa
```
npm install
npm run dev        # desenvolupament
npm run build      # genera dist/
```

## Substituir els placeholders per dibuixos
Tot són marcs de color sòlid definits a `src/art.js`.
1. Copia el PNG a `public/assets/` (p. ex. `curtain-left.png`).
2. A `src/art.js` afegeix `src: "/assets/curtain-left.png"` a l'entrada corresponent.
3. Per a vídeos (MP4 o WebM, millor que MOV) fes servir `video: "/assets/loquesigui.mp4"`.
Si l'entrada té `src`, el color i l'etiqueta desapareixen sols.

Els textos i enllaços (correu, LinkedIn, CV, ID del YouTube, "OPEN to work") són a `src/content.js`.

## Publicar a GitHub Pages amb domini propi
1. Puja el projecte a GitHub (branca `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Crea `public/CNAME` amb una sola línia: el teu domini (p. ex. `marionamolera.com`).
4. Al proveïdor del domini, apunta el DNS a GitHub Pages (registres A/CNAME segons la guia de GitHub: "Configuring a custom domain for your GitHub Pages site").
5. A Settings → Pages marca "Enforce HTTPS".

`npm run build` copia `index.html` a `404.html` perquè les rutes (`/projects`, etc.) funcionin en recarregar.
