import { site } from "@/data/site";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import PillLink from "@/components/ui/PillLink";
import { ArrowRight, WhatsAppIcon } from "@/components/ui/Icons";

export default function CtaObra({ numero }: { numero: string }) {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden bg-petroleo px-4 py-24 text-crema sm:px-6 md:py-36 lg:px-10"
    >
      {/* Misma grilla de papel milimetrado que la sección Render de la Home */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--crema)_1px,transparent_1px),linear-gradient(90deg,var(--crema)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="relative mx-auto max-w-[1600px]">
        <SectionHead numero={numero} label="Tu proyecto" tone="dark" />

        <p className="label mt-14 text-dorado-claro md:mt-20">Render gratis · 5 minutos</p>
        <RevealLines id="cta-title" className="mt-6 max-w-[14ch] font-display text-[clamp(3rem,8.5vw,8.5rem)]">
          ¿Te imaginás algo <em className="font-light italic text-dorado-claro">así</em> para vos?
        </RevealLines>

        <Reveal className="mt-12 flex flex-col items-start gap-6 border-t border-crema/20 pt-10 md:mt-16 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-lg text-crema/80">
            Contame tu proyecto y te lo devuelvo dibujado. Sin costo y sin compromiso.
          </p>
          <div className="flex flex-wrap gap-3">
            <PillLink href={site.cuestionario} variant="light" size="lg">
              Empezar mi render gratis
              <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
            </PillLink>
            <PillLink href={site.whatsapp} external variant="outline-light" size="lg">
              <WhatsAppIcon className="h-5 w-5" />
              Hablar por WhatsApp
            </PillLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
