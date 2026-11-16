import { pasosRender } from "@/data/servicios";
import { site } from "@/data/site";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import PillLink from "@/components/ui/PillLink";
import HouseSketch from "@/components/ui/HouseSketch";
import { ArrowRight } from "@/components/ui/Icons";

export default function Render() {
  return (
    <section
      id="render"
      aria-labelledby="render-title"
      className="relative overflow-hidden bg-petroleo px-4 py-24 text-crema sm:px-6 md:py-36 lg:px-10"
    >
      {/* Grilla de papel milimetrado, muy sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--crema)_1px,transparent_1px),linear-gradient(90deg,var(--crema)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative mx-auto max-w-[1600px]">
        <SectionHead numero="06" label="Render gratis" tone="dark" />

        <div className="mt-14 grid gap-16 md:mt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="label text-dorado-claro">Gratis · 5 minutos</p>
            <RevealLines
              id="render-title"
              className="mt-6 font-display text-[clamp(2.8rem,7vw,6.75rem)]"
            >
              Contame tu proyecto y te lo devuelvo{" "}
              <em className="font-light italic text-dorado-claro">dibujado.</em>
            </RevealLines>
            <Reveal>
              <p className="mt-8 max-w-xl text-lg text-crema/80">
                Casa, local o edificio, obra nueva o reforma: respondés un cuestionario pensado para tu proyecto y
                con eso armo un render conceptual. Sin costo y sin compromiso.
              </p>
            </Reveal>

            <Reveal stagger className="mt-14 grid border-t border-crema/20 sm:grid-cols-2">
              {pasosRender.map((p, i) => (
                <div
                  key={p.titulo}
                  className={`border-b border-crema/20 py-7 sm:py-8 ${i % 2 === 0 ? "sm:border-r sm:pr-8" : "sm:pl-8"}`}
                >
                  <span className="num text-3xl text-dorado-claro">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg font-semibold">{p.titulo}</h3>
                  <p className="mt-2 text-[0.9375rem] text-crema/70">{p.texto}</p>
                </div>
              ))}
            </Reveal>

            <Reveal className="mt-12 flex flex-col items-start gap-5">
              <PillLink href={site.cuestionario} variant="light" size="lg">
                Empezar mi render gratis
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
              </PillLink>
              <p className="max-w-md text-sm text-crema/65">
                El bosquejo y el render son conceptuales: sirven para explorar ideas, no son un proyecto de
                arquitectura. El proyecto detallado se define después, en la llamada.
              </p>
            </Reveal>
          </div>

          {/* Visual: bosquejo en line-art */}
          <div className="relative flex items-center lg:sticky lg:top-24 lg:h-[min(80svh,46rem)] lg:self-start">
            <div className="relative w-full border border-crema/20 p-6 sm:p-10">
              <div className="label mb-6 flex justify-between text-crema/55">
                <span>Bosquejo</span>
                <span>Lámina 01</span>
              </div>
              <HouseSketch className="h-auto w-full" />
              <div className="label mt-6 flex justify-between border-t border-crema/20 pt-4 text-crema/55">
                <span>Render conceptual</span>
                <span className="italic normal-case tracking-normal">{site.nombre}</span>
              </div>
              {/* Esquinas tipo marca de corte */}
              <span aria-hidden="true" className="absolute -left-2 -top-2 h-4 w-4 border-l border-t border-dorado-claro" />
              <span aria-hidden="true" className="absolute -right-2 -top-2 h-4 w-4 border-r border-t border-dorado-claro" />
              <span aria-hidden="true" className="absolute -bottom-2 -left-2 h-4 w-4 border-b border-l border-dorado-claro" />
              <span aria-hidden="true" className="absolute -bottom-2 -right-2 h-4 w-4 border-b border-r border-dorado-claro" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
