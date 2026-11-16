"use client";

import Image from "next/image";
import { ViewTransition, type ReactNode, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/*
  "Plano de cine" a sangre para el hero de la Home, las portadas de obra y "Siguiente obra".

  Capas (dentro de una <section> con `isolate`):
    <StageMedia>  [data-stage-clip] → video/poster etalonado. Su hijo [data-stage-kb] hace el Ken Burns.
    <StageFx>     [data-stage-clip] → tinte cálido, viñeta suave y degradados mínimos para el texto.
    texto         [data-stage-text] → sube con parallax y se apaga al salir.

  Etalonaje luminoso y natural (sin oscurecer): la legibilidad la dan solo el degradado
  inferior detrás del texto, uno muy sutil arriba para el header y un text-shadow difuso.
*/

/** Etalonaje: se aplica al contenedor, así poster y video quedan iguales. */
const GRADE = "[filter:contrast(1.05)_saturate(0.94)]";

/* ---------- StageMedia ---------- */

type StageMediaProps = {
  children: ReactNode;
  /** Posición/tamaño. Por defecto, a sangre detrás del contenido. */
  className?: string;
  /** Nombre del morph entre páginas (React <ViewTransition>). */
  transitionName?: string;
};

export function StageMedia({ children, className = "absolute inset-0 -z-20", transitionName }: StageMediaProps) {
  const media = (
    <div data-stage-clip="" className={`overflow-hidden bg-carbon-2 ${className}`}>
      <div data-stage-kb="" className={`absolute inset-0 ${GRADE}`}>
        {children}
      </div>
    </div>
  );
  if (!transitionName) return media;
  return (
    <ViewTransition name={transitionName} share="morph" default="none">
      {media}
    </ViewTransition>
  );
}

/* ---------- StageFx ---------- */

type StageFxProps = {
  /** Poster desenfocado de fondo (solo mobile, para medios horizontales en caja). */
  backdrop?: string;
};

export function StageFx({ backdrop }: StageFxProps) {
  return (
    <div data-stage-clip="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {backdrop && (
        <div className="absolute -inset-[10%] -z-10 lg:hidden">
          <Image src={backdrop} alt="" fill sizes="20vw" quality={70} className={`object-cover blur-2xl ${GRADE}`} />
          <div className="absolute inset-0 bg-carbon/70" />
        </div>
      )}
      {/* Tinte cálido muy suave (crema/dorado) */}
      <div className="absolute inset-0 bg-[#c9a66b] opacity-[0.1] mix-blend-soft-light" />
      {/* Viñeta suave y abierta */}
      <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_40%,transparent_60%,rgba(14,14,14,0.28)_100%)]" />
      {/* Arriba: muy sutil, solo para el header */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-carbon/35 to-transparent" />
      {/* Base inferior muy suave (el contraste del texto lo garantiza <TextScrim />) */}
      <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-carbon/45 to-transparent" />
      {/* Oscurecido de la salida con scroll (máx. 0.25) */}
      <div data-stage-dim="" className="absolute inset-0 bg-carbon opacity-0" />
    </div>
  );
}

/* ---------- Velo del texto ---------- */

/**
 * Velo detrás del bloque de texto (va como primer hijo de un contenedor `relative`).
 * Ocupa todo el ancho de la pantalla, arranca transparente un 45 % por encima del bloque y
 * llega a carbón/88 abajo: oscurece solo donde hay texto y deja luminoso el resto del video.
 * Calibrado para AA sobre los cuadros más claros del loop (cielo blanco detrás del H1 en
 * mobile): ≥ 3:1 en el H1 y ≥ 4.5:1 en la bajada y la barra inferior.
 * Acompaña al texto en la salida con scroll (parallax + fundido).
 * `desdeLg`: medios horizontales, que en mobile van en caja arriba del texto (sobre el poster
 * desenfocado y oscurecido): ahí el velo taparía el video, así que se activa recién en lg.
 * `alto`: el velo arranca más arriba (portadas: el rótulo chico "Obra 0X" va arriba del H1).
 */
export function TextScrim({ desdeLg = false, alto = false }: { desdeLg?: boolean; alto?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -bottom-10 ${alto ? "-top-[65%]" : "-top-[45%]"} left-1/2 -z-[5] w-[100vw] -translate-x-1/2 ${desdeLg ? "hidden lg:block" : ""} bg-[linear-gradient(to_bottom,transparent_0%,rgb(20_20_20/0.6)_22%,rgb(20_20_20/0.72)_50%,rgb(20_20_20/0.88)_100%)]`}
    />
  );
}

/* ---------- Movimiento ---------- */

type MotionOptions = {
  /** Ken Burns al cargar (1.08 → 1 en ~12 s). */
  kenBurns?: boolean;
  /** Salida con scroll: encuadre con clip-path + parallax del texto. */
  exit?: boolean;
};

/**
 * Ken Burns + salida con scroll ("plano que se aleja"): el video se encuadra con un
 * clip-path inset que crece hasta ≈5vw con esquinas apenas redondeadas y baja levemente
 * de escala; el texto sube más rápido y se apaga; el overlay se oscurece apenas.
 * Nada de esto corre con prefers-reduced-motion.
 */
export function useStageMotion(scope: RefObject<HTMLElement | null>, { kenBurns = true, exit = true }: MotionOptions = {}) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (kenBurns) {
          gsap.fromTo("[data-stage-kb]", { scale: 1.08 }, { scale: 1, duration: 12, ease: "sine.out" });
        }
        if (!exit) return;
        const st = {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        };
        const margen = () => Math.round(window.innerWidth * 0.05);
        gsap.fromTo(
          "[data-stage-clip]",
          { clipPath: "inset(0px 0px 0px 0px round 0px)", scale: 1, yPercent: 0 },
          {
            clipPath: () => `inset(${margen()}px ${margen()}px ${margen()}px ${margen()}px round 14px)`,
            scale: 0.95,
            yPercent: 4,
            ease: "none",
            scrollTrigger: st,
          },
        );
        gsap.to("[data-stage-dim]", { opacity: 0.25, ease: "none", scrollTrigger: st });
        gsap.to("[data-stage-text]", { yPercent: -28, autoAlpha: 0.15, ease: "none", scrollTrigger: st });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
