"use client";

import { useRef, useState } from "react";
import LazyVideo from "@/components/ui/LazyVideo";
import RevealLines from "@/components/ui/RevealLines";
import PillLink from "@/components/ui/PillLink";
import { StageFx, StageMedia, TextScrim, useStageMotion } from "@/components/ui/CinemaStage";
import { ArrowRight } from "@/components/ui/Icons";
import { site } from "@/data/site";
import { gsap, useGSAP } from "@/lib/gsap";

const HERO = {
  src: "/media/hero/hero-lago.mp4",
  srcMobile: "/media/hero/hero-lago-m.mp4",
  poster: "/media/hero/hero-lago-poster.jpg",
  alt: "Pileta con borde infinito frente al lago, Puertos Vistas",
};

/*
  Encuadre del video vertical (720×1280) a sangre. En pantallas apaisadas el cover muestra
  solo ~1/3 del alto. El plano hace un tilt (cielo + casas → pileta): 45 % deja casas y lago
  arriba del H1 en el primer tramo y sigue funcionando en el resto del loop (1280, 1440, 1920).
*/
const ENCUADRE = "object-[50%_50%] md:object-[50%_55%] lg:object-[50%_45%]";

let limpiezaPendiente = 0;

const introActiva = () =>
  typeof document !== "undefined" && document.documentElement.dataset.intro === "playing";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  // Se lee una vez al montar (el atributo lo pone el script de layout.tsx antes de pintar).
  const [intro] = useState(introActiva);

  useStageMotion(ref);

  // Apertura: barras 2.39:1 que se retiran + cascada de bajada, CTAs y barra inferior.
  useGSAP(
    () => {
      if (!intro) return;
      // Si es un re-montaje inmediato (Strict Mode), cancelar la limpieza pendiente.
      window.clearTimeout(limpiezaPendiente);
      const fin = () => {
        delete document.documentElement.dataset.intro;
      };
      const tl = gsap.timeline({ onComplete: fin });
      tl.fromTo(
        "[data-cine-bar]",
        // display inline: no depender del atributo mientras dura la animación
        { scaleY: 1, display: "block" },
        { scaleY: 0, duration: 1.4, ease: "power3.inOut" },
        0.5,
      )
        .fromTo(
          "[data-hero-fade]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.14, ease: "expo.out" },
          1.75,
        )
        // Header y WhatsApp (su transición CSS hace la entrada)
        .add(fin, 2.6);
      return () => {
        tl.kill();
        // Desmontaje real a mitad de la apertura (ej. navegación): mostrar header/WhatsApp.
        limpiezaPendiente = window.setTimeout(fin, 50);
      };
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-carbon text-crema"
    >
      <StageMedia>
        <LazyVideo
          src={HERO.src}
          srcMobile={HERO.srcMobile}
          poster={HERO.poster}
          alt={HERO.alt}
          sizes="100vw"
          eager
          mediaClassName={ENCUADRE}
          className="h-full w-full"
        />
      </StageMedia>
      <StageFx />

      {/* Barras de cine (solo en la apertura) */}
      <div data-cine-bar="" aria-hidden="true" className="absolute inset-x-0 top-0 z-20 origin-top bg-black" />
      <div data-cine-bar="" aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 origin-bottom bg-black" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end px-4 pb-6 pt-32 sm:px-6 lg:px-10 lg:pb-8">
        <div data-stage-text="" className="relative">
          <TextScrim />
          <RevealLines
            as="h1"
            id="hero-title"
            trigger="load"
            delay={1.05}
            animate={intro}
            className="font-display text-[clamp(3.1rem,14.5vw,7rem)] leading-[0.9]! tracking-[-0.035em]! [text-shadow:0_2px_40px_rgba(0,0,0,0.35)] [font-variation-settings:'opsz'_144] md:text-[clamp(5rem,11.5vw,9rem)] lg:text-[min(9.8vw,13.5rem)]"
          >
            Casas pensadas <em className="kw">antes</em> de construirse.
          </RevealLines>

          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-[minmax(0,28rem)_auto] md:items-end md:justify-between">
            <p data-hero-fade className="max-w-[28rem] text-[0.9375rem] leading-relaxed text-crema/80 md:text-base">
              La mayoría de los problemas de una obra nacen en el plano. Yo los resuelvo ahí, antes de que te
              cuesten plata. Un solo responsable del primer boceto a la entrega de llaves.
            </p>
            <div data-hero-fade className="flex flex-wrap gap-3">
              <PillLink href="#render" variant="light">
                Empezá tu render gratis
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </PillLink>
              <PillLink href="#obras" variant="outline-light">
                Ver obras
              </PillLink>
            </div>
          </div>

          {/* Barra inferior */}
          <div
            data-hero-fade
            className="mt-10 grid grid-cols-2 items-end gap-x-6 gap-y-4 border-t border-crema/20 pt-5 text-crema/75 md:mt-12 md:grid-cols-[1fr_auto_1fr_auto]"
          >
            <p className="label col-span-2 md:col-span-1">
              {site.rol} · {site.experiencia}
            </p>
            <p className="label flex items-center gap-2">
              <span className="h-px w-6 bg-dorado" aria-hidden="true" />
              Puertos Vistas · Escobar
            </p>
            <ul className="label hidden flex-wrap gap-x-4 md:flex md:justify-end" aria-label="Zonas de trabajo">
              {site.zonas.map((z) => (
                <li key={z}>{z}</li>
              ))}
            </ul>
            <a
              href="#manifiesto"
              className="label flex items-center justify-end gap-3 justify-self-end"
              aria-label="Bajar al contenido"
            >
              <span className="hidden sm:inline">Scroll</span>
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
