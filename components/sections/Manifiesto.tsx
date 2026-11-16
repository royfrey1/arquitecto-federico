"use client";

import { useRef } from "react";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const datos = [
  { valor: "25 años", texto: "de experiencia" },
  { valor: "Un solo responsable", texto: "del boceto a la llave" },
  { valor: "Zona Norte", texto: "y CABA" },
];

export default function Manifiesto() {
  const ref = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = quoteRef.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, {
        type: "words",
        autoSplit: true,
        // "hidden": las palabras quedan aria-hidden y SplitText agrega una copia solo para lectores
        // de pantalla (con "auto" pondría aria-label en un <p>, atributo no permitido ahí).
        aria: "hidden",
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
            },
          );
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="manifiesto"
      aria-label="Manifiesto"
      className="on-light bg-crema px-4 py-24 sm:px-6 md:py-36 lg:px-10 lg:py-44"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="01" label="Manifiesto" />

        <p
          ref={quoteRef}
          className="mt-14 max-w-[22ch] font-serif text-[clamp(2.4rem,6.4vw,6.5rem)] font-light leading-[1.02] tracking-[-0.025em] md:mt-20"
        >
          Cada casa es distinta. Lo que no cambia es <em className="kw">cómo la pienso.</em>
        </p>

        <Reveal stagger className="mt-20 grid border-t border-carbon/15 md:mt-28 md:grid-cols-3">
          {datos.map((d, i) => (
            <div
              key={d.valor}
              className={`flex flex-col gap-3 border-b border-carbon/15 py-8 md:border-b-0 md:py-10 ${
                i > 0 ? "md:border-l md:pl-10" : ""
              } ${i < 2 ? "md:pr-10" : ""}`}
            >
              <span className="num text-sm text-dorado-oscuro">0{i + 1}</span>
              <p className="font-serif text-3xl font-light leading-tight md:text-[2.5rem]">
                {d.valor}
                <span className="block text-texto-suave italic">{d.texto}</span>
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
