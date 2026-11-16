import type { Obra } from "@/data/obras";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

/** Envuelve el fragmento `destacado` (literal de la descripción) en itálica dorada. */
function Descripcion({ texto, destacado }: { texto: string; destacado?: string }) {
  const i = destacado ? texto.indexOf(destacado) : -1;
  if (!destacado || i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <em className="kw">{destacado}</em>
      {texto.slice(i + destacado.length)}
    </>
  );
}

export default function FichaTecnica({ obra }: { obra: Obra }) {
  // Solo los datos que existen: Superficie y Sistema aparecen únicamente donde la web los menciona.
  const datos: [string, string][] = [
    ["Estado", obra.estado],
    ["Ubicación", obra.ubicacion],
    ["Zona", obra.zona],
    ["Tipo", obra.tipo],
  ];
  if (obra.m2) datos.push(["Superficie", `${obra.m2} m²`]);
  if (obra.sistema) datos.push(["Sistema constructivo", obra.sistema]);

  return (
    <section
      id="ficha"
      aria-labelledby="ficha-title"
      className="on-light bg-crema px-4 py-24 text-carbon sm:px-6 md:py-36 lg:px-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="01" label="Ficha técnica">
          {obra.ubicacion}
        </SectionHead>
        <h2 id="ficha-title" className="sr-only">
          Ficha técnica de {obra.nombre}
        </h2>

        <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-24">
          <Reveal className="self-start">
            <dl className="grid grid-cols-2 border-t border-carbon/15">
              {datos.map(([dt, dd], i) => {
                const ultimoImpar = i === datos.length - 1 && datos.length % 2 === 1;
                return (
                  <div
                    key={dt}
                    className={`border-b border-carbon/15 py-5 md:py-6 ${
                      ultimoImpar ? "col-span-2" : i % 2 === 0 ? "border-r pr-5" : "pl-5"
                    }`}
                  >
                    <dt className="label text-texto-suave">{dt}</dt>
                    <dd className="mt-2 font-serif text-xl leading-snug md:text-2xl">{dd}</dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>

          <Reveal>
            <p className="font-serif text-[clamp(1.75rem,3.4vw,3.4rem)] font-light leading-[1.18] tracking-[-0.015em] [font-variation-settings:'opsz'_96]">
              <Descripcion texto={obra.descripcionLarga} destacado={obra.destacado} />
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
