export type Orientacion = "vertical" | "horizontal";

export type MedioVideo = {
  tipo: "video";
  src: string;
  /** Versión liviana para mobile (720p máx, sin audio). */
  srcMobile: string;
  poster: string;
  alt: string;
  /** Nombre corto derivado del archivo (ej. pv-pileta → "Pileta"). */
  caption: string;
  orientacion: Orientacion;
  /** Dimensiones reales del archivo (para reservar el aspecto). */
  width: number;
  height: number;
};

export type MedioImagen = {
  tipo: "imagen";
  src: string;
  alt: string;
  /** Nombre corto derivado del archivo / contenido. */
  caption: string;
  width: number;
  height: number;
};

export type Medio = MedioVideo | MedioImagen;

export type EstadoObra = "Terminada" | "En obra" | "Obra nueva" | "Comercial";

export type Obra = {
  slug: string;
  nombre: string;
  estado: EstadoObra;
  /** Ubicación completa tal como figura en la web. */
  ubicacion: string;
  /** Zona corta para listados. */
  zona: string;
  tipo: string;
  /** Sistema constructivo, solo si la web lo menciona. */
  sistema?: string;
  descripcionCorta: string;
  /** La web actual tiene un único párrafo por obra: se replica completo. */
  descripcionLarga: string;
  /** Fragmento literal de la descripción que se destaca en itálica dorada. */
  destacado?: string;
  /** Solo si el dato existe en la web. */
  m2?: number;
  cover: string;
  /** Video principal (previsualización en el índice y portada de la obra). */
  videoPrincipal: MedioVideo;
  medios: Medio[];
};

const video = (
  carpeta: string,
  nombre: string,
  alt: string,
  caption: string,
  [width, height]: [number, number] = [540, 960],
): MedioVideo => ({
  tipo: "video",
  src: `/media/${carpeta}/${nombre}.mp4`,
  srcMobile: `/media/${carpeta}/${nombre}-m.mp4`,
  poster: `/media/${carpeta}/${nombre}-poster.jpg`,
  alt,
  caption,
  orientacion: width > height ? "horizontal" : "vertical",
  width,
  height,
});

const imagen = (
  carpeta: string,
  archivo: string,
  alt: string,
  caption: string,
  width: number,
  height: number,
): MedioImagen => ({ tipo: "imagen", src: `/media/${carpeta}/${archivo}`, alt, caption, width, height });

export const esVertical = (m: Medio) => m.height > m.width;

/* ---------- Casona Puertos Vistas ---------- */
const pv = "puertos-vistas";
const pvMedios: Medio[] = [
  video(pv, "pv-exterior", "Frente terminado con jardín", "Exterior"),
  video(pv, "pv-pileta", "Pileta con borde infinito hacia el lago", "Pileta"),
  video(pv, "pv-cocina", "Cocina con isla de mármol", "Cocina"),
  imagen(pv, "pv-foto-7930.webp", "Living con ventanales al lago", "Living", 1000, 1333),
  video(pv, "pv-escalera2", "Escalera con baranda de vidrio", "Escalera"),
  video(pv, "pv-dormitorio", "Dormitorio con ventana al lago", "Dormitorio"),
  video(pv, "pv-vestidor", "Vestidor a medida", "Vestidor"),
  video(pv, "pv-bano", "Baño en suite", "Baño"),
  imagen(pv, "pv-foto-7939.webp", "Baño con bañera exenta", "Bañera", 1000, 1333),
  video(pv, "pv-espejo", "Espejo de agua en piedra", "Espejo de agua"),
  video(pv, "pv-toma", "Toma escamoteable en la mesada", "Toma escamoteable"),
  video(pv, "pv-galeria", "Galería con parrilla y vista al lago", "Galería"),
  video(pv, "pv-lago", "Jardín hacia el lago", "Lago"),
  video(pv, "pv-fachada", "Puerta pivotante de madera", "Fachada"),
];

