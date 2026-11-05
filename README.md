# Mariona Molera — web

Web estàtica (HTML + CSS + JS natiu, sense dependències ni build) publicable tal qual a GitHub Pages, també en subdirectoris: totes les rutes són relatives i la navegació usa `#/pàgina`.

```
index.html
src/
  css/   style.css (base, marc, escenes) · components.css · responsive.css
  js/    main.js (pàgines i router) · components.js (dibuixos, modal, helpers)
  data/  art.json (dibuixos: posició, capa, mode…) · content.json (textos i enllaços)
  img/   icons/ (cartells del menú) · logos/ (pòsters) · illustrations/<pàgina>/ · diagrams/
  video/ vídeos (MP4)
tools/   generate_placeholders.py — regenera els placeholders des de dibuixos_web.xlsx
```

## Executar en local
Cal servir la carpeta per HTTP (els mòduls i els JSON no funcionen amb `file://`):
`python3 -m http.server` i obrir http://localhost:8000

## Substituir un placeholder per un dibuix definitiu
Sobreescriu el fitxer amb el mateix nom i mida (veure l'Excel). Si canvies la ruta, edita `src/data/art.json`.
Textos, correu, LinkedIn, CV i ID de YouTube: `src/data/content.json`.

## Domini propi (quan toqui)
Crea un fitxer `CNAME` a l'arrel amb el domini i configura Pages (Settings → Pages).
