import { esVertical, type Medio } from "@/data/obras";

export type TipoFila = "par" | "trio" | "solo" | "ancho";

export type Slot = {
  /** Índice del medio dentro de obra.medios. */
  index: number;
  /** Posición en la grilla (6 col mobile / 12 col desde md). */
  cls: string;
  /** Alto máximo del medio en svh: define su tamaño real (el ancho sale del aspecto). */
  h: number;
  /** Velocidad relativa de parallax (desktop). */
  speed: number;
};

export type Fila = { tipo: TipoFila; slots: Slot[] };

type Plantilla = { cls: string; h: number; speed: number }[];

/*
  Las clases tienen que ser literales para que Tailwind las detecte.
  Mobile: grilla de 6 columnas. Desde md: 12 columnas.
*/
const PAR: Record<"normal" | "amplia", [Plantilla, Plantilla]> = {
  normal: [
    [
      { cls: "col-span-6 md:col-span-6 md:col-start-1 md:row-start-1 justify-self-start", h: 86, speed: -0.3 },
      { cls: "col-span-4 col-start-3 mt-10 justify-self-end md:col-span-4 md:col-start-8 md:row-start-1 md:mt-[24svh] md:justify-self-start", h: 54, speed: 0.9 },
    ],
    [
      { cls: "col-span-6 md:col-span-6 md:col-start-7 md:row-start-1 justify-self-end", h: 86, speed: -0.3 },
      { cls: "col-span-4 col-start-1 mt-10 justify-self-start md:col-span-4 md:col-start-2 md:row-start-1 md:mt-[34svh] md:justify-self-end", h: 54, speed: 0.9 },
    ],
  ],
  amplia: [
    [
      { cls: "col-span-6 md:col-span-6 md:col-start-1 md:row-start-1 justify-self-start md:justify-self-end", h: 94, speed: -0.25 },
      { cls: "col-span-5 col-start-2 mt-10 justify-self-end md:col-span-5 md:col-start-8 md:row-start-1 md:mt-[30svh] md:justify-self-start", h: 66, speed: 0.8 },
    ],
    [
      { cls: "col-span-6 md:col-span-6 md:col-start-7 md:row-start-1 justify-self-end md:justify-self-start", h: 94, speed: -0.25 },
      { cls: "col-span-5 col-start-1 mt-10 justify-self-start md:col-span-5 md:col-start-1 md:row-start-1 md:mt-[38svh] md:justify-self-end", h: 66, speed: 0.8 },
    ],
  ],
};

const TRIO: Plantilla = [
  { cls: "col-span-3 md:col-span-4 md:col-start-1 md:row-start-1 justify-self-start", h: 60, speed: 0.2 },
  { cls: "col-span-3 mt-16 md:col-span-4 md:col-start-5 md:row-start-1 md:mt-[14svh] justify-self-end md:justify-self-center", h: 60, speed: 0.75 },
  { cls: "col-span-4 col-start-2 mt-10 md:col-span-4 md:col-start-9 md:row-start-1 md:mt-[5svh] justify-self-center md:justify-self-end", h: 60, speed: -0.2 },
];

const SOLO: Record<"normal" | "amplia", Plantilla> = {
  normal: [{ cls: "col-span-4 col-start-2 md:col-span-12 md:col-start-1 justify-self-center", h: 74, speed: 0.15 }],
  amplia: [{ cls: "col-span-6 md:col-span-12 md:col-start-1 justify-self-center", h: 88, speed: 0.15 }],
};

const ANCHO: [Plantilla, Plantilla] = [
  [{ cls: "col-span-6 md:col-span-10 md:col-start-1 justify-self-start", h: 82, speed: 0.1 }],
  [{ cls: "col-span-6 md:col-span-10 md:col-start-3 justify-self-end", h: 82, speed: 0.1 }],
];

const tamanos: Record<Exclude<TipoFila, "ancho">, number> = { par: 2, trio: 3, solo: 1 };

/**
 * Compone la galería de una obra a partir de sus medios (3 a 14), respetando el orden.
 * - Ritmo para muchas tomas: par → trío → solo → par (espejado) → trío → …
 * - Pocas tomas verticales (≤ 6): modo "amplio", alterna pares grandes y solos.
 * - Medios horizontales: fila "ancha" propia, alternando el lado.
 * - Nunca deja un solo suelto al final de otro solo: lo absorbe como par.
 */
export function componerGaleria(medios: Medio[]): Fila[] {
  const verticales = medios.filter(esVertical).length;
  const modo = verticales <= 6 ? "amplia" : "normal";
  const ciclo: Exclude<TipoFila, "ancho">[] = modo === "amplia" ? ["par", "solo"] : ["par", "trio", "solo", "par", "trio"];

  const grupos: { tipo: TipoFila; items: number[] }[] = [];
  let paso = 0;
  let i = 0;
  while (i < medios.length) {
    if (!esVertical(medios[i])) {
      grupos.push({ tipo: "ancho", items: [i] });
      i++;
      continue;
    }
    const quiero = ciclo[paso % ciclo.length];
    paso++;
    const items: number[] = [];
    while (items.length < tamanos[quiero] && i < medios.length && esVertical(medios[i])) items.push(i++);

    const prev = grupos[grupos.length - 1];
    if (items.length === 1 && prev?.tipo === "solo") {
      // Dos solos seguidos se leen como hueco: se convierten en un par.
      prev.tipo = "par";
      prev.items.push(items[0]);
      continue;
    }
    const tipo: TipoFila = items.length === tamanos[quiero] ? quiero : items.length === 1 ? "solo" : items.length === 2 ? "par" : "trio";
    grupos.push({ tipo, items });
  }

  let pares = 0;
  let anchos = 0;
  return grupos.map(({ tipo, items }) => {
    let plantilla: Plantilla;
    if (tipo === "par") plantilla = PAR[modo][pares++ % 2];
    else if (tipo === "trio") plantilla = TRIO;
    else if (tipo === "solo") plantilla = SOLO[modo];
    else plantilla = ANCHO[anchos++ % 2];
    return { tipo, slots: items.map((index, k) => ({ index, ...plantilla[k] })) };
  });
}
