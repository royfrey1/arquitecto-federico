export type Servicio = {
  numero: string;
  titulo: string;
  /** Qué etapas incluye, tal como figura en la web. */
  incluye: string;
  texto: string;
  destacado?: boolean;
};

export const servicios: Servicio[] = [
  {
    numero: "01",
    titulo: "Anteproyecto",
    incluye: "Etapa 1",
    texto: "Plantas, cortes, renders y materiales para decidir con información, no a ojo.",
  },
  {
    numero: "02",
    titulo: "Proyecto ejecutivo",
    incluye: "Etapa 1 + 2",
    texto: "Documentación completa para que tu constructor ejecute sin interpretar.",
  },
  {
    numero: "03",
    titulo: "Proyecto y dirección de obra",
    incluye: "Etapa 1 + 2 + 3",
    texto: "Me hago cargo de todo. Vos ves el avance; yo resuelvo. Llaves en mano.",
    destacado: true,
  },
];

/** Pasos del render gratis (textos del cuestionario y de la Home actual). */
export const pasosRender = [
  {
    titulo: "Completás el cuestionario",
    texto: "Elegís si es casa, local o edificio y las preguntas se adaptan a tu proyecto.",
  },
  {
    titulo: "Federico arma tu render conceptual",
    texto: "Una imagen conceptual de tu casa, armada con tus respuestas.",
  },
  {
    titulo: "Te lo manda por WhatsApp",
    texto: "Federico revisa tus respuestas y te manda tu render. Sin costo y sin compromiso.",
  },
  {
    titulo: "Lo ajustamos en una llamada",
    texto: "Lo revisamos juntos, corrijo lo que haga falta y te muestro una versión más detallada.",
  },
] as const;
