"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  /** "load": anima al montar. "scroll": al entrar en viewport. */
  trigger?: "load" | "scroll";
  delay?: number;
  /** false = visible directo, sin revelado (ej. hero en visitas repetidas). */
  animate?: boolean;
};

/** Revelado de títulos por líneas: máscara + translateY. */
export default function RevealLines({
  as: Tag = "h2",
  children,
  className,
  id,
  trigger = "scroll",
  delay = 0,
  animate = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!animate || prefersReducedMotion()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "reveal-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.3,
            ease: "expo.out",
            stagger: 0.09,
            delay,
            scrollTrigger:
              trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal-lines="">
      {children}
    </Tag>
  );
}
