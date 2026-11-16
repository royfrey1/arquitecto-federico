"use client";

import { useId, useState } from "react";
import { faq } from "@/data/faq";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="on-light bg-crema-2 px-4 py-24 sm:px-6 md:py-36 lg:px-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="08" label="Consultas" />

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <RevealLines id="faq-title" className="font-display text-[clamp(2.6rem,6vw,5.75rem)]">
            Preguntas <em className="kw">frecuentes</em>
          </RevealLines>

          <ul className="border-t border-carbon/20">
            {faq.map((item, i) => {
              const isOpen = open === i;
              const btnId = `${baseId}-q${i}`;
              const panelId = `${baseId}-a${i}`;
              return (
                <li key={item.pregunta} className="border-b border-carbon/20">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-start gap-5 py-6 text-left md:py-8"
                    >
                      <span className="num w-8 shrink-0 pt-1 text-sm text-dorado-oscuro">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-serif text-xl leading-snug md:text-[1.75rem]">{item.pregunta}</span>
                      <span
                        aria-hidden="true"
                        className={`relative mt-2 h-4 w-4 shrink-0 transition-transform duration-500 ease-[var(--ease-editorial)] ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        <span className="absolute left-0 top-1/2 h-px w-4 bg-carbon" />
                        <span className="absolute left-1/2 top-0 h-4 w-px bg-carbon" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-editorial)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-8 pl-13 text-lg text-texto-suave">{item.respuesta}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
