"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/data/site";
import { getLenis } from "@/lib/lenis";
import { WhatsAppIcon } from "@/components/ui/Icons";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 240);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menú mobile: bloquear scroll, Escape, foco
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Páginas sin hero oscuro arriba: header sólido y fijo (no se esconde con el scroll).
  const pageClara = usePathname() === site.cuestionario;
  const solid = (scrolled || pageClara) && !open;
  const light = !solid; // texto claro sobre hero o menú

  return (
    <>
      <a
        href="#contenido"
        className="label fixed left-4 top-4 z-[80] -translate-y-24 rounded-full bg-crema px-4 py-3 text-carbon focus:translate-y-0"
      >
        Saltar al contenido
      </a>

      <header
        style={{ viewTransitionName: "site-header" }}
        data-intro-hide=""
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,border-color,opacity] duration-700 ease-[var(--ease-editorial)] ${
          hidden && !open && !pageClara ? "-translate-y-full" : "translate-y-0"
        } ${
          solid
            ? "border-b border-carbon/10 bg-crema/80 text-carbon backdrop-blur-xl"
            : "border-b border-transparent bg-transparent text-crema"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          {/* Nombre accesible = texto visible + "inicio" (WCAG 2.5.3, label in name) */}
          <Link href="/#inicio" className="flex min-w-0 items-center gap-3">
            <Image src="/brand/logo-mp.png" alt="" width={47} height={40} className="h-9 w-auto shrink-0 md:h-10" preload />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-serif text-[1.0625rem] font-normal md:text-lg">{site.nombre}</span>
              <span className={`label !text-[0.625rem] ${light ? "text-crema/70" : "text-dorado-oscuro"}`}>
                {site.rol}
              </span>
              <span className="sr-only">, inicio</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative py-2 text-[0.9375rem] font-medium"
              >
                {item.label}
                <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-x-100" />
              </Link>
            ))}
            <Link
              href={site.cuestionario}
              className="inline-flex min-h-11 items-center rounded-full bg-petroleo px-5 text-sm font-semibold text-crema transition-colors hover:bg-[#173d3d]"
            >
              Render gratis
            </Link>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="relative z-10 -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-6">
              <span
                className={`absolute left-0 top-0 h-px w-6 bg-current transition-transform duration-500 ${
                  open ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-6 bg-current transition-transform duration-500 ${
                  open ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Menú mobile fullscreen */}
      <div
        id="menu-mobile"
        ref={menuRef}
        className={`fixed inset-0 z-[45] flex flex-col bg-carbon px-6 pb-8 pt-[calc(var(--header-h)+2rem)] text-crema transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Menú móvil" className="flex flex-1 flex-col justify-center">
          <ul className="space-y-1">
            {[...nav, { label: "Render gratis", href: site.cuestionario }].map((item, i) => (
              <li key={item.href} className="overflow-hidden">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-baseline gap-4 py-1.5 font-serif text-[2.6rem] font-light leading-tight transition-transform duration-700 ease-[var(--ease-editorial)] sm:text-6xl ${
                    open ? "translate-y-0" : "translate-y-full"
                  }`}
                  style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
                >
                  <span className="num text-sm text-dorado">{String(i + 1).padStart(2, "0")}</span>
                  {item.label === "Render gratis" ? <em className="kw">{item.label}</em> : item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-t border-crema/15 pt-6 text-sm text-crema/75 transition-opacity delay-500 duration-700 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2">
            <WhatsAppIcon className="h-4 w-4" /> {site.telefono}
          </a>
          <span className="label">{site.zonas.join(" · ")}</span>
        </div>
      </div>
    </>
  );
}
