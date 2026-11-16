import { notFound } from "next/navigation";
import { renderOg, OG_SIZE } from "@/lib/og";
import { getObra, obras } from "@/data/obras";

export const alt = "Obra de Federico Marzano Pacheco";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return obras.map((o) => ({ slug: o.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const obra = getObra(slug);
  if (!obra) notFound();
  const n = obras.findIndex((o) => o.slug === slug) + 1;
  return renderOg({
    image: obra.videoPrincipal.poster,
    focusY: 45,
    eyebrow: `Obra ${String(n).padStart(2, "0")} · ${obra.estado}`,
    title: { text: obra.nombre },
    titleSize: obra.nombre.length > 18 ? 104 : 120,
    footer: `${obra.ubicacion} · ${obra.tipo}`,
  });
}
