import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { site } from "@/data/site";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/*
  metadataBase desde NEXT_PUBLIC_SITE_URL (fallback: https://arquitecto-federico.vercel.app).
  Íconos por convención de archivos: app/favicon.ico, app/icon.png y app/apple-icon.png.
  Imágenes OG: opengraph-image.tsx en app/, app/cuestionario y app/obras/[slug].
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.nombre} — ${site.rol}`,
    template: `%s — ${site.nombre}`,
  },
  description: site.descripcion,
  applicationName: site.nombre,
  authors: [{ name: site.nombre, url: SITE_URL }],
  creator: site.nombre,
  formatDetection: { telephone: false, email: false, address: false },
  // Base para páginas sin metadata propia (la canónica la define cada página).
  openGraph: { type: "website", locale: "es_AR", siteName: site.nombre },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#141414",
  colorScheme: "light",
};

/*
  Apertura cinematográfica del hero: solo en la primera carga de "/" de la sesión y sin
  prefers-reduced-motion. Corre antes del primer pintado para que no haya parpadeo; el Hero
  la reproduce y quita el atributo. Failsafe: se quita sola a los 6 s.
*/
const introScript = `try{var d=document.documentElement;if(location.pathname==="/"&&!sessionStorage.getItem("mp-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="playing";sessionStorage.setItem("mp-intro","1");setTimeout(function(){delete d.dataset.intro},6000)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: el script de apertura agrega data-intro antes de hidratar.
    <html lang="es-AR" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <noscript>
          <style>{`[data-reveal-lines]{visibility:visible!important}`}</style>
        </noscript>
        <SmoothScroll />
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
