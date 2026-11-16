"use client";

import { useRef } from "react";
import { servicios } from "@/data/servicios";
import { site } from "@/data/site";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import PillLink from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export default function Proceso() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 70%", scrub: 0.5 },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.from(step.querySelectorAll("[data-step-anim]"), {
          autoAlpha: 0,
          y: 30,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: step, start: "top 75%", once: true },
        });
        const dot = step.querySelector("[data-dot]");
        if (dot) {
          gsap.from(dot, {
            scale: 0,
            duration: 0.6,
            ease: "back.out(2)",
            scrollTrigger: { trigger: step, start: "top 70%", once: true },
          });
        }
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="proceso"
      aria-labelledby="proceso-title"
      className="on-light bg-crema px-4 py-24 sm:px-6 md:py-36 lg:px-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="05" label="Del plano a la llave" />

        <div className="mt-14 grid gap-8 md:mt-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <RevealLines id="proceso-title" className="font-display max-w-[14ch] text-[clamp(2.6rem,6.4vw,6rem)]">
            Elegí hasta dónde querés que me <em className="kw">involucre.</em>
          </RevealLines>
          <Reveal>
            <p className="max-w-md text-texto-suave lg:justify-self-end">
              Tres formas de trabajar juntos. Cada etapa suma a la anterior: desde decidir con información hasta
              recibir las llaves.
            </p>
          </Reveal>
        </div>

        <ol data-steps className="relative mt-20 md:mt-28">
          {/* Línea guía + línea que se dibuja */}
          <div className="absolute bottom-0 left-[0.6875rem] top-0 w-px bg-carbon/12 md:left-[calc(9rem+0.6875rem)]" aria-hidden="true">
            <div ref={lineRef} className="h-full w-px origin-top bg-petroleo" />
          </div>

          {servicios.map((s) => (
            <li
              key={s.numero}
              data-step
              className="relative grid gap-6 pb-20 pl-12 last:pb-0 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-0 md:pl-0 md:pb-28"
            >
              <span
                data-dot
                className={`absolute left-0 top-3 h-[1.375rem] w-[1.375rem] rounded-full border md:left-[9rem] ${
                  s.destacado ? "border-petroleo bg-petroleo" : "border-petroleo bg-crema"
                }`}
                aria-hidden="true"
              />
              <span data-step-anim className="num text-[clamp(3.5rem,7vw,6.5rem)] leading-none text-dorado md:pr-8">
                {s.numero}
              </span>

              <div className="md:pl-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
                <div>
                  <div data-step-anim className="flex flex-wrap items-center gap-3">
                    <span className="label text-dorado-oscuro">Incluye {s.incluye}</span>
                    {s.destacado && (
                      <span className="label rounded-full bg-petroleo px-3 py-1.5 text-crema">El más elegido</span>
                    )}
                  </div>
                  <h3 data-step-anim className="mt-4 font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1.05] tracking-[-0.02em]">
                    {s.titulo}
                  </h3>
                </div>
                <div data-step-anim className="mt-5 lg:mt-12">
                  <p className="text-lg text-texto-suave">{s.texto}</p>
                  {s.destacado && (
                    <PillLink href={site.whatsapp} external className="mt-8">
                      <WhatsAppIcon className="h-5 w-5" />
                      Consultame por WhatsApp
                    </PillLink>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
