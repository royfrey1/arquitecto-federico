import type { Metadata } from "next";
import { site } from "@/data/site";
import { faq } from "@/data/faq";
import type { Obra } from "@/data/obras";

/** Dominio público. Se define con NEXT_PUBLIC_SITE_URL (ver .env.example). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://arquitecto-federico.vercel.app").replace(/\/+$/, "");

export const abs = (path: string) => new URL(path, SITE_URL + "/").toString();

/**
 * Open Graph + Twitter comunes. La imagen la aporta cada `opengraph-image.tsx`
 * (Next la agrega sola como og:image; Twitter/X usa og:image como respaldo).
 */
export function social({ title, description, path, type = "website" }: { title: string; description: string; path: string; type?: "website" | "article" }): Metadata {
  return {
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      locale: "es_AR",
      siteName: site.nombre,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ---------- JSON-LD ---------- */

const personId = abs("/#federico");
const businessId = abs("/#estudio");

export function jsonLdHome() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": businessId,
      name: site.nombre,
      description: site.descripcion,
      url: abs("/"),
      telephone: site.telefono,
      logo: abs("/brand/logo-mp.png"),
      image: abs("/opengraph-image"),
      areaServed: site.zonas.map((name) => ({ "@type": "Place", name })),
      sameAs: [site.instagram],
      founder: { "@id": personId },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": personId,
      name: site.nombre,
      jobTitle: site.rol,
      image: abs("/brand/federico.jpg"),
      url: abs("/"),
      sameAs: [site.instagram],
      worksFor: { "@id": businessId },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.pregunta,
        acceptedAnswer: { "@type": "Answer", text: f.respuesta },
      })),
    },
  ];
}

export function jsonLdObra(obra: Obra) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: obra.nombre,
    description: obra.descripcionLarga || obra.descripcionCorta,
    url: abs(`/obras/${obra.slug}`),
    image: [abs(`/obras/${obra.slug}/opengraph-image`), abs(obra.videoPrincipal.poster)],
    genre: obra.tipo,
    locationCreated: { "@type": "Place", name: obra.ubicacion },
    creator: { "@type": "Person", "@id": personId, name: site.nombre },
  };
}

/** Serializa JSON-LD escapando "<" (evita cerrar el <script> desde un texto). */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
