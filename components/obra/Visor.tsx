"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Medio } from "@/data/obras";
import { getLenis } from "@/lib/lenis";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";

type Props = {
  medios: Medio[];
  index: number;
  titulo: string;
  onClose: () => void;
  onChange: (i: number) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

function VideoVisor({ medio, onPlayingChange }: { medio: Extract<Medio, { tipo: "video" }>; onPlayingChange: (p: boolean) => void }) {
  const [src] = useState(() => (isMobile() ? medio.srcMobile : medio.src));
  const [autoPlay] = useState(() => !prefersReducedMotion());

  // Estado inicial del botón play/pausa al entrar a un video nuevo.
  useEffect(() => {
    onPlayingChange(false);
  }, [onPlayingChange]);

  return (
    <video
      src={src}
      poster={medio.poster}
      muted
      loop
      playsInline
      autoPlay={autoPlay}
      preload="auto"
      aria-label={medio.alt}
      onPlay={() => onPlayingChange(true)}
      onPause={() => onPlayingChange(false)}
      className="h-full w-full object-contain"
    />
  );
}

/**
 * Visor a pantalla completa: medio centrado a la altura máxima, caption, contador,
 * flechas, teclado (← → Esc), swipe, foco atrapado y scroll de fondo bloqueado (Lenis pausado).
 */
export default function Visor({ medios, index, titulo, onClose, onChange }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [playing, setPlaying] = useState(false);

  const medio = medios[index];
  const total = medios.length;
  const ar = medio.width / medio.height;

  const prev = useCallback(() => onChange((index - 1 + total) % total), [index, total, onChange]);
  const next = useCallback(() => onChange((index + 1) % total), [index, total, onChange]);

  // Bloqueo de scroll + foco inicial / restauración
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    lenis?.stop();
    const html = document.documentElement;
    const overflowPrevio = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus();

    if (!prefersReducedMotion() && dialogRef.current) {
      gsap.fromTo(dialogRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" });
    }

    return () => {
      html.style.overflow = overflowPrevio;
      lenis?.start();
      previo?.focus({ preventScroll: true });
    };
  }, []);

  // Animación al cambiar de medio
  useEffect(() => {
    if (!stageRef.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      stageRef.current,
      { autoAlpha: 0, scale: 0.97 },
      { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out" },
    );
    return () => {
      t.kill();
    };
  }, [index]);

  // Teclado: flechas, Escape y foco atrapado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "Tab" && dialogRef.current) {
        const focos = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"),
        ).filter((el) => el.getClientRects().length > 0); // descarta los ocultos por breakpoint
        if (!focos.length) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        const activo = document.activeElement;
        if (e.shiftKey && (activo === primero || !dialogRef.current.contains(activo))) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && (activo === ultimo || !dialogRef.current.contains(activo))) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  const togglePlay = () => {
    const v = stageRef.current?.querySelector("video");
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const flecha =
    "flex h-12 w-12 items-center justify-center rounded-full border border-crema/30 text-crema transition-colors duration-300 hover:border-crema hover:bg-crema/10 md:h-14 md:w-14";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de imágenes y videos: ${titulo}`}
      className="fixed inset-0 z-[90] flex flex-col bg-carbon text-crema"
      data-lenis-prevent=""
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 md:py-5 lg:px-10">
        <p className="label truncate text-crema/60">{titulo}</p>
        <p className="num text-base text-crema/80" aria-live="polite" aria-atomic="true">
          <span className="sr-only">Medio </span>
          <span className="text-dorado">{index + 1}</span> / {total}
          <span className="sr-only">: {medio.caption}</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar visor"
          className="group -mr-2 flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-crema/10"
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span className="absolute left-0 top-1/2 h-px w-5 rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-5 -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      {/* Escenario */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-6 md:px-28">
        <div
          className="relative h-full w-full touch-none select-none [container-type:size]"
          onPointerDown={(e) => {
            swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s) return;
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) next();
              else prev();
            }
          }}
          onPointerCancel={() => (swipe.current = null)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={stageRef}
              className="relative overflow-hidden bg-carbon-2"
              style={{
                width: `min(100cqw, calc(100cqh * ${ar}))`,
                height: `min(100cqh, calc(100cqw / ${ar}))`,
              }}
            >
              {medio.tipo === "video" ? (
                <VideoVisor key={medio.src} medio={medio} onPlayingChange={setPlaying} />
              ) : (
                <Image
                  key={medio.src}
                  src={medio.src}
                  alt={medio.alt}
                  fill
                  sizes="(min-width: 768px) 80vh, 100vw"
                  quality={80}
                  className="object-contain"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Flechas laterales (desktop) */}
        <button type="button" onClick={prev} aria-label="Medio anterior" className={`${flecha} absolute left-6 top-1/2 hidden -translate-y-1/2 md:flex lg:left-10`}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={next} aria-label="Medio siguiente" className={`${flecha} absolute right-6 top-1/2 hidden -translate-y-1/2 md:flex lg:right-10`}>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Caption + controles */}
      <div className="flex items-center justify-between gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 md:pb-6 lg:px-10">
        <button type="button" onClick={prev} aria-label="Medio anterior" className={`${flecha} md:hidden`}>
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-4 md:justify-start">
          <p className="min-w-0 text-center md:text-left">
            <span className="label flex items-center justify-center gap-3 md:justify-start">
              <span className="num text-sm normal-case tracking-normal text-dorado">{pad(index + 1)}</span>
              {medio.caption}
            </span>
            <span className="mt-1 hidden truncate text-sm text-crema/60 sm:block">{medio.alt}</span>
          </p>
          {medio.tipo === "video" && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pausar video" : "Reproducir video"}
              className="label ml-2 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-crema/30 px-4 text-crema/85 transition-colors hover:border-crema"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span className="hidden sm:inline">{playing ? "Pausa" : "Play"}</span>
            </button>
          )}
        </div>

        <button type="button" onClick={next} aria-label="Medio siguiente" className={`${flecha} md:hidden`}>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
