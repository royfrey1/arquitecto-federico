"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_HTML, mountEngine } from "./engine";
import "./cuestionario.css";

type Sketch = { upd: () => void; dispose: () => void };

/**
 * /cuestionario — preguntas a la izquierda y "Bosquejo en vivo" (three.js) a la derecha,
 * sticky. En mobile el bosquejo va arriba, más chico y colapsable.
 * three se carga con import() dinámico solo acá, así no pesa en el resto del sitio.
 */
export default function Cuestionario() {
  const formRef = useRef<HTMLFormElement>(null);
  const stepRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const vstRef = useRef<HTMLElement>(null);
  const vtxRef = useRef<HTMLSpanElement>(null);
  const vtgRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [sinWebgl, setSinWebgl] = useState(false);

  useEffect(() => {
    let sketch: Sketch | null = null;
    let alive = true;
    const engine = mountEngine(
      { form: formRef.current!, stepLbl: stepRef.current!, pbar: barRef.current! },
      { onUpdate: () => sketch?.upd() },
    );
    import("./sketch")
      .then(({ createSketch }) => {
        if (!alive) return;
        try {
          sketch = createSketch(cvRef.current!, { vst: vstRef.current!, vtx: vtxRef.current!, vtg: vtgRef.current! }, engine.ctx);
        } catch {
          // Sin WebGL: igual que el original, se oculta el bosquejo y el cuestionario sigue.
          setSinWebgl(true);
        }
      })
      .catch(() => setSinWebgl(true));
    return () => {
      alive = false;
      sketch?.dispose();
      engine.destroy();
    };
  }, []);

  return (
    <div className="cq on-light">
      {/* Progreso: barra fina dorada bajo el header */}
      <div className="cq-prog" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <div className="cq-main">
        <div className="cq-col">
          <p ref={stepRef} className="cq-step label" aria-live="polite" />
          {/* La intro llega renderizada desde el servidor; el motor toma el control al montar. */}
          <form
            ref={formRef}
            className="panel"
            noValidate
            aria-label="Cuestionario para tu render"
            dangerouslySetInnerHTML={{ __html: INTRO_HTML }}
          />
        </div>

        {!sinWebgl && (
          <aside className="view" aria-label="Bosquejo 3D de tu proyecto" data-open={open}>
            <div className="view-head">
              <span className="live">Bosquejo en vivo</span>
              <button
                type="button"
                className="view-toggle"
                aria-expanded={open}
                aria-controls="cq-view-body"
                onClick={() => setOpen((o) => !o)}
              >
                {open ? "Ocultar" : "Mostrar"}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            <div id="cq-view-body" className="view-body">
              <canvas
                ref={cvRef}
                tabIndex={0}
                aria-label="Maqueta 3D que gira. Usá las flechas izquierda y derecha para girarla."
              />
              <div className="cap">
                <b ref={vstRef}>Terreno y replanteo</b>
                <span ref={vtxRef}>Arrastrá para girar la maqueta. Se arma sola a medida que respondés.</span>
                <div className="tags" ref={vtgRef} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
