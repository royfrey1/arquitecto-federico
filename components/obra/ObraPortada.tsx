"use client";

import { useRef, type CSSProperties } from "react";
import LazyVideo from "@/components/ui/LazyVideo";
import RevealLines from "@/components/ui/RevealLines";
import { StageFx, StageMedia, TextScrim, useStageMotion } from "@/components/ui/CinemaStage";
import { obraTransitionName, type Obra } from "@/data/obras";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = { obra: Obra; numero: number; total: number };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Portada de obra: mismo plano de cine que el hero (a sangre, etalonaje, viñeta, grano,
 * Ken Burns y salida con scroll), sin barras de apertura. El medio es el destino del morph.
 * Excepción: video principal horizontal (Las Vizcachas) → en mobile va en su proporción,
 * sobre el poster desenfocado, para no recortarlo; desde lg va a sangre.
 */
export default function ObraPortada({ obra, numero, total }: Props) {
  const ref = useRef<HTMLElement>(null);
  const v = obra.videoPrincipal;
  const horizontal = v.width > v.height;

  useStageMotion(ref);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-portada-fade]", { autoAlpha: 0, y: 16, duration: 1.1, stagger: 0.1, ease: "expo.out", delay: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const media = (
    <StageMedia
      transitionName={obraTransitionName(obra.slug)}
      className={
        horizontal
          ? "relative w-full aspect-[var(--ar)] lg:absolute lg:inset-0 lg:-z-20 lg:aspect-auto"
          : "absolute inset-0 -z-20"
      }
    >
      <LazyVideo
        src={v.src}
        srcMobile={v.srcMobile}
        poster={v.poster}
        alt={v.alt}
        sizes="100vw"
        eager
        mediaClassName="object-[50%_50%] lg:object-[50%_45%]"
        className="h-full w-full"
      />
    </StageMedia>
  );

  return (
    <section
      ref={ref}
      aria-labelledby="obra-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-carbon text-crema"
      style={{ "--ar": v.width / v.height } as CSSProperties}
    >
      {!horizontal && media}
      <StageFx backdrop={horizontal ? v.poster : undefined} />

      <div
        className={`mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-6 sm:px-6 lg:justify-end lg:px-10 lg:pb-8 ${
          horizontal ? "justify-center gap-10 pt-[calc(var(--header-h)+1.5rem)] lg:pt-32" : "justify-end pt-32"
        }`}
      >
        {/* Horizontal: en mobile la caja va en el flujo (arriba del texto); en lg pasa a sangre */}
        {horizontal && media}

        <div data-stage-text="" className="relative">
          <TextScrim desdeLg={horizontal} alto />
          <p data-portada-fade className="label flex items-center gap-3 text-crema">
            <span className="h-px w-8 bg-dorado" aria-hidden="true" />
            Obra <span className="num text-sm normal-case tracking-normal text-dorado">{pad(numero)}</span>
            <span aria-hidden="true">/</span>
            <span className="num text-sm normal-case tracking-normal">{pad(total)}</span>
          </p>
          <RevealLines
            as="h1"
            id="obra-title"
            trigger="load"
            delay={0.2}
            className="mt-5 font-display text-[clamp(3rem,14vw,7rem)] leading-[0.9]! tracking-[-0.035em]! [text-shadow:0_2px_40px_rgba(0,0,0,0.35)] [font-variation-settings:'opsz'_144] md:text-[clamp(5rem,11vw,9rem)] lg:text-[min(9vw,12.5rem)]"
          >
            {obra.nombre}
          </RevealLines>
          <ul data-portada-fade className="mt-7 flex flex-wrap gap-2" aria-label="Estado y tipo de obra">
            {[obra.estado, obra.tipo].map((t) => (
              <li key={t} className="label rounded-full border border-crema/35 bg-carbon/20 px-3.5 py-2 text-crema/90 backdrop-blur-sm">
                {t}
              </li>
            ))}
          </ul>

          <div
            data-portada-fade
            className="mt-10 flex items-end justify-between gap-6 border-t border-crema/20 pt-5 text-crema/75 md:mt-12"
          >
            <p className="label flex items-center gap-2">
              <span className="h-px w-6 bg-dorado" aria-hidden="true" />
              {obra.ubicacion}
            </p>
            <a href="#ficha" className="label flex items-center gap-3" aria-label="Bajar a la ficha de la obra">
              <span className="hidden sm:inline">La obra</span>
              <span className="relative block h-10 w-px overflow-hidden bg-crema/20" aria-hidden="true">
                <span className="scroll-cue absolute inset-0 bg-crema" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
