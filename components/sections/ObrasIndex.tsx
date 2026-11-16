"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import { obras, obraTransitionName } from "@/data/obras";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import LazyVideo from "@/components/ui/LazyVideo";
import { ArrowUpRight } from "@/components/ui/Icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer, useMediaQuery } from "@/lib/hooks";

export default function ObrasIndex() {
  const ref = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const fine = useFinePointer();
  // Morph obra → portada: el nombre se asigna SOLO al ítem clickeado y solo en el elemento
  // visible (carrusel < md, preview flotante en desktop). Así nunca hay nombres duplicados
  // montados (ni en la hidratación, donde el media query todavía da false).
  const md = useMediaQuery("(min-width: 768px)");
  const [destino, setDestino] = useState<string | null>(null);
  const irA = (slug: string) => {
    setDestino(slug);
    // La captura del estado viejo ocurre al iniciar la transición; después se libera el nombre.
    window.setTimeout(() => setDestino(null), 1500);
  };

  const movers = useRef<{
    px?: gsap.QuickToFunc;
    py?: gsap.QuickToFunc;
    cx?: gsap.QuickToFunc;
    cy?: gsap.QuickToFunc;
  }>({});

  useGSAP(
    () => {
      if (!fine || !previewRef.current || !cursorRef.current) return;
      // La tarjeta queda a la derecha del cursor para no tapar el nombre de la obra.
      gsap.set(previewRef.current, { xPercent: 0, yPercent: -50 });
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
      movers.current = {
        px: gsap.quickTo(previewRef.current, "x", { duration: 0.9, ease: "power3" }),
        py: gsap.quickTo(previewRef.current, "y", { duration: 0.9, ease: "power3" }),
        cx: gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3" }),
        cy: gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3" }),
      };
    },
    { scope: ref, dependencies: [fine] },
  );

  const onMove = (e: React.PointerEvent) => {
    if (!fine) return;
    const m = movers.current;
    m.px?.(e.clientX + 56);
    m.py?.(e.clientY);
    m.cx?.(e.clientX);
    m.cy?.(e.clientY);
  };

  const showPreview = fine && active !== null;

  return (
    <section
      ref={ref}
      id="obras"
      aria-labelledby="obras-title"
      className="relative bg-carbon px-4 py-24 text-crema sm:px-6 md:py-36 lg:px-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="02" label="Índice de obras" tone="dark">
          {String(obras.length).padStart(2, "0")} proyectos
        </SectionHead>

        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-[1fr_minmax(0,26rem)] md:items-end">
          <RevealLines id="obras-title" className="font-display text-[clamp(3.5rem,12vw,11rem)]">
            Obras
          </RevealLines>
          <Reveal>
            <p className="max-w-[26rem] text-crema/75 md:pb-6">
              Obra nueva, reformas y locales comerciales.{" "}
              <em className="font-serif text-dorado">Cada casa es distinta</em>: estas son algunas, de Nordelta a
              la Panamericana.
            </p>
          </Reveal>
        </div>

        {/* ---------- Lista editorial (md+) ---------- */}
        <ul
          className={`mt-16 hidden border-t border-crema/15 md:block ${fine ? "cursor-none" : ""}`}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        >
          {obras.map((obra, i) => (
            <li key={obra.slug} className="border-b border-crema/15">
              <Link
                href={`/obras/${obra.slug}`}
                transitionTypes={["obra-forward"]}
                prefetch={true}
                onClick={() => irA(obra.slug)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(null)}
                className={`group grid grid-cols-[3.5rem_minmax(0,1fr)_auto_2.5rem] items-center gap-6 py-7 transition-opacity duration-500 lg:grid-cols-[5rem_minmax(0,1fr)_11rem_10rem_3rem] lg:py-9 ${
                  active !== null && active !== i ? "opacity-30" : "opacity-100"
                } ${fine ? "cursor-none" : ""}`}
              >
                <span className="num text-base text-dorado">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[clamp(2rem,4.6vw,4.75rem)] font-light leading-none tracking-[-0.02em] transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:translate-x-3 group-focus-visible:translate-x-3">
                  {obra.nombre}
                </span>
                <span className="hidden text-crema/70 lg:block">{obra.ubicacion}</span>
                <span className="label justify-self-start rounded-full border border-crema/25 px-3 py-1.5 text-crema/80">
                  {obra.estado}
                </span>
                <ArrowUpRight className="h-6 w-6 justify-self-end text-crema/60 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-dorado" />
              </Link>
            </li>
          ))}
        </ul>

        {/* ---------- Carrusel mobile ---------- */}
        <ul
          className="no-scrollbar -mx-4 mt-12 flex scroll-px-4 sm:scroll-px-6 snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:hidden"
          aria-label="Obras"
        >
          {obras.map((obra, i) => (
            <li key={obra.slug} className="w-[78%] shrink-0 snap-start sm:w-[55%]">
              <Link
                href={`/obras/${obra.slug}`}
                transitionTypes={["obra-forward"]}
                prefetch={true}
                onClick={() => irA(obra.slug)}
                className="group block"
              >
                <ViewTransition
                  name={!md && destino === obra.slug ? obraTransitionName(obra.slug) : undefined}
                  share="morph"
                  default="none"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-carbon-2">
                    <Image
                      src={obra.cover}
                      alt={obra.videoPrincipal.alt}
                      fill
                      sizes="(max-width: 640px) 78vw, 55vw"
                      quality={70}
                      className="object-cover transition-transform duration-700 group-active:scale-[1.03]"
                    />
                    <span className="label absolute left-3 top-3 rounded-full bg-carbon/70 px-3 py-1.5 text-crema backdrop-blur">
                      {obra.estado}
                    </span>
                  </div>
                </ViewTransition>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="num text-sm text-dorado">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-serif text-2xl font-light leading-tight">{obra.nombre}</p>
                    <p className="mt-1 text-sm text-crema/65">{obra.ubicacion}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- Preview flotante + cursor (solo desktop con puntero fino) ---------- */}
      {fine && (
        <>
          <div
            ref={previewRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[clamp(15rem,20vw,21rem)] md:block"
          >
            <div
              className={`relative aspect-[4/5] overflow-hidden bg-carbon-2 shadow-2xl shadow-black/40 transition-[opacity,scale] duration-500 ease-[var(--ease-editorial)] ${
                showPreview ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
            >
              {obras.map((obra, i) => (
                <ViewTransition
                  key={obra.slug}
                  name={md && destino === obra.slug ? obraTransitionName(obra.slug) : undefined}
                  share="morph"
                  default="none"
                >
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${active === i ? "opacity-100" : "opacity-0"}`}
                  >
                    <LazyVideo
                      src={obra.videoPrincipal.src}
                      poster={obra.videoPrincipal.poster}
                      alt={obra.videoPrincipal.alt}
                      sizes="22rem"
                      playing={active === i}
                      decorative
                      className="h-full w-full"
                    />
                  </div>
                </ViewTransition>
              ))}
            </div>
          </div>
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
          >
            {/* GSAP mueve el contenedor; la escala/opacidad va en el hijo para no pisar transforms */}
            <span
              className={`label flex h-16 w-16 items-center justify-center rounded-full bg-crema text-carbon transition-[opacity,scale] duration-300 ${
                showPreview ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            >
              Ver
            </span>
          </div>
        </>
      )}
    </section>
  );
}
