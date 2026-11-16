export type ParAntesDespues = {
  id: string;
  label: string;
  titulo: string;
  obra: string;
  obraSlug: string;
  /** Bajada de la obra, tal como figura en la web. */
  contexto?: string;
  antes: { src: string; alt: string };
  despues: { src: string; alt: string };
};

const dir = "/media/antes-despues";

export const antesDespues: ParAntesDespues[] = [
  {
    id: "pileta",
    label: "Pileta",
    titulo: "Pileta con borde infinito",
    obra: "Casona Puertos Vistas",
    obraSlug: "casona-puertos-vistas",
    antes: { src: `${dir}/ba-pileta-antes.jpg`, alt: "Pileta con borde infinito, en obra" },
    despues: { src: `${dir}/ba-pileta-despues.jpg`, alt: "Pileta con borde infinito, terminado" },
  },
  {
    id: "frente",
    label: "Frente",
    titulo: "Frente de la casa",
    obra: "Casona Puertos Vistas",
    obraSlug: "casona-puertos-vistas",
    antes: { src: `${dir}/ba-frente-antes.jpg`, alt: "Frente de la casa, en obra" },
    despues: { src: `${dir}/ba-frente-despues.jpg`, alt: "Frente de la casa, terminado" },
  },
  {
    id: "escalera",
    label: "Escalera",
    titulo: "Escalera y doble altura",
    obra: "Casona Puertos Vistas",
    obraSlug: "casona-puertos-vistas",
    antes: { src: `${dir}/ba-escalera-antes.jpg`, alt: "Escalera y doble altura, en obra" },
    despues: { src: `${dir}/ba-escalera-despues.jpg`, alt: "Escalera y doble altura, terminado" },
  },
  {
    id: "fachada",
    label: "Fachada",
    titulo: "Fachada",
    obra: "RESET Café",
    obraSlug: "reset-cafe",
    contexto: "De cabaña abandonada a cafetería",
    antes: { src: `${dir}/ba-reset-antes.jpg`, alt: "Fachada, en obra" },
    despues: { src: `${dir}/ba-reset-despues.jpg`, alt: "Fachada, terminado" },
  },
  {
    id: "interior",
    label: "Interior",
    titulo: "Interior",
    obra: "RESET Café",
    obraSlug: "reset-cafe",
    contexto: "De cabaña abandonada a cafetería",
    antes: { src: `${dir}/ba-resetin-antes.jpg`, alt: "Interior, en obra" },
    despues: { src: `${dir}/ba-resetin-despues.jpg`, alt: "Interior, terminado" },
  },
];
