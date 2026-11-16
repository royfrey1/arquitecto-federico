"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Trazos del bosquejo, en orden de dibujo. */
const trazos: { d: string; w?: number; tone?: "gold" | "cream" | "faint" }[] = [
  // Construcción / guías
  { d: "M10 330 H470", tone: "faint" },
  { d: "M80 40 V360", tone: "faint" },
  { d: "M400 40 V360", tone: "faint" },
  { d: "M20 140 H460", tone: "faint" },
  // Terreno
  { d: "M20 330 H460", w: 1.6, tone: "cream" },
  // Volumen bajo
  { d: "M80 330 V230 H300 V330", w: 1.6, tone: "cream" },
  // Losa en voladizo
  { d: "M60 230 H330", w: 2.4, tone: "cream" },
  // Volumen alto en voladizo
  { d: "M150 230 V140 H400 V230 H300", w: 1.6, tone: "cream" },
  { d: "M140 140 H412", w: 2.4, tone: "cream" },
  // Pilar
  { d: "M390 230 V330", w: 1.6, tone: "cream" },
  // Ventanal planta baja
  { d: "M100 255 H205 V330 M100 255 V330 M135 255 V330 M170 255 V330", tone: "gold" },
  // Puerta
  { d: "M232 268 H266 V330 M232 268 V330 M258 300 V306", tone: "gold" },
  // Ventana corrida planta alta
  { d: "M172 162 H380 V205 H172 Z M240 162 V205 M310 162 V205", tone: "gold" },
  // Pileta
  { d: "M310 346 H456 L446 362 H318 Z M326 354 H438", tone: "gold" },
  // Árbol
  { d: "M44 330 V282 M44 300 L32 290 M44 292 L56 280", tone: "cream" },
  { d: "M44 284 C18 284 14 250 30 240 C26 214 58 206 66 228 C84 232 82 270 60 276 C56 284 50 286 44 284", tone: "cream" },
  // Cotas
  { d: "M150 118 H400 M150 112 V124 M400 112 V124", tone: "gold" },
  { d: "M430 140 V330 M424 140 H436 M424 330 H436", tone: "gold" },
  // Sol
  { d: "M440 68 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0", tone: "gold" },
  { d: "M440 40 V48 M440 88 V96 M412 68 H420 M460 68 H468", tone: "gold" },
];

const color = { gold: "var(--dorado-claro)", cream: "var(--crema)", faint: "rgba(242,235,221,0.18)" };

export default function HouseSketch({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>("[data-draw]");
      if (prefersReducedMotion()) {
        gsap.set(paths, { strokeDashoffset: 0 });
        return;
      }
      gsap.fromTo(
        paths,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power2.inOut",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 400"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Bosquejo conceptual de una casa dibujado a mano alzada"
    >
      {trazos.map((t, i) => (
        <path
          key={i}
          data-draw=""
          d={t.d}
          pathLength={1}
          stroke={color[t.tone ?? "cream"]}
          strokeWidth={t.w ?? 1.2}
          strokeDasharray="1"
          strokeDashoffset="0"
        />
      ))}
    </svg>
  );
}
