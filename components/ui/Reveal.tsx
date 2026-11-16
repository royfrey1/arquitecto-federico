"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** "fade": opacidad + leve subida. "media": opacidad + escala + parallax interno. */
  variant?: "fade" | "media";
  delay?: number;
  /** Desplazamiento de parallax (en %) del primer hijo. 0 = sin parallax. */
  parallax?: number;
  /** Anima los hijos directos en cascada. */
  stagger?: boolean;
};

export default function Reveal({
  children,
  className,
  variant = "fade",
  delay = 0,
  parallax = 0,
  stagger = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const targets = stagger ? Array.from(el.children) : el;

      if (variant === "media") {
        const inner = el.firstElementChild as HTMLElement | null;
        gsap.from(el, {
          autoAlpha: 0,
          clipPath: "inset(8% 6% 8% 6%)",
          duration: 1.6,
          ease: "expo.out",
          delay,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
        if (inner) {
          // Con parallax el interior queda levemente agrandado para no mostrar bordes.
          gsap.fromTo(inner, { scale: parallax ? 1.3 : 1.15 }, {
            scale: parallax ? 1.14 : 1,
            duration: 2,
            ease: "expo.out",
            delay,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
          if (parallax) {
            gsap.fromTo(
              inner,
              { yPercent: -parallax },
              {
                yPercent: parallax,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }
        }
        return;
      }

      gsap.from(targets, {
        autoAlpha: 0,
        y: 28,
        duration: 1.1,
        ease: "expo.out",
        delay,
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
