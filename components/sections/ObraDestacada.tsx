"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { destacadaPuertosVistas, getObra, type Medio } from "@/data/obras";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionHead from "@/components/ui/SectionHead";
import { ArrowRight } from "@/components/ui/Icons";
import { gsap, useGSAP } from "@/lib/gsap";

const obra = getObra("casona-puertos-vistas")!;

/** Alturas alternadas para un ritmo editorial (desktop). */
const alturas = [
  "lg:h-[80%]",
  "lg:h-[61%] lg:self-end lg:mb-12",
  "lg:h-[73%] lg:self-start",
  "lg:h-[56%]",
  "lg:h-[83%]",
  "lg:h-[63%] lg:self-end lg:mb-12",
  "lg:h-[76%] lg:self-start",
  "lg:h-[59%]",
];

function MedioItem({ medio, index }: { medio: Medio; index: number }) {
  const sizes = "(min-width: 1024px) 40vh, 70vw";
  return (
    <figure
      className={`relative shrink-0 snap-start h-[58svh] max-h-[34rem] lg:max-h-none ${alturas[index % alturas.length]} ${
        medio.tipo === "imagen" ? "aspect-[3/4]" : "aspect-[9/16]"
      }`}
    >
      {medio.tipo === "video" ? (
        <LazyVideo
          src={medio.src}
          srcMobile={medio.srcMobile}
          poster={medio.poster}
          alt={medio.alt}
          sizes={sizes}
          className="h-full w-full"
        />
      ) : (
        <div className="relative h-full w-full overflow-hidden bg-crema-2">
          <Image src={medio.src} alt={medio.alt} fill sizes={sizes} quality={80} className="object-cover" />
        </div>
      )}
      <figcaption className="absolute left-0 top-full mt-3 flex w-[150%] gap-3 text-sm text-texto-suave">
        <span className="num text-dorado-oscuro">{String(index + 1).padStart(2, "0")}</span>
        {medio.alt}
      </figcaption>
    </figure>
  );
}

export default function ObraDestacada() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance() }, 0).fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="destacada"
      aria-labelledby="destacada-title"
      className="on-light relative overflow-hidden bg-crema py-24 lg:flex lg:h-[100svh] lg:flex-col lg:pb-8 lg:pt-8"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <SectionHead numero="03" label="Obra destacada">
          {obra.ubicacion}
        </SectionHead>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-12 flex scroll-px-4 pb-14 sm:scroll-px-6 lg:pb-0 snap-x snap-mandatory gap-5 overflow-x-auto px-4 sm:px-6 lg:mt-6 lg:min-h-0 lg:flex-1 lg:snap-none lg:items-center lg:gap-14 lg:overflow-visible lg:px-10 lg:will-change-transform"
      >
        {/* Bloque de texto inicial */}
        <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center sm:w-[60vw] lg:w-[34rem] lg:pr-10">
          <p className="label text-dorado-oscuro">
            {obra.estado} · {obra.tipo}
          </p>
          <h2 id="destacada-title" className="mt-5 font-display text-[clamp(3rem,7vw,6.75rem)]">
            Casona <em className="kw">Puertos</em> Vistas
          </h2>
          <dl className="mt-8 grid grid-cols-2 border-y border-carbon/15 text-sm">
            <div className="border-r border-carbon/15 py-4 pr-4">
              <dt className="label text-texto-suave">Superficie</dt>
              <dd className="mt-1 font-serif text-2xl">{obra.m2} m²</dd>
            </div>
            <div className="py-4 pl-4">
              <dt className="label text-texto-suave">Ubicación</dt>
              <dd className="mt-1 font-serif text-2xl">{obra.ubicacion}</dd>
            </div>
          </dl>
          <p className="mt-6 max-w-md text-texto-suave">{obra.descripcionLarga}</p>
          <p className="label mt-8 hidden items-center gap-3 text-texto-suave lg:flex">
            Seguí bajando <ArrowRight className="h-4 w-4" />
          </p>
        </div>

        {destacadaPuertosVistas.map((m, i) => (
          <MedioItem key={m.src} medio={m} index={i} />
        ))}

        {/* CTA final */}
        <div className="flex w-[78vw] shrink-0 snap-start flex-col items-start justify-center gap-8 sm:w-[50vw] lg:w-[30rem] lg:pl-6 lg:pr-[8vw]">
          <p className="font-serif text-[clamp(2.2rem,4vw,3.75rem)] font-light leading-[1.05] tracking-[-0.02em]">
            {obra.medios.length} tomas, <em className="kw">una sola</em> casa.
          </p>
          <Link
            href={`/obras/${obra.slug}`}
            transitionTypes={["obra-forward"]}
            prefetch={true}
            className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-petroleo px-8 font-semibold text-crema transition-colors hover:bg-[#173d3d]"
          >
            Ver la obra completa
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 hidden w-full max-w-[1600px] px-10 lg:block">
        <div className="h-px w-full bg-carbon/15">
          <div data-progress className="h-px w-full origin-left bg-petroleo" />
        </div>
      </div>
    </section>
  );
}
