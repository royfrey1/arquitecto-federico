"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { antesDespues as todos, type ParAntesDespues } from "@/data/antes-despues";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const clamp = (n: number) => Math.min(100, Math.max(0, n));

type Props = {
  /** Pares a mostrar (por defecto, todos). En la página de una obra se filtran. */
  pares?: ParAntesDespues[];
  numero?: string;
  /** Bajada bajo el título. */
  bajada?: string;
  /** Fondo: carbón (Home) o crema (para alternar con la galería en las obras). */
  tone?: "carbon" | "crema";
};

export default function AntesDespues({
  pares: antesDespues = todos,
  numero = "04",
  bajada = "De la obra a la entrega. Deslizá para comparar.",
  tone = "carbon",
}: Props) {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const par = antesDespues[index];
  const dark = tone === "carbon";
  const t = dark
    ? { section: "bg-carbon text-crema", soft: "text-crema/75", line: "border-crema/15", row: "border-crema/10", obra: "text-crema/65", on: "text-crema", off: "text-crema/60 hover:text-crema/85", num: "text-dorado", cap: "text-crema/60" }
    : { section: "on-light bg-crema text-carbon", soft: "text-carbon/75", line: "border-carbon/15", row: "border-carbon/10", obra: "text-carbon/60", on: "text-carbon", off: "text-carbon/65 hover:text-carbon/90", num: "text-dorado-oscuro", cap: "text-carbon/65" };

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  // Transición suave al cambiar de par
  useEffect(() => {
    if (!stageRef.current || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      stageRef.current,
      { autoAlpha: 0, scale: 1.04 },
      { autoAlpha: 1, scale: 1, duration: 0.9, ease: "expo.out" },
    );
    const p = { v: 18 };
    const sweep = gsap.to(p, {
      v: 50,
      duration: 1.2,
      ease: "expo.out",
      onUpdate: () => setPos(p.v),
    });
    return () => {
      tween.kill();
      sweep.kill();
    };
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const map: Record<string, number> = {
      ArrowLeft: pos - step,
      ArrowDown: pos - step,
      ArrowRight: pos + step,
      ArrowUp: pos + step,
      Home: 0,
      End: 100,
      PageDown: pos - 10,
      PageUp: pos + 10,
    };
    if (e.key in map) {
      e.preventDefault();
      setPos(clamp(map[e.key]));
    }
  };

  const onTabsKey = (e: React.KeyboardEvent) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % antesDespues.length;
    if (e.key === "ArrowLeft") next = (index - 1 + antesDespues.length) % antesDespues.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = antesDespues.length - 1;
    if (next >= 0) {
      e.preventDefault();
      setIndex(next);
      tabsRef.current[next]?.focus();
    }
  };

  return (
    <section
      id="antes"
      aria-labelledby="antes-title"
      className={`${t.section} px-4 py-24 sm:px-6 md:py-36 lg:px-10`}
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero={numero} label="Antes y después" tone={dark ? "dark" : "light"} />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* Columna de texto + tabs */}
          <div className="flex flex-col">
            <RevealLines id="antes-title" className="font-display text-[clamp(3rem,8vw,7.5rem)]">
              Antes y <em className="kw">después</em>
            </RevealLines>
            <Reveal>
              <p className={`mt-6 max-w-sm text-lg ${t.soft}`}>{bajada}</p>
            </Reveal>

            <div
              role="tablist"
              aria-label="Elegí una comparación"
              className={`mt-12 border-t ${t.line} lg:mt-auto`}
              onKeyDown={onTabsKey}
            >
              {antesDespues.map((p, i) => {
                const nuevaObra = i === 0 || antesDespues[i - 1].obra !== p.obra;
                const selected = i === index;
                return (
                  <div key={p.id}>
                    {nuevaObra && (
                      <p className={`label pb-2 pt-6 ${t.obra}`}>
                        {p.obra}
                        {p.contexto && <span className="normal-case tracking-normal"> · {p.contexto.toLowerCase()}</span>}
                      </p>
                    )}
                    <button
                      ref={(el) => {
                        tabsRef.current[i] = el;
                      }}
                      role="tab"
                      type="button"
                      id={`tab-${p.id}`}
                      aria-selected={selected}
                      aria-controls="antes-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setIndex(i)}
                      className={`group flex w-full items-baseline gap-4 border-b ${t.row} py-3 text-left transition-colors duration-300 ${
                        selected ? t.on : t.off
                      }`}
                    >
                      <span className={`num w-8 text-sm ${selected ? t.num : ""}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-serif text-2xl font-light md:text-3xl">{p.label}</span>
                      <span
                        className={`ml-auto h-px bg-dorado transition-all duration-500 ${selected ? "w-12" : "w-0"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider */}
          <div id="antes-panel" role="tabpanel" aria-labelledby={`tab-${par.id}`}>
            <div
              ref={frameRef}
              className="relative mx-auto aspect-[4/5] w-full max-w-[40rem] cursor-ew-resize touch-pan-y select-none overflow-hidden bg-carbon-2 lg:w-[min(100%,68svh)]"
              onPointerDown={(e) => {
                dragging.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                setFromClientX(e.clientX);
              }}
              onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
            >
              <div ref={stageRef} className="absolute inset-0">
                <Image
                  key={par.despues.src}
                  src={par.despues.src}
                  alt={par.despues.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  quality={80}
                  className="pointer-events-none object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                  <Image
                    key={par.antes.src}
                    src={par.antes.src}
                    alt={par.antes.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    quality={80}
                    className="pointer-events-none object-cover"
                    draggable={false}
                  />
                </div>
              </div>

              <span className="label pointer-events-none absolute left-4 top-4 rounded-full bg-carbon/70 px-3 py-1.5 text-crema backdrop-blur">
                Antes
              </span>
              <span className="label pointer-events-none absolute right-4 top-4 rounded-full bg-crema/85 px-3 py-1.5 text-carbon backdrop-blur">
                Después
              </span>

              {/* Divisor + manija accesible */}
              <div className="pointer-events-none absolute inset-y-0 w-px bg-crema" style={{ left: `${pos}%` }}>
                <button
                  type="button"
                  role="slider"
                  aria-label={`Comparar antes y después: ${par.titulo}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(pos)}
                  aria-valuetext={`${Math.round(pos)}% antes`}
                  aria-orientation="horizontal"
                  onKeyDown={onKeyDown}
                  className="pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-crema/60 bg-carbon/40 text-crema backdrop-blur-md"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
            <p className={`mx-auto mt-4 flex w-full max-w-[40rem] justify-between gap-4 lg:w-[min(100%,68svh)] text-sm ${t.cap}`}>
              <span>{par.titulo}</span>
              <span className="italic">{par.obra}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
