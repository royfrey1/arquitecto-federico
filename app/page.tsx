import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Manifiesto from "@/components/sections/Manifiesto";
import ObrasIndex from "@/components/sections/ObrasIndex";
import ObraDestacada from "@/components/sections/ObraDestacada";
import AntesDespues from "@/components/sections/AntesDespues";
import Proceso from "@/components/sections/Proceso";
import Render from "@/components/sections/Render";
import SobreMi from "@/components/sections/SobreMi";
import Faq from "@/components/sections/Faq";
import Contacto from "@/components/sections/Contacto";
import PageTransition from "@/components/ui/PageTransition";
import { site } from "@/data/site";
import { jsonLdHome, ldJson, social } from "@/lib/seo";

const title = `${site.nombre} — ${site.rol}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: site.descripcion,
  ...social({ title, description: site.descripcion, path: "/" }),
};

export default function Home() {
  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLdHome()) }} />
      <Hero />
      <Manifiesto />
      <ObrasIndex />
      <ObraDestacada />
      <AntesDespues />
      <Proceso />
      <Render />
      <SobreMi />
      <Faq />
      <Contacto />
    </PageTransition>
  );
}
