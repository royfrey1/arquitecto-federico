import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

/** Scroll a un ancla respetando Lenis (o nativo si está desactivado). */
export const scrollToHash = (hash: string, { immediate = false }: { immediate?: boolean } = {}) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return false;

  const run = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.start();
      // Tras una navegación cliente, Lenis puede tener el alto de la página anterior.
      lenis.resize();
      lenis.scrollTo(target, immediate ? { immediate: true } : { duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }
    history.replaceState(null, "", hash);
    // Mover el foco para lectores de pantalla / teclado.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  // Si el menú mobile está abierto (scroll bloqueado), esperar a que se cierre.
  const locked = getLenis()?.isStopped || document.documentElement.style.overflow === "hidden";
  if (locked) window.setTimeout(run, 80);
  else run();
  return true;
};
