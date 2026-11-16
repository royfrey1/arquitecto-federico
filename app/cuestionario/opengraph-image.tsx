import { renderOg, OG_SIZE } from "@/lib/og";

export const alt = "Diseñá tu proyecto: cuestionario de 5 minutos para tu render gratis.";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default function Image() {
  return renderOg({
    image: "/media/hero/hero-lago-poster.jpg",
    focusY: 40,
    eyebrow: "Gratis · 5 minutos",
    title: { text: "Diseñá tu proyecto.", italic: "proyecto" },
    titleSize: 110,
    footer: "Casa, local o edificio: respondé el cuestionario y recibí tu render conceptual.",
  });
}
