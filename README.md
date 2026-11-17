# Edward Aranda — Portfolio

Portfolio personal de **Edward Aranda** — 3D Character Artist, 3D Animator & Visual Designer (Mérida, Yucatán).

Sitio estático de una sola página, responsive, sin frameworks ni build step: **HTML + CSS + JavaScript vanilla**. Listo para servirse directamente con GitHub Pages.

## Contenido

- Hero editorial con retrato 3D y animaciones de entrada.
- Featured film: corto animado *Coffee & Co.* con reproductor modal.
- Galería de 13 proyectos con filtros (3D Product, Motion, Editorial, Branding), previews de video al hover y lightbox con navegación por teclado.
- About, experiencia (tomada del CV), estadísticas animadas, skills y software.
- Contacto con email, teléfono, Behance y reloj local de Mérida.
- Menú móvil a pantalla completa, cursor personalizado y soporte de `prefers-reduced-motion`.

## Estructura

```
.
├── index.html                 # Página principal
├── css/
│   ├── base.css               # Reset, tokens, header, loader, cursor
│   ├── hero.css               # Hero, retrato, marquee
│   ├── work.css               # Secciones, featured film, galería, quote
│   ├── about.css              # About, experiencia, skills, contacto, lightbox
│   └── responsive.css         # Breakpoints + reduced motion
├── js/
│   └── main.js                # Interacciones (vanilla JS)
├── assets/
│   ├── web/                   # ✅ Media optimizada (se publica)
│   │   ├── img/               # WebP 800w / 1600w
│   │   ├── posters/           # Posters de los videos
│   │   ├── video/             # MP4 comprimidos
│   │   ├── fonts/             # WOFF2 locales
│   │   └── Edward-Aranda-CV.pdf
│   └── *.mp4 / *.png / *.zip  # ❌ Originales pesados (ignorados por git)
├── favicon.svg
├── .nojekyll
└── .gitignore
```

## Ver el sitio en local

Como usa rutas relativas, funciona con cualquier servidor estático:

```bash
# desde la raíz del repo
python -m http.server 8787
# abrir http://localhost:8787
```

También puedes abrir `index.html` directamente, aunque se recomienda el servidor para que los videos y las fuentes carguen sin restricciones del navegador.

## Publicar en GitHub Pages

El sitio está en la raíz del repo y todas las rutas son relativas, así que funciona tanto en `usuario.github.io` como en `usuario.github.io/Portfolio/`.

1. Haz commit y push de la web a la rama principal:

   ```bash
   git add .
   git commit -m "Add responsive 3D portfolio site"
   git push origin main
   ```

   La rama actual de este repo es **`main`**. Si prefieres publicar desde **`master`**, usa esa rama en el paso 2 (el workflow no está atado a un nombre concreto).

2. En GitHub: **Settings → Pages → Build and deployment**
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (o `master`) → **`/ (root)`**
   - **Save**

3. Espera el deploy (1–2 min). La URL aparecerá en esa misma pantalla:

   **https://edwardaranda.github.io/Portfolio/**

El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll. No hay build ni acciones necesarias: cada push a la rama elegida actualiza la web.

> También se puede usar **GitHub Actions** si en el futuro se añade un build; ahora no hace falta.

## Notas de media

- Las imágenes originales se convirtieron a **WebP** (dos tamaños para `srcset`) y los videos se recomprimieron con H.264 para que el sitio cargue rápido.
- Los archivos originales de `assets/` (incluido el ZIP de 215 MB y los videos de 97–115 MB) están en `.gitignore` para no exceder los límites de GitHub. La web no los necesita: usa las copias de `assets/web/`.
- Para actualizar una imagen o video, reemplaza el archivo equivalente dentro de `assets/web/` conservando el nombre.

## Créditos

- Arte 3D, animación, diseño y contenido: **Edward Aranda**.
- Tipografías: Space Grotesk, Instrument Serif y JetBrains Mono (Google Fonts, SIL Open Font License), servidas localmente.
- CV: `assets/web/Edward-Aranda-CV.pdf`.
