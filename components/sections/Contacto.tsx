import { site } from "@/data/site";
import SectionHead from "@/components/ui/SectionHead";
import RevealLines from "@/components/ui/RevealLines";
import Reveal from "@/components/ui/Reveal";
import { ArrowUpRight, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";

export default function Contacto() {
  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="bg-carbon px-4 pb-16 pt-24 text-crema sm:px-6 md:pt-36 lg:px-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHead numero="09" label="Contacto" tone="dark" />

        <RevealLines
          id="contacto-title"
          className="mt-14 font-display text-[clamp(3rem,9.5vw,10rem)] md:mt-20"
        >
          ¿Preferís hablar directo? <em className="kw">Te respondo yo.</em>
        </RevealLines>

        <Reveal className="mt-16 grid gap-10 border-t border-crema/15 pt-10 md:mt-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-6 rounded-full bg-petroleo py-4 pl-7 pr-4 transition-colors duration-300 hover:bg-[#245a5a] md:py-5 md:pl-9"
          >
            <span className="flex flex-col">
              <span className="label text-crema/70">Escribime por WhatsApp</span>
              <span className="mt-1 font-serif text-2xl md:text-3xl">{site.telefono}</span>
            </span>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-crema text-petroleo transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
          </a>

          <div>
            <p className="label text-crema/55">Instagram</p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex items-center gap-3 font-serif text-2xl hover:text-dorado"
            >
              <InstagramIcon className="h-5 w-5" />
              {site.instagramHandle}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div>
            <p className="label text-crema/55">Zonas de trabajo</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-serif text-2xl">
              {site.zonas.map((z, i) => (
                <li key={z}>
                  {z}
                  {i < site.zonas.length - 1 && <span className="ml-4 text-dorado" aria-hidden="true">·</span>}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
