import Image from "next/image";
import { site } from "@/data/site";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";

export default function SobreMi() {
  return (
    <section
      id="sobre-mi"
      aria-labelledby="sobre-title"
      className="on-light bg-crema px-4 py-24 sm:px-6 md:py-36 lg:px-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="07" label="Sobre mí" />

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 lg:gap-28">
          {/*
            Foto de Federico: /public/brand/federico.jpg (720×1280, vertical). En 4:5 se recorta
            arriba y abajo; object-position 50% 68% deja a Federico entero (cabeza a zapatillas)
            con la puerta de madera a la derecha.
          */}
          <Reveal variant="media" className="relative aspect-[4/5] w-full overflow-hidden border border-carbon/15 bg-crema-2">
            <Image
              src="/brand/federico.jpg"
              alt="Federico Marzano Pacheco, arquitecto"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              quality={80}
              className="object-cover object-[50%_68%]"
            />
          </Reveal>

          <div className="flex flex-col justify-center">
            <p className="label text-dorado-oscuro">{site.rol}</p>
            <RevealLines id="sobre-title" className="mt-6 font-display text-[clamp(2.6rem,6vw,5.75rem)]">
              Pienso la casa antes de que <em className="kw">exista.</em>
            </RevealLines>

            <Reveal stagger className="mt-10 max-w-2xl space-y-5 text-lg text-texto-suave">
              <p>
                Soy arquitecto y desarrollador, con 25 años de experiencia. Trabajo con una idea simple: la mayoría
                de los problemas de una obra nacen en el plano, así que los resuelvo ahí, antes de que se vuelvan
                costos.
              </p>
              <p>
                Hago obra nueva, reformas y locales comerciales en {site.zonas.slice(0, -1).join(", ")} y{" "}
                {site.zonas.at(-1)}. Vos elegís hasta dónde querés que me involucre.
              </p>
              <p className="text-carbon">
                Del primer boceto a la entrega de llaves, tenés un solo responsable: yo.
              </p>
            </Reveal>

            <Reveal className="mt-12 border-t border-carbon/15 pt-6">
              <p className="font-serif text-3xl font-light italic text-petroleo">{site.nombre}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
