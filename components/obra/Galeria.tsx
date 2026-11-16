"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Medio } from "@/data/obras";
import { componerGaleria, type Slot } from "@/lib/galeria";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Visor from "@/components/obra/Visor";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  medios: Medio[];
  titulo: string;
  tone: "crema" | "carbon";
  numero: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

function Pieza({
  medio,
  slot,
  dark,
  onOpen,
}: {
  medio: Medio;
  slot: Slot;
  dark: boolean;
  onOpen: (i: number) => void;
}) {
  const ar = medio.width / medio.height;
  // Ancho real en desktop ≈ alto (svh) × aspecto → `sizes` ajustado.
  const sizes = `(min-width: 768px) ${Math.ceil(slot.h * ar)}vh, ${slot.cls.startsWith("col-span-6") ? 100 : 70}vw`;

  return (
    <figure
      data-pieza=""
      data-speed={slot.speed}
      className={`w-full max-w-[calc(var(--h)*var(--ar))] ${slot.cls}`}
      style={{ "--ar": ar, "--h": `${slot.h}svh` } as CSSProperties}
    >
      <button
        type="button"
        onClick={() => onOpen(slot.index)}
        aria-label={`Ver en grande: ${medio.alt}`}
        aria-haspopup="dialog"
        className="group relative block w-full cursor-zoom-in"
        style={{ aspectRatio: ar }}
      >
        <span data-clip="" className={`absolute inset-0 block overflow-hidden ${dark ? "bg-carbon-2" : "bg-crema-2"}`}>
          <span data-inner="" className="block h-full w-full">
            <span className="relative block h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.035]">
              {medio.tipo === "video" ? (
                <LazyVideo
                  src={medio.src}
                  srcMobile={medio.srcMobile}
                  poster={medio.poster}
                  alt={medio.alt}
                  sizes={sizes}
                  decorative
                  className="h-full w-full"
                />
              ) : (
                <Image src={medio.src} alt="" fill sizes={sizes} quality={80} className="object-cover" />
              )}
            </span>
          </span>
        </span>
        {/* Indicador "ampliar" */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-carbon/60 text-crema opacity-0 backdrop-blur transition-[opacity,scale] duration-500 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
          </svg>
        </span>
      </button>
      <figcaption
        className={`mt-3 flex items-baseline gap-3 ${dark ? "text-crema/70" : "text-texto-suave"}`}
      >
        <span className={`num text-sm ${dark ? "text-dorado" : "text-dorado-oscuro"}`}>{pad(slot.index + 1)}</span>
        <span className="label">{medio.caption}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Galería editorial para medios verticales: el layout se compone solo según la cantidad
 * y orientación de los medios (ver lib/galeria.ts). Click → visor a pantalla completa.
 */
export default function Galeria({ medios, titulo, tone, numero }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const filas = useMemo(() => componerGaleria(medios), [medios]);
  const dark = tone === "carbon";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-pieza]").forEach((pieza) => {
          const clip = pieza.querySelector("[data-clip]");
          const inner = pieza.querySelector("[data-inner]");
          const cap = pieza.querySelector("figcaption");
          const st = { trigger: pieza, start: "top 88%", once: true };
          gsap.fromTo(
            clip,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: st },
          );
          gsap.fromTo(inner, { scale: 1.22 }, { scale: 1, duration: 2, ease: "expo.out", scrollTrigger: st });
          gsap.from(cap, { autoAlpha: 0, y: 10, duration: 1, delay: 0.5, ease: "expo.out", scrollTrigger: st });
        });
      });
      // Parallax entre columnas (velocidades distintas), solo desktop
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-pieza]").forEach((pieza) => {
          const speed = Number(pieza.dataset.speed ?? 0);
          if (!speed) return;
          gsap.fromTo(
            pieza,
            { y: speed * 60 },
            {
              y: -speed * 60,
              ease: "none",
              scrollTrigger: { trigger: pieza, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const cerrar = useCallback(() => setAbierto(null), []);

  return (
    <section
      ref={ref}
      id="galeria"
      aria-labelledby="galeria-title"
      className={`overflow-hidden px-4 py-24 sm:px-6 md:py-36 lg:px-10 ${
        dark ? "bg-carbon text-crema" : "on-light bg-crema text-carbon"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero={numero} label="Galería" tone={dark ? "dark" : "light"}>
          {pad(medios.length)} tomas
        </SectionHead>

        <div className="mt-14 flex flex-wrap items-end justify-between gap-6 md:mt-20">
          <RevealLines id="galeria-title" className="font-display text-[clamp(3rem,9vw,8rem)]">
            La obra, <em className="kw">toma por toma</em>
          </RevealLines>
          <p className={`max-w-xs text-sm ${dark ? "text-crema/65" : "text-texto-suave"}`}>
            Tocá cualquier imagen o video para verlo en grande.
          </p>
        </div>

        <div className="mt-16 md:mt-28">
          {filas.map((fila, f) => (
            <div
              key={f}
              className={`grid grid-cols-6 items-start gap-x-4 md:grid-cols-12 md:gap-x-8 ${
                f === 0 ? "" : fila.tipo === "solo" ? "mt-20 md:mt-[18svh]" : "mt-16 md:mt-[14svh]"
              } ${fila.tipo === "solo" && f < filas.length - 1 ? "mb-4 md:mb-[6svh]" : ""}`}
            >
              {fila.slots.map((slot) => (
                <Pieza key={slot.index} medio={medios[slot.index]} slot={slot} dark={dark} onOpen={setAbierto} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {abierto !== null && (
        <Visor medios={medios} index={abierto} titulo={titulo} onClose={cerrar} onChange={setAbierto} />
      )}
    </section>
  );
}
