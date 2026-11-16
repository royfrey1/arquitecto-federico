import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/data/site";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="bg-carbon px-4 pb-8 pt-16 text-crema sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px] border-t border-crema/15 pt-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-mp.png" alt="" width={57} height={48} className="h-12 w-auto" />
            <div className="leading-tight">
              <p className="font-serif text-xl">{site.nombre}</p>
              <p className="label mt-1 text-crema/55">{site.rol}</p>
            </div>
          </div>

          <nav aria-label="Pie de página">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-crema/75">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-1 hover:text-crema">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={site.cuestionario} className="inline-block py-1 hover:text-crema">
                  Render gratis
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex gap-3 md:justify-end">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-crema/25 transition-colors hover:border-crema hover:bg-crema/10"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-crema/25 transition-colors hover:border-crema hover:bg-crema/10"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-crema/10 pt-6 text-sm text-crema/55 md:flex-row md:justify-between">
          <p>© 2026 {site.nombre} · Arquitecto · Desarrollador</p>
          <p>{site.zonas.join(" · ")}</p>
        </div>

        <p className="mt-10 text-center text-xs text-crema/60">
          Diseñado y desarrollado por{" "}
          <a
            href={site.credito.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-crema/25 underline-offset-4 hover:text-crema"
          >
            {site.credito.nombre}
          </a>
        </p>
      </div>
    </footer>
  );
}
