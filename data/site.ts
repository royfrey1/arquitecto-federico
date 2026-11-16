export const site = {
  nombre: "Federico Marzano Pacheco",
  rol: "Arquitecto y desarrollador",
  experiencia: "25 años de experiencia",
  descripcion:
    "Casas pensadas antes de construirse. Arquitectura y obra en Zona Norte y CABA, 25 años de experiencia.",
  whatsapp: "https://wa.me/5491157130540",
  telefono: "+54 9 11 5713-0540",
  instagram: "https://instagram.com/federicoarquitecto",
  instagramHandle: "@federicoarquitecto",
  cuestionario: "/cuestionario",
  zonas: ["Nordelta", "Escobar", "Pilar", "Cardales", "CABA"],
  credito: { nombre: "Selva Code", url: "https://selva-code.vercel.app" },
} as const;

export const nav = [
  { label: "Obras", href: "/#obras" },
  { label: "Antes y después", href: "/#antes" },
  { label: "Proceso", href: "/#proceso" },
  { label: "Sobre mí", href: "/#sobre-mi" },
  { label: "Consultas", href: "/#faq" },
] as const;
