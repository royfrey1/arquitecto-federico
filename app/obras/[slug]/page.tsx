import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getObra, getSiguienteObra, obras } from "@/data/obras";
import { antesDespues } from "@/data/antes-despues";
import { site } from "@/data/site";
import { jsonLdObra, ldJson, social } from "@/lib/seo";
import PageTransition from "@/components/ui/PageTransition";
import ObraPortada from "@/components/obra/ObraPortada";
import FichaTecnica from "@/components/obra/FichaTecnica";
import Galeria from "@/components/obra/Galeria";
import CtaObra from "@/components/obra/CtaObra";
import SiguienteObra from "@/components/obra/SiguienteObra";
import AntesDespues from "@/components/sections/AntesDespues";

export function generateStaticParams() {
  return obras.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/obras/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const obra = getObra(slug);
  if (!obra) return {};
  return {
    title: obra.nombre,
    description: obra.descripcionCorta,
    ...social({
      title: `${obra.nombre} — ${site.nombre}`,
      description: obra.descripcionCorta,
      path: `/obras/${obra.slug}`,
      type: "article",
    }),
  };
}

/*
  App Shell compartido por las 6 obras: la lectura de `params` vive dentro de <Suspense>
  (requisito de Partial Prefetching para que la navegación sea instantánea). Como las 6
  rutas se prerenderizan con generateStaticParams, el contenido real ya viene en el HTML
  estático y en el prefetch; el fallback carbón solo se vería en un slug desconocido.
*/
export default function ObraPage({ params }: PageProps<"/obras/[slug]">) {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-[100svh] bg-carbon" aria-hidden="true" />}>
        <ObraContenido params={params} />
      </Suspense>
    </PageTransition>
  );
}

async function ObraContenido({ params }: { params: PageProps<"/obras/[slug]">["params"] }) {
  const { slug } = await params;
  const obra = getObra(slug);
  if (!obra) notFound();

  const index = obras.findIndex((o) => o.slug === slug);
  const pares = antesDespues.filter((p) => p.obraSlug === slug);
  const siguiente = getSiguienteObra(slug);
  /*
    Fondos siempre alternados: portada (video) → ficha crema → galería carbón →
    antes/después crema → CTA petróleo → siguiente obra (video) → footer carbón.
  */

  let n = 1;
  const num = () => String(++n).padStart(2, "0");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLdObra(obra)) }} />
      <ObraPortada obra={obra} numero={index + 1} total={obras.length} />
      <FichaTecnica obra={obra} />
      <Galeria medios={obra.medios} titulo={obra.nombre} tone="carbon" numero={num()} />
      {pares.length > 0 && (
        <AntesDespues
          pares={pares}
          tone="crema"
          numero={num()}
          bajada={pares[0].contexto ? `${pares[0].contexto}. Deslizá para comparar.` : "De la obra a la entrega. Deslizá para comparar."}
        />
      )}
      <CtaObra numero={num()} />
      <SiguienteObra obra={siguiente} />
    </>
  );
}