/* ---------- Casa San Sebastián ---------- */
const ss = "san-sebastian";
const ssMedios: Medio[] = [
  video(ss, "ss-piedra", "Piso y muro de piedra", "Piedra"),
  video(ss, "ss-ducha", "Ducha contra muro de piedra", "Ducha"),
  video(ss, "ss-lamparas", "Lámparas colgantes sobre el muro de piedra", "Lámparas"),
  video(ss, "ss-bano", "Baño con ventanales verdes", "Baño"),
  video(ss, "ss-banera", "Bañera Villeroy & Boch", "Bañera"),
  video(ss, "ss-inodoro", "Inodoro y bidet de diseño", "Inodoro"),
  video(ss, "ss-bacha", "Bacha sobre mueble tallado", "Bacha"),
];

/* ---------- Casa El Cantón ---------- */
const ca = "el-canton";
const caMedios: Medio[] = [
  video(ca, "ca-frente", "Frente de la casa desde la vereda", "Frente"),
  video(ca, "ca-entrada", "Entrada con pérgola", "Entrada"),
  video(ca, "ca-fachada", "Fachada y puerta de madera", "Fachada"),
  video(ca, "ca-ventanal", "Ventanal corredizo hacia el jardín", "Ventanal"),
  video(ca, "ca-dormitorio", "Dormitorio luminoso", "Dormitorio"),
];

/* ---------- Casa Los Castores ---------- */
const cs = "los-castores";
const csMedios: Medio[] = [
  video(cs, "cs-frente", "Fachada de tres pisos en obra", "Frente"),
  video(cs, "cs-estructura", "Estructura de Steel Frame", "Estructura"),
  video(cs, "cs-parrilla", "Parrilla en obra", "Parrilla"),
  video(cs, "cs-steeldeck", "Losa de Steel Deck vista desde abajo", "Steel Deck"),
];

/* ---------- Casa Las Vizcachas ---------- */
const vz = "las-vizcachas";
const vzMedios: Medio[] = [
  video(vz, "vz-dron", "Vista aérea de la casa y la pileta", "Vista aérea", [900, 500]),
  imagen(vz, "las-vizcachas.webp", "Casa de campo Las Vizcachas con pileta", "La casa", 1080, 600),
  video(vz, "vz-cocina", "Cocina integrada", "Cocina"),
  video(vz, "vz-pasillo", "Pasillo con ventanales", "Pasillo"),
];

/* ---------- RESET Café ---------- */
const rs = "reset-cafe";
const rsMedios: Medio[] = [
  imagen(rs, "reset-cafe.webp", "Fachada de RESET Café", "Fachada", 1080, 810),
  video(rs, "rs-salon", "Salón con entrepiso", "Salón"),
  video(rs, "rs-living", "Living bajo la estructura de madera", "Living"),
  video(rs, "rs-mesas", "Mesas vistas desde el entrepiso", "Mesas"),
  video(rs, "rs-biblioteca", "Salón con biblioteca", "Biblioteca"),
  video(rs, "rs-escalera", "Escalera metálica", "Escalera"),
];

const primerVideo = (m: Medio[]) => m.find((x): x is MedioVideo => x.tipo === "video")!;

