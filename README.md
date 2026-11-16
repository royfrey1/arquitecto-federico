# Federico Marzano Pacheco — sitio web

Sitio de **Federico Marzano Pacheco**, arquitecto y desarrollador (Zona Norte y CABA). Rediseño
"editorial cinematográfico": hero con video a sangre, índice de obras con transiciones entre
páginas, antes/después, proceso, sección de render gratis y el cuestionario **"Diseñá tu
proyecto"** con un bosquejo 3D en vivo que envía las respuestas por WhatsApp.

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components + Partial Prefetching) y **React 19**
- **Tailwind CSS 4** (tokens en `app/globals.css`: crema, crema-2, carbón, carbón-2, petróleo, dorado y variantes AA)
- **GSAP** (ScrollTrigger, SplitText) + **Lenis** para scroll suave; todo respeta `prefers-reduced-motion`
- **three.js**: solo en `/cuestionario`, cargado con `import()` dinámico
- Tipografías **Fraunces** + **Manrope** (`next/font`); imágenes OG con `next/og` + `sharp`

## Cómo correrlo

Requiere Node 20 o superior.

```bash
npm install
cp .env.example .env.local   # opcional: definir NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
npm run lint
npm run build && npm start   # build de producción
```

## Variable de entorno

| Variable | Para qué | Valor por defecto |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública sin barra final. Base de canonical, Open Graph, JSON-LD, sitemap y robots (`metadataBase`). | `https://arquitecto-federico.vercel.app` |

En Vercel: *Project Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL`* (Production) con el
dominio definitivo, por ejemplo `https://www.dominio.com.ar`. Hay que volver a deployar después de cambiarla.

## Estructura

```
app/
  layout.tsx              Layout raíz: fuentes, metadata base, header, footer, WhatsApp flotante
  page.tsx                Home (+ JSON-LD: ProfessionalService, Person, FAQPage)
  obras/[slug]/           Página de cada obra (+ JSON-LD CreativeWork) y su imagen OG
  cuestionario/           /cuestionario y su imagen OG
  not-found.tsx           Página 404
  opengraph-image.tsx     Imagen OG de la Home (1200×630, JPEG)
  sitemap.ts, robots.ts   sitemap.xml y robots.txt
  favicon.ico, icon.png, apple-icon.png   Íconos (convención de archivos de Next)
  globals.css             Tokens y estilos globales
assets/fonts/             Fraunces y Manrope (.woff) para las imágenes OG
components/
  sections/               Secciones de la Home, Header y Footer
  obra/                   Portada, ficha técnica, galería, visor, CTA y "Siguiente obra"
  cuestionario/           Cuestionario: engine.ts (lógica), sketch.ts (bosquejo 3D), estilos
  ui/                     Piezas reutilizables (CinemaStage, LazyVideo, PillLink, Reveal…)
data/                     Contenido: site.ts, obras.ts, antes-despues.ts, faq.ts, servicios.ts
lib/                      GSAP, Lenis, hooks, SEO (seo.ts) y plantilla OG (og.tsx)
public/
  brand/                  Logo e íconos
  media/                  Videos (versión desktop y "-m" mobile), posters y fotos por obra
```

El contenido editable (textos, obras, preguntas frecuentes, teléfono, Instagram, zonas) está en `data/`.

## Reemplazar la foto de Federico

La sección "Sobre mí" (`components/sections/SobreMi.tsx`) muestra **`/public/brand/federico.jpg`**
con `next/image` en un recuadro 4:5 (también se usa como `image` en el JSON-LD de Person).

1. Preparar la foto nueva, vertical (ideal 4:5, 1200×1500 px o más).
2. Guardarla con **otro nombre** en `/public/brand/` (por ejemplo `federico-2.jpg`): `/brand/*` tiene
   caché de un año, así que reemplazar el archivo con el mismo nombre puede no verse en navegadores
   que ya lo tengan guardado.
3. Cambiar la ruta en `SobreMi.tsx` (`src="/brand/…"`) y en `lib/seo.ts` (`image: abs("/brand/…")`).
4. Ajustar el encuadre con `object-[50%_68%]` en el `className` de la imagen (el segundo valor
   sube o baja el recorte vertical).
5. `npm run build` para verificar.

## Notas de deploy (Vercel)

- `/media/*` y `/brand/*` se sirven con `Cache-Control: public, max-age=31536000, immutable`.
  Si se **reemplaza** un archivo, hay que **cambiarle el nombre** (por ejemplo `pv-pileta-v2.mp4`)
  y actualizar `data/`; si no, los navegadores pueden seguir mostrando la versión vieja hasta un año.
- `next.config.ts` fija `turbopack.root` con `path.resolve(__dirname)` (sin rutas absolutas de la máquina).
- Las imágenes OG se generan en el build.
