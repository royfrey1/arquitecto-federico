"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getLenis, scrollToHash, setLenis } from "@/lib/lenis";

/**
 * Lenis + ScrollTrigger sincronizados con el ticker de GSAP.
 * Con prefers-reduced-motion no se inicializa (scroll nativo).
 * También intercepta los links a anclas de la Home ("/#obras", "#render").
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Links a anclas
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href") ?? "";
      let hash = "";
      if (href.startsWith("#")) hash = href;
      else if (href.startsWith("/#") && pathname === "/") hash = href.slice(1);
      if (!hash || hash === "#") return;
      if (scrollToHash(hash)) e.preventDefault();
    };
    // Fase de captura: corre antes que <Link>, que respeta defaultPrevented y no navega.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Atrás / adelante del navegador: Next restaura el scroll, no hay que pisarlo.
  const historial = useRef(false);
  useEffect(() => {
    const onPop = () => (historial.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Al llegar con hash (ej. desde /obras/x → /#antes)
  useEffect(() => {
    if (historial.current) {
      historial.current = false;
      // Solo resincronizar Lenis / ScrollTrigger con la posición restaurada.
      const id = window.setTimeout(() => {
        getLenis()?.resize();
        ScrollTrigger.refresh();
      }, 250);
      return () => window.clearTimeout(id);
    }
    // El hash puede actualizarse después del pathname: se lee dentro del timeout.
    const id = window.setTimeout(() => {
      const { hash } = window.location;
      if (hash && hash.length > 1) {
        ScrollTrigger.refresh();
        // Llegada desde otra página (ej. "Ver todas las obras" → /#obras): salto directo.
        scrollToHash(hash, { immediate: true });
      } else {
        getLenis()?.scrollTo(0, { immediate: true });
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
