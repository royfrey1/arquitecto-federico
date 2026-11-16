"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { WhatsAppIcon } from "@/components/ui/Icons";

/** Botón flotante: aparece al pasar el hero (≈ 1 viewport de scroll). */
export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  // En el cuestionario no aparece: taparía los botones del paso y el envío ya es por WhatsApp.
  const enCuestionario = usePathname() === site.cuestionario;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (enCuestionario) return null;

  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribime por WhatsApp"
      data-intro-hide=""
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-petroleo text-crema shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-[opacity,translate,scale] duration-500 ease-[var(--ease-editorial)] hover:scale-105 md:bottom-8 md:right-8 md:h-16 md:w-16 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <WhatsAppIcon className="h-6 w-6 md:h-7 md:w-7" />
    </a>
  );
}