export const obras: Obra[] = [
  {
    slug: "casona-puertos-vistas",
    nombre: "Casona Puertos Vistas",
    estado: "Terminada",
    ubicacion: "Puertos, Escobar",
    zona: "Escobar",
    tipo: "Vivienda",
    descripcionCorta:
      "Pileta con borde infinito hacia el lago, máster suite con vista y cuatro baños pensados uno por uno.",
    descripcionLarga:
      "Pileta con borde infinito hacia el lago, máster suite con vista y cuatro baños pensados uno por uno.",
    destacado: "borde infinito",
    m2: 320,
    cover: "/media/puertos-vistas/pv-pileta-poster.jpg",
    videoPrincipal: pvMedios[1] as MedioVideo,
    medios: pvMedios,
  },
  {
    slug: "casa-san-sebastian",
    nombre: "Casa San Sebastián",
    estado: "Terminada",
    ubicacion: "San Sebastián, Pilar",
    zona: "Pilar",
    tipo: "Vivienda",
    descripcionCorta:
      "Piedra real, ventanales de hierro y baños de autor con artefactos Villeroy & Boch.",
    descripcionLarga:
      "Piedra real, ventanales de hierro y baños de autor con artefactos Villeroy & Boch.",
    destacado: "Piedra real",
    cover: "/media/san-sebastian/ss-piedra-poster.jpg",
    videoPrincipal: primerVideo(ssMedios),
    medios: ssMedios,
  },
  {
    slug: "casa-el-canton",
    nombre: "Casa El Cantón",
    estado: "Terminada",
    ubicacion: "El Cantón, Escobar",
    zona: "Escobar",
    tipo: "Vivienda",
    descripcionCorta:
      "Una casa blanca con puerta de madera, galería de entrada y ventanales hacia el jardín.",
    descripcionLarga:
      "Una casa blanca con puerta de madera, galería de entrada y ventanales hacia el jardín.",
    destacado: "casa blanca",
    cover: "/media/el-canton/ca-frente-poster.jpg",
    videoPrincipal: primerVideo(caMedios),
    medios: caMedios,
  },
  {
    slug: "casa-los-castores",
    nombre: "Casa Los Castores",
    estado: "En obra",
    ubicacion: "Los Castores, Nordelta",
    zona: "Nordelta",
    tipo: "Vivienda",
    sistema: "Steel Frame, Steel Deck y losa",
    descripcionCorta:
      "Tres pisos con vista al lago en Steel Frame, Steel Deck y losa. Totalmente aislada.",
    descripcionLarga:
      "Tres pisos con vista al lago en Steel Frame, Steel Deck y losa. Totalmente aislada.",
    destacado: "Totalmente aislada.",
    cover: "/media/los-castores/cs-frente-poster.jpg",
    videoPrincipal: primerVideo(csMedios),
    medios: csMedios,
  },
  {
    slug: "casa-las-vizcachas",
    nombre: "Casa Las Vizcachas",
    estado: "Obra nueva",
    ubicacion: "Las Vizcachas, Cardales",
    zona: "Cardales",
    tipo: "Casa de campo",
    descripcionCorta:
      "Casa de campo para recibir a toda la familia, orientada para que la pileta y el estar tengan sol de tarde.",
    descripcionLarga:
      "Casa de campo para recibir a toda la familia, orientada para que la pileta y el estar tengan sol de tarde.",
    destacado: "toda la familia",
    cover: "/media/las-vizcachas/vz-dron-poster.jpg",
    videoPrincipal: primerVideo(vzMedios),
    medios: vzMedios,
  },
  {
    slug: "reset-cafe",
    nombre: "RESET Café",
    estado: "Comercial",
    ubicacion: "Sobre la Panamericana",
    zona: "Panamericana",
    tipo: "Local comercial",
    descripcionCorta:
      "Remodelación comercial que se hace notar desde la Panamericana. Una buena remodelación también vende.",
    descripcionLarga:
      "Remodelación comercial que se hace notar desde la Panamericana. Una buena remodelación también vende.",
    destacado: "también vende.",
    cover: "/media/reset-cafe/rs-salon-poster.jpg",
    videoPrincipal: primerVideo(rsMedios),
    medios: rsMedios,
  },
];

export const getObra = (slug: string) => obras.find((o) => o.slug === slug);

/** Siguiente obra en el orden del índice (la última vuelve a la primera). */
export const getSiguienteObra = (slug: string) => {
  const i = obras.findIndex((o) => o.slug === slug);
  return obras[(i + 1) % obras.length];
};

/** Nombre del view-transition compartido entre la miniatura de una obra y su portada. */
export const obraTransitionName = (slug: string) => `obra-${slug}`;

/** Selección curada para la sección destacada de la Home. */
export const destacadaPuertosVistas: Medio[] = [
  "pv-pileta",
  "pv-foto-7930.webp",
  "pv-cocina",
  "pv-escalera2",
  "pv-foto-7939.webp",
  "pv-galeria",
  "pv-lago",
  "pv-fachada",
].map((n) => pvMedios.find((m) => m.src.includes(`/${n}`))!);
