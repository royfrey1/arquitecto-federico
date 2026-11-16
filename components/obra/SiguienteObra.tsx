"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { obraTransitionName, obras, type Obra } from "@/data/obras";
import { StageFx, StageMedia, TextScrim } from "@/components/ui/CinemaStage";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Siguiente obra": misma composición que la portada (plano a sangre con el mismo
 * tratamiento, nombre enorme abajo a la izquierda), así el morph lleva este bloque
 * directamente a la portada de la obra siguiente.
 */
export default function SiguienteObra({ obra }: { obra: Obra }) {
  const v = obra.videoPrincipal;
  const horizontal = v.width > v.height;
  const numero = obras.findIndex((o) => o.slug === obra.slug) + 1;

  const media = (
    <StageMedia
      transitionName={obraTransitionName(obra.slug)}
      className={
        horizontal
          ? "relative w-full aspect-[var(--ar)] lg:absolute lg:inset-0 lg:-z-20 lg:aspect-auto"
          : "absolute inset-0 -z-20"
      }
    >
      <Image
        src={v.poster}
        alt=""
        fill
        sizes="100vw"
        quality={80}
        className="object-cover object-[50%_50%] transition-transform duration-[1.6s] ease-[var(--ease-editorial)] group-hover:scale-[1.045] lg:object-[50%_45%]"
      />
    </StageMedia>
  );

  return (
    <section aria-labelledby="siguiente-title" className="bg-carbon text-crema">
      <Link
        href={`/obras/${obra.slug}`}
        transitionTypes={["obra-forward"]}
        // Prefetch por link: trae el contenido de la obra (dentro del <Suspense>) antes del
        // click, así la portada llega en el mismo commit y el morph se forma.
        prefetch={true}
        className="group relative isolate flex min-h-[92svh] flex-col overflow-hidden focus-visible:outline-offset-[-6px]"
        style={{ "--ar": v.width / v.height } as CSSProperties}
      >
        {!horizontal && media}
        <StageFx backdrop={horizontal ? v.poster : undefined} />

        <div
          className={`mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-10 sm:px-6 lg:justify-end lg:px-10 lg:pb-14 ${
            horizontal ? "justify-center gap-10 pt-16 lg:pt-24" : "justify-end pt-24"
          }`}
        >
          {horizontal && media}

          <div className="relative">
            <TextScrim desdeLg={horizontal} alto />
            <p className="label flex items-center gap-3 text-crema">
              <span className="h-px w-8 bg-dorado" aria-hidden="true" />
              Siguiente obra
              <span className="num text-sm normal-case tracking-normal text-dorado">{pad(numero)}</span>
            </p>
            <h2
              id="siguiente-title"
              className="mt-5 font-display text-[clamp(3rem,14vw,7rem)] leading-[0.9]! tracking-[-0.035em]! [text-shadow:0_2px_40px_rgba(0,0,0,0.35)] transition-transform duration-[1.1s] ease-[var(--ease-editorial)] [font-variation-settings:'opsz'_144] group-hover:translate-x-4 md:text-[clamp(5rem,11vw,9rem)] lg:text-[min(9vw,12.5rem)] lg:group-hover:translate-x-8"
            >
              {obra.nombre}
            </h2>
            <p className="mt-7 flex items-center gap-4 text-lg text-crema/85">
              {obra.zona}
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-crema/40 transition-colors duration-500 group-hover:border-crema group-hover:bg-crema group-hover:text-carbon">
                <ArrowRight className="h-5 w-5" />
              </span>
            </p>
          </div>
        </div>
      </Link>

      <div className="mx-auto flex max-w-[1600px] justify-center border-t border-crema/15 px-4 py-8 sm:px-6 lg:px-10">
        <Link
          href="/#obras"
          transitionTypes={["obra-back"]}
          className="group label inline-flex min-h-11 items-center gap-3 text-crema/70 transition-colors hover:text-crema"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
          Ver todas las obras
        </Link>
      </div>
    </section>
  );
}
