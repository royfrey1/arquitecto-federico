import { ViewTransition, type ReactNode } from "react";

/*
  Transición entre páginas con React <ViewTransition> (estable en React 19.3 / Next 16.4,
  sin flags). Solo anima navegaciones etiquetadas con `transitionTypes` en <Link>:
    - "obra-forward": Home → obra, obra → siguiente obra
    - "obra-back":    obra → Home (#obras)
  Atrás/adelante del navegador no llevan tipo → sin animación de página (cambio instantáneo),
  así nunca se rompe el historial. Las clases se estilizan en globals.css.
*/
const porTipo = {
  "obra-forward": "page-forward",
  "obra-back": "page-back",
  default: "none",
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={porTipo} exit={porTipo} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
