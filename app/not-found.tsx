import type { Metadata } from "next";
import PillLink from "@/components/ui/PillLink";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="nf-title"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-carbon px-4 pb-16 pt-32 text-crema sm:px-6 lg:px-10 lg:pb-24"
    >
      {/* Papel milimetrado, como la sección Render */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(var(--crema)_1px,transparent_1px),linear-gradient(90deg,var(--crema)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="mx-auto w-full max-w-[1600px]">
        <p className="label flex items-center gap-3 text-dorado-claro">
          <span className="h-px w-8 bg-dorado" aria-hidden="true" />
          Error <span className="num text-sm normal-case tracking-normal">404</span>
        </p>
        <h1
          id="nf-title"
          className="mt-6 max-w-[14ch] font-display text-[clamp(3.1rem,12vw,7rem)] leading-[0.9]! tracking-[-0.035em]! [font-variation-settings:'opsz'_144] lg:text-[min(9vw,11rem)]"
        >
          Este plano <em className="kw">no existe</em>.
        </h1>
        <div className="mt-10 flex flex-col gap-8 border-t border-crema/20 pt-8 md:mt-14 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg text-crema/80">
            La página que buscás no está o cambió de dirección. Volvé al inicio o mirá las obras.
          </p>
          <div className="flex flex-wrap gap-3">
            <PillLink href="/" variant="light">
              <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
              Inicio
            </PillLink>
            <PillLink href="/#obras" variant="outline-light">
              Ver obras
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
