"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

type Props = {
  src: string;
  srcMobile?: string;
  poster: string;
  alt: string;
  /** `sizes` del poster (next/image). */
  sizes: string;
  className?: string;
  /** Carga inmediata (hero). */
  eager?: boolean;
  /**
   * Control externo de reproducción (ej. preview del índice).
   * Si es undefined, se reproduce/pausa según visibilidad (IntersectionObserver).
   */
  playing?: boolean;
  /** Oculta el medio a lectores de pantalla (cuando el contexto ya lo describe). */
  decorative?: boolean;
  /** Clases extra para poster y video (ej. object-position responsive). */
  mediaClassName?: string;
};

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

/**
 * Video liviano: poster optimizado con next/image (lazy) y el <video> recién se
 * monta con `src` cuando entra en viewport. Se pausa al salir.
 * Con prefers-reduced-motion queda solo el poster.
 */
export default function LazyVideo({
  src,
  srcMobile,
  poster,
  alt,
  sizes,
  className = "",
  eager = false,
  playing,
  decorative = false,
  mediaClassName = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  const controlled = playing !== undefined;
  const shouldPlay = !reduced && (controlled ? playing : inView);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de media query post-hidratación
    setReduced(prefersReducedMotion());
  }, []);

  // Visibilidad
  useEffect(() => {
    if (controlled) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "15% 0px 15% 0px",
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [controlled]);

  // Montar la fuente cuando hace falta
  useEffect(() => {
    if (source || reduced) return;
    if (eager || shouldPlay) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- montaje diferido del src
      setSource(srcMobile && isMobile() ? srcMobile : src);
    }
  }, [eager, shouldPlay, source, reduced, src, srcMobile]);

  // Play / pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !source) return;
    if (shouldPlay) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [shouldPlay, source]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-carbon-2 ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative || undefined}
    >
      <Image
        src={poster}
        alt=""
        fill
        sizes={sizes}
        quality={70}
        preload={eager}
        loading={eager ? "eager" : "lazy"}
        className={`object-cover ${mediaClassName}`}
      />
      {source && (
        <video
          ref={videoRef}
          src={source}
          muted
          loop
          playsInline
          autoPlay={eager && !reduced}
          preload={eager ? "auto" : "none"}
          onPlaying={() => setReady(true)}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${mediaClassName} ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
