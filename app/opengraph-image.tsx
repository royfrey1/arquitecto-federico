import { renderOg, OG_SIZE } from "@/lib/og";
import { site } from "@/data/site";

export const alt = "Casas pensadas antes de construirse. Federico Marzano Pacheco, arquitecto y desarrollador.";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default function Image() {
  return renderOg({
    image: "/media/hero/hero-lago-poster.jpg",
    focusY: 40,
    eyebrow: "Puertos Vistas · Escobar",
    title: { text: "Casas pensadas antes de construirse.", italic: "antes" },
    titleSize: 88,
    footer: `${site.experiencia} · ${site.zonas.join(" · ")}`,
  });
}
