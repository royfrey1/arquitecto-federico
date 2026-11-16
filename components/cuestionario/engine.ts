/*
  Motor del cuestionario "Diseñá tu proyecto".

  Port 1:1 de la lógica del cuestionario original (cuestionario.html): mismos pasos, preguntas,
  opciones, textos, condiciones según tipo y alcance, resumen, validaciones y armado del
  mensaje de WhatsApp. Lo que cambia es solo la "piel" y la accesibilidad:
  - Clases CSS del sistema nuevo (ver cuestionario.css; se conservan los nombres originales).
  - Cada pregunta es un grupo con nombre accesible (role="group" + aria-labelledby) y los
    campos de texto tienen <label for>. Las muestras de color son decorativas (aria-hidden).
  - Al cambiar de paso: transición GSAP (sin animación con reduced-motion), scroll arriba
    (respetando Lenis) y foco en el título del paso.
  - "Volver al inicio" apunta a "/" y el bosquejo 3D se conecta por callbacks (no globals).
*/
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

export type Answers = Record<string, string>;

type Question = { k: string; l: string; h: string; hint?: string; r?: number };
type Step = { t: string; h: string; l: string; q?: Question[]; final?: boolean };

export type EngineEls = {
  form: HTMLFormElement;
  stepLbl: HTMLElement;
  pbar: HTMLElement;
};

export type EngineHooks = {
  /** Se llama cada vez que cambian las respuestas o el paso (bosquejo 3D). */
  onUpdate?: () => void;
  /** Abre WhatsApp (inyectable para pruebas). */
  openUrl?: (url: string) => void;
};

const WA = "5491157130540";

const chips = (name: string, list: string[], multi?: boolean) =>
  `<div class="opts" role="${multi ? "group" : "radiogroup"}">${list
    .map(
      (o) =>
        `<label class="opt"><input type="${multi ? "checkbox" : "radio"}" name="${name}" value="${o}"><span>${o}</span></label>`,
    )
    .join("")}</div>`;
const styles = [
  ["Contemporánea", "Líneas rectas, grandes aperturas, mucho vidrio.", "#E8E2D6,#2B2B2B,#8A9A8E"],
  ["Minimalista", "Volúmenes puros, pocos materiales, mucha luz.", "#F4F1EA,#CFC8BA,#4A4A4A"],
  ["Española / Mediterránea", "Techos de teja, arcos, revoques texturados.", "#E9DCC4,#B5683F,#3E5C4A"],
  ["Campo / Rústica", "Madera, piedra, galerías profundas.", "#C9B79A,#6B4F36,#556B4E"],
  ["Moderna con steel frame", "Estructura liviana, voladizos, rapidez de obra.", "#DADDDE,#1F2A2A,#B88B4A"],
  ["Todavía no sé", "Lo vemos juntos con ejemplos.", "#EAE1CF,#D6CAB2,#1E4C4C"],
];
const pal = [
  ["Blancos y madera clara", "#F4F1EA,#D8C3A0,#8C7355"],
  ["Grises y negro", "#E3E3E1,#8A8A88,#222222"],
  ["Tierras y terracota", "#E9DCC4,#C0764B,#6B4F36"],
  ["Verdes y madera oscura", "#C9D2BE,#556B4E,#3A2C20"],
  ["Azules y arena", "#EFE6D2,#8FA8B8,#2F4A5E"],
  ["Que me sugiera Fede", "#EAE1CF,#D6CAB2,#1E4C4C"],
];
const sw = (c: string) =>
  `<div class="sw" aria-hidden="true">${c
    .split(",")
    .map((x) => `<i style="background:${x}"></i>`)
    .join("")}</div>`;
function PALV(): Question {
  return {
    k: "paleta",
    l: "Paleta cromática",
    h: `<div class="cards">${pal
      .map(
        (p) =>
          `<label class="opt card"><input type="radio" name="paleta" value="${p[0]}"><span>${sw(p[1])}<b style="font-size:17px">${p[0]}</b></span></label>`,
      )
      .join("")}</div>`,
  };
}
const card = (name: string, list: string[][]) =>
  `<div class="cards">${list
    .map(
      (o) =>
        `<label class="opt card"><input type="radio" name="${name}" value="${o[0]}"><span><b>${o[0]}</b><em>${o[1]}</em></span></label>`,
    )
    .join("")}</div>`;
const STEP0: Step = {
  t: "Tu proyecto",
  h: "¿Qué <em>proyecto</em> tenés en mente?",
  l: "Con esto armo las preguntas justas para tu caso. Son dos respuestas y arrancamos.",
  q: [
    {
      k: "tipo",
      l: "¿Qué proyecto necesitás?",
      h: card("tipo", [
        ["Vivienda", "Casa para vivir o de fin de semana."],
        ["Local comercial", "Café, tienda, consultorio, oficina o showroom."],
        ["Edificio", "Viviendas en altura, para vender, rentar o vivir."],
      ]),
    },
    {
      k: "alcance",
      l: "¿Qué necesitás hacer?",
      h: card("alcance", [
        ["Obra nueva", "Construir desde cero."],
        ["Reforma", "Remodelar o ampliar algo que ya existe."],
        ["Solo el render", "Ver cómo quedaría antes de decidir."],
      ]),
    },
  ],
};
const VIVREF: Step[] = [
  {
    t: "La casa hoy",
    h: "Contame cómo es <em>tu casa hoy</em>.",
    l: "Para reformar bien, primero hay que entender lo que ya existe.",
    q: [
      { k: "reforma", l: "¿Qué querés reformar?", hint: "Elegí todo lo que corresponda.", h: chips("reforma", ["Cocina", "Baños", "Dormitorios", "Living-comedor", "Ampliación", "Fachada", "Toda la casa"], true) },
      { k: "casa_m2", l: "¿Cuántos m² tiene la casa hoy?", h: chips("casa_m2", ["Hasta 100", "100–200", "200–300", "Más de 300", "No sé"]) },
      { k: "casa_pisos", l: "¿Cuántas plantas tiene?", h: chips("casa_pisos", ["Una planta", "Dos plantas"]) },
      { k: "casa_antig", l: "¿Qué antigüedad tiene?", h: chips("casa_antig", ["Menos de 10 años", "10 a 30 años", "30 a 50 años", "Más de 50 años", "No sé"]) },
      { k: "casa_techo", l: "¿Cómo es el techo actual?", h: chips("casa_techo", ["Teja a dos aguas", "Teja a cuatro aguas", "Losa plana", "Chapa"]) },
      { k: "habitada", l: "¿Van a vivir en la casa durante la obra?", h: chips("habitada", ["Sí", "No", "No sé"]) },
    ],
  },
  {
    t: "Qué cambia",
    h: "Lo que <em>no te gusta</em> y lo que falta.",
    l: "Contame qué te molesta hoy. Ahí está la reforma.",
    q: [
      { k: "problemas", l: "¿Qué te molesta de la casa hoy?", hint: "Elegí todo lo que corresponda.", h: chips("problemas", ["Poca luz", "Ambientes chicos", "Cocina cerrada", "Baños viejos", "Humedad", "Falta un dormitorio", "Fachada antigua", "Poca conexión con el jardín"], true) },
      { k: "ampliacion", l: "Si ampliás, ¿qué sumarías?", h: chips("ampliacion", ["No amplío", "Un dormitorio", "Un ambiente social", "Una planta alta", "Quincho o galería"]) },
      { k: "objetivo", l: "¿Qué buscás con la reforma?", h: chips("objetivo", ["Más espacio", "Más luz", "Modernizarla", "Revalorizarla para vender"]) },
      { k: "personas", l: "¿Cuántas personas viven en la casa?", h: chips("personas", ["1", "2", "3", "4", "5", "6 o más"]) },
    ],
  },
  {
    t: "Estilo de la reforma",
    h: "Cómo <em>querés que quede</em>.",
    l: "Elegí lo que más te represente. No hay respuestas incorrectas.",
    q: [
      { k: "estilo", l: "Estilo", h: `<div class="cards">${styles.map((s) => `<label class="opt card"><input type="radio" name="estilo" value="${s[0]}"><span>${sw(s[2])}<b>${s[0]}</b><em>${s[1]}</em></span></label>`).join("")}</div>` },
      { k: "fachada", l: "Material de la fachada nueva", h: chips("fachada", ["Mantener la actual", "Revoque blanco", "Ladrillo visto", "Madera", "Piedra", "Hormigón visto", "Metal / vidrio"]) },
      PALV(),
      { k: "ref", l: "¿Una reforma que te guste? Pegá un link o describila", h: `<textarea name="ref" placeholder="Opcional"></textarea>` },
    ],
  },
];
const VIV: Step[] = [
  {
    t: "Tu familia",
    h: "Empecemos por <em>quiénes</em> van a vivir ahí.",
    l: "Una casa se diseña desde las personas. Contame cómo es tu día a día.",
    q: [
      { k: "personas", l: "¿Cuántas personas van a vivir en la casa?", r: 1, h: `<div class="opts">${["1", "2", "3", "4", "5", "6 o más"].map((o) => `<label class="opt"><input type="radio" name="personas" value="${o}"><span>${o}</span></label>`).join("")}</div>` },
      { k: "chicos", l: "¿Hay chicos o planean tenerlos?", h: chips("chicos", ["No", "Sí, de 0 a 5 años", "Sí, de 6 a 12", "Sí, adolescentes", "Lo estamos pensando"], true) },
      { k: "mascotas", l: "¿Tienen mascotas?", h: chips("mascotas", ["No", "Perro/s chico/s", "Perro/s grande/s", "Gato/s", "Otras"], true) },
      { k: "movilidad", l: "¿Alguien tiene movilidad reducida o va a necesitar accesibilidad en el futuro?", hint: "Nos ayuda a decidir escaleras, rampas, anchos de paso y baños.", h: chips("movilidad", ["No", "Sí, hoy", "Posiblemente a futuro (adultos mayores)"]) },
      { k: "visitas", l: "¿Reciben visitas que se queden a dormir?", h: chips("visitas", ["Casi nunca", "Algunas veces al año", "Seguido", "Vive alguien más con frecuencia"]) },
    ],
  },
  {
    t: "Tu día a día",
    h: "Cómo <em>vivís</em> la casa.",
    l: "Estos detalles definen los espacios que realmente vas a usar.",
    q: [
      { k: "asado", l: "¿Comen asado seguido?", h: chips("asado", ["Todos los fines de semana", "De vez en cuando", "Casi nunca"]) },
      { k: "quincho", l: "¿Cómo imaginás el espacio del asado?", h: chips("quincho", ["Parrilla integrada a la galería", "Quincho separado", "Parrilla en el living-comedor", "No necesito"]) },
      { k: "lavadero", l: "¿Lavan la ropa en la casa? ¿Dónde?", h: chips("lavadero", ["Lavadero cerrado", "Lavadero junto a la cocina", "Lavadero en planta alta", "Servicio de lavandería"]) },
      { k: "cocina", l: "La cocina es…", h: chips("cocina", ["Abierta al living", "Cerrada con isla", "Cocina + cocina de servicio", "Pequeña y práctica"]) },
      { k: "oficina", l: "¿Trabajan desde casa?", h: chips("oficina", ["No", "Sí, 1 persona", "Sí, 2 personas", "Necesito un estudio aparte"]) },
      { k: "extras", l: "¿Qué más te gustaría tener?", hint: "Elegí todo lo que sume.", h: chips("extras", ["Pileta", "Gimnasio", "Sala de cine", "Playroom", "Bodega", "Huerta", "Cochera cubierta", "Panel solar", "Domótica"], true) },
    ],
  },
  {
    t: "El terreno",
    h: "Contame del <em>lote</em>.",
    l: "Si todavía no tenés terreno, no pasa nada: contame qué estás buscando.",
    q: [
      { k: "lote_estado", l: "¿Ya tenés el terreno?", h: chips("lote_estado", ["Sí, ya lo tengo", "Lo estoy buscando", "Tengo uno en mente"]) },
      { k: "zona", l: "¿En qué zona?", h: `<input type="text" name="zona" placeholder="Ej: Nordelta, Escobar, Pilar, Cardales, CABA…" autocomplete="off">` },
      { k: "m2lote", l: "¿Cuántos m² tiene aproximadamente?", h: `<input type="number" name="m2lote" inputmode="numeric" min="0" placeholder="Ej: 800">` },
      { k: "desnivel", l: "¿Cómo es el terreno?", h: chips("desnivel", ["Plano", "Con desnivel", "Con pendiente fuerte", "No sé"]) },
      { k: "vista", l: "¿Qué hay alrededor?", h: chips("vista", ["Frente a laguna o agua", "Vista al verde", "Calle y vecinos", "Esquina", "Aún no sé"], true) },
      { k: "orientacion", l: "¿Sabés hacia dónde mira el frente?", h: chips("orientacion", ["Norte", "Sur", "Este", "Oeste", "No sé"]) },
    ],
  },
  {
    t: "Tus espacios",
    h: "La casa <em>por dentro</em>.",
    l: "Armamos el programa: cuánto necesitás y cómo se reparte.",
    q: [
      { k: "pisos", l: "¿Una planta o dos?", h: chips("pisos", ["Una planta", "Dos plantas", "Tres plantas (por desnivel o vista)", "Que me aconsejen"]) },
      { k: "dorm", l: "¿Cuántos dormitorios?", h: chips("dorm", ["1", "2", "3", "4", "5 o más"]) },
      { k: "suite", l: "¿Cuántas en suite?", h: chips("suite", ["Solo la principal", "2", "Todas", "No necesito"]) },
      { k: "m2casa", l: "¿Cuántos m² cubiertos te imaginás?", h: chips("m2casa", ["Hasta 150", "150–250", "250–350", "350–500", "Más de 500", "No sé"]) },
      { k: "living", l: "Los ambientes sociales…", h: chips("living", ["Todo integrado", "Separados", "Doble altura", "Muy conectados al jardín"]) },
    ],
  },
  {
    t: "Estilo y materiales",
    h: "Cómo <em>se ve</em> tu casa.",
    l: "Elegí lo que más te represente. No hay respuestas incorrectas.",
    q: [
      { k: "estilo", l: "Estilo de casa", h: `<div class="cards">${styles.map((s) => `<label class="opt card"><input type="radio" name="estilo" value="${s[0]}"><span>${sw(s[2])}<b>${s[0]}</b><em>${s[1]}</em></span></label>`).join("")}</div>` },
      { k: "techo", l: "Techo", h: chips("techo", ["Teja a dos aguas", "Teja a cuatro aguas", "Techo plano / losa", "Chapa", "Que me aconsejen"]) },
      { k: "fachada", l: "Material principal de fachada", h: chips("fachada", ["Ladrillo visto", "Revoque blanco", "Madera", "Piedra", "Hormigón visto", "Metal / vidrio"]) },
      { k: "paleta", l: "Paleta cromática", h: `<div class="cards">${pal.map((p) => `<label class="opt card"><input type="radio" name="paleta" value="${p[0]}"><span>${sw(p[1])}<b style="font-size:17px">${p[0]}</b></span></label>`).join("")}</div>` },
      { k: "ref", l: "¿Una casa que te guste? Pegá un link o describila", hint: "Pinterest, Instagram, una obra de Fede…", h: `<textarea name="ref" placeholder="Opcional"></textarea>` },
    ],
  },
];
const REF: Record<string, Question> = {
  Vivienda: { k: "reforma", l: "¿Qué querés reformar?", hint: "Elegí todo lo que corresponda.", h: chips("reforma", ["Cocina", "Baños", "Dormitorios", "Ampliación", "Fachada", "Toda la casa"], true) },
  "Local comercial": { k: "reforma_l", l: "¿Qué hay que reformar del local?", hint: "Elegí todo lo que corresponda.", h: chips("reforma_l", ["Fachada y vidriera", "Interior completo", "Baños", "Cocina o barra", "Instalaciones"], true) },
  Edificio: { k: "reforma_e", l: "¿Qué parte del edificio querés reformar?", hint: "Elegí todo lo que corresponda.", h: chips("reforma_e", ["Fachada", "Hall de entrada", "Unidades", "Amenities", "Terraza"], true) },
};
const estLoc = [
  ["Industrial", "Hierro, ladrillo, hormigón y luz cálida.", "#4A4A48,#B5683F,#D9D2C0"],
  ["Nórdico / madera clara", "Blancos, madera clara y plantas.", "#F1EDE4,#C9A877,#58734F"],
  ["Moderno minimalista", "Pocos elementos, líneas limpias.", "#F4F1EA,#CFC8BA,#2B2B2B"],
  ["Cálido / rústico", "Madera oscura, texturas y tonos tierra.", "#D9C3A0,#6B4F36,#A9553B"],
  ["De diseño / llamativo", "Colores de marca y piezas que se recuerdan.", "#1E4C4C,#E0A33B,#F2EBDD"],
  ["Todavía no sé", "Lo vemos juntos con ejemplos.", "#EAE1CF,#D6CAB2,#1E4C4C"],
];
const PAL: Question = {
  k: "paleta",
  l: "Paleta cromática",
  h: `<div class="cards">${pal.map((p) => `<label class="opt card"><input type="radio" name="paleta" value="${p[0]}"><span>${sw(p[1])}<b style="font-size:17px">${p[0]}</b></span></label>`).join("")}</div>`,
};
const LOC: Step[] = [
  {
    t: "El negocio",
    h: "Contame de tu <em>negocio</em>.",
    l: "Un local se diseña para vender. Empecemos por qué hacés y a quién atendés.",
    q: [
      { k: "rubro", l: "¿Qué rubro es?", h: chips("rubro", ["Café o gastronomía", "Indumentaria o tienda", "Estética o salud", "Oficina o estudio", "Showroom", "Otro"]) },
      { k: "local_m2", l: "¿Cuántos m² tiene el local?", h: chips("local_m2", ["Hasta 50", "50–100", "100–200", "200–400", "Más de 400"]) },
      { k: "ubicacion", l: "¿Dónde está?", h: chips("ubicacion", ["A la calle", "En esquina", "En galería o shopping", "Sobre ruta o avenida"]) },
      { k: "local_pisos", l: "¿Cuántos niveles?", h: chips("local_pisos", ["Planta baja", "PB + entrepiso", "Dos plantas"]) },
      { k: "publico", l: "¿Cuánta gente atendés a la vez?", h: chips("publico", ["Hasta 10 personas", "10 a 30", "30 a 80", "Más de 80"]) },
    ],
  },
  {
    t: "El espacio",
    h: "Cómo <em>funciona</em> el local.",
    l: "Lo que pasa adentro define la planta y la vidriera.",
    q: [
      { k: "vidriera", l: "¿Qué vidriera te imaginás?", h: chips("vidriera", ["Vidriera de piso a techo", "Vidriera mediana", "Casi sin vidriera"]) },
      { k: "atencion", l: "¿Cómo atendés?", h: chips("atencion", ["Mostrador", "Salón con mesas", "Góndolas o percheros", "Boxes o consultorios", "Escritorios"]) },
      { k: "local_extras", l: "¿Qué más necesita el local?", hint: "Elegí todo lo que sume.", h: chips("local_extras", ["Baño para clientes", "Cocina o barra", "Depósito", "Probadores", "Terraza o deck", "Rampa de accesibilidad", "Toldo"], true) },
      { k: "cartel", l: "¿Qué cartel querés en la fachada?", h: chips("cartel", ["Cartel luminoso", "Letras corpóreas", "Cartel pintado", "Todavía no sé"]) },
    ],
  },
  {
    t: "Imagen y marca",
    h: "Cómo <em>se ve</em> desde la vereda.",
    l: "La fachada es tu primer vendedor. Elegí lo que mejor represente tu marca.",
    q: [
      { k: "local_estilo", l: "Estilo del local", h: `<div class="cards">${estLoc.map((s) => `<label class="opt card"><input type="radio" name="local_estilo" value="${s[0]}"><span>${sw(s[2])}<b>${s[0]}</b><em>${s[1]}</em></span></label>`).join("")}</div>` },
      { k: "fachada_l", l: "Material principal de fachada", h: chips("fachada_l", ["Vidrio y metal", "Madera", "Ladrillo", "Revoque pintado", "Chapa o metal"]) },
      PAL,
      { k: "marca", l: "¿Tu marca tiene colores o logo? Contame", h: `<input type="text" name="marca" placeholder="Opcional. Ej: verde y blanco, logo con una taza…" autocomplete="off">` },
      { k: "ref", l: "¿Un local que te guste? Pegá un link o describilo", hint: "Pinterest, Instagram, RESET Café…", h: `<textarea name="ref" placeholder="Opcional"></textarea>` },
    ],
  },
];
const EDI: Step[] = [
  {
    t: "El edificio",
    h: "Contame del <em>edificio</em>.",
    l: "Primero la escala: cuántos pisos, cuántas unidades y para qué.",
    q: [
      { k: "destino", l: "¿Para qué es el edificio?", h: chips("destino", ["Venta de unidades", "Renta", "Uso propio o familiar", "Mixto"]) },
      { k: "ed_pisos", l: "¿Cuántos pisos?", h: chips("ed_pisos", ["PB + 2", "PB + 3 a 5", "PB + 6 a 10", "Más de 10"]) },
      { k: "ed_unidades", l: "¿Cuántas unidades por piso?", h: chips("ed_unidades", ["1", "2", "3 a 4", "5 o más"]) },
      { k: "ed_tipologia", l: "¿Qué unidades querés?", hint: "Elegí todas las que sumen.", h: chips("ed_tipologia", ["Monoambientes", "2 ambientes", "3 ambientes", "4 o más", "Dúplex en el último piso"], true) },
      { k: "ed_pb", l: "¿Qué va en planta baja?", h: chips("ed_pb", ["Hall y cocheras", "Local comercial", "Unidades"]) },
    ],
  },
  {
    t: "El terreno",
    h: "Contame del <em>lote</em>.",
    l: "Si todavía no tenés terreno, contame qué estás buscando.",
    q: [
      { k: "zona", l: "¿En qué zona?", h: `<input type="text" name="zona" placeholder="Ej: CABA, Pilar, Escobar…" autocomplete="off">` },
      { k: "m2lote", l: "¿Cuántos m² tiene el lote?", h: `<input type="number" name="m2lote" inputmode="numeric" min="0" placeholder="Ej: 600">` },
      { k: "ed_frente", l: "¿Cómo es el lote?", h: chips("ed_frente", ["Entre medianeras", "Esquina", "Lote libre en barrio"]) },
      { k: "ed_cocheras", l: "¿Dónde van las cocheras?", h: chips("ed_cocheras", ["Subsuelo", "Planta baja", "No necesita"]) },
    ],
  },
  {
    t: "Amenities",
    h: "Lo que <em>suma valor</em>.",
    l: "Los amenities venden y alquilan. Elegí los que imaginás.",
    q: [
      { k: "amenities", l: "¿Qué amenities querés?", hint: "Elegí todos los que sumen.", h: chips("amenities", ["Pileta en terraza", "SUM", "Parrilla", "Gimnasio", "Solarium", "Laundry", "Coworking", "Bicicletero"], true) },
    ],
  },
  {
    t: "Estilo y fachada",
    h: "Cómo <em>se ve</em> el edificio.",
    l: "Elegí lo que más te represente. No hay respuestas incorrectas.",
    q: [
      { k: "ed_fachada", l: "Material principal de fachada", h: chips("ed_fachada", ["Hormigón visto", "Ladrillo visto", "Revoque blanco", "Vidrio y metal", "Mixto con madera"]) },
      { k: "ed_balcones", l: "Balcones", h: chips("ed_balcones", ["Balcones corridos", "Balcones aislados", "Ventanales sin balcón", "Galerías con vegetación"]) },
      PAL,
      { k: "ref", l: "¿Un edificio que te guste? Pegá un link o describilo", h: `<textarea name="ref" placeholder="Opcional"></textarea>` },
    ],
  },
];
const FINAL: Step = {
  t: "Tu render",
  h: "Último paso: <em>¿a dónde te lo mando?</em>",
  l: "El bosquejo de al lado es solo una guía para vos. Federico recibe tus respuestas y te manda el render conceptual por WhatsApp. Después coordinan una llamada para ajustarlo juntos.",
  final: true,
};
const labels: Record<string, string> = {
  casa_m2: "m² actuales", casa_pisos: "Plantas actuales", casa_antig: "Antigüedad", casa_techo: "Techo actual", habitada: "Viven durante la obra", problemas: "Le molesta", ampliacion: "Ampliación", objetivo: "Objetivo",
  tipo: "Proyecto", alcance: "Alcance", reforma: "A reformar", reforma_l: "A reformar", reforma_e: "A reformar", rubro: "Rubro", local_m2: "m² del local", ubicacion: "Ubicación", local_pisos: "Niveles", publico: "Gente a la vez",
  vidriera: "Vidriera", atencion: "Atención", local_extras: "Necesita", cartel: "Cartel", local_estilo: "Estilo", fachada_l: "Fachada", marca: "Marca", destino: "Destino", ed_pisos: "Pisos", ed_unidades: "Unidades por piso",
  ed_tipologia: "Tipologías", ed_pb: "Planta baja", ed_frente: "Lote", ed_cocheras: "Cocheras", amenities: "Amenities", ed_fachada: "Fachada", ed_balcones: "Balcones", abierto: "Abierto durante la obra", personas: "Personas",
  chicos: "Chicos", mascotas: "Mascotas", movilidad: "Movilidad reducida", visitas: "Visitas", asado: "Asado", quincho: "Espacio asado", lavadero: "Lavadero", cocina: "Cocina", oficina: "Home office", extras: "Extras",
  lote_estado: "Terreno", zona: "Zona", m2lote: "m² del lote", desnivel: "Relieve", vista: "Entorno", orientacion: "Orientación", pisos: "Plantas", dorm: "Dormitorios", suite: "Suites", m2casa: "m² cubiertos",
  living: "Ambientes sociales", estilo: "Estilo", techo: "Techo", fachada: "Fachada", paleta: "Paleta", ref: "Referencia", inicio: "Inicio", servicio: "Servicio", presu: "Presupuesto", nota: "Comentario",
};

/** Intro (paso -1). Se exporta para renderizarla desde el servidor en Cuestionario.tsx. */
export const INTRO_HTML = `<div class="eyebrow">Gratis · 5 minutos</div><h1 tabindex="-1">Diseñá tu <em>proyecto.</em></h1>
 <p class="lead">Casa, local o edificio: respondé unas preguntas y, mientras tanto, al costado se va armando un bosquejo 3D de tu proyecto. Cuando terminás, Federico revisa tus respuestas y te manda tu render. Sin costo y sin compromiso.</p>
 <div class="sum"><dl><dt>1</dt><dd>Completás el cuestionario (pasos cortos, según tu proyecto)</dd><dt>2</dt><dd>Federico arma tu render conceptual</dd><dt>3</dt><dd>Federico lo revisa y te lo manda por WhatsApp</dd><dt>4</dt><dd>Lo ajustamos juntos en una llamada</dd></dl></div>
 <div class="nav"><span></span><button type="button" class="btn p" id="go">Empezar</button></div>
 <p class="note">El bosquejo y el render son conceptuales: sirven para explorar ideas, no son un proyecto de arquitectura. El proyecto detallado se define después, en la llamada.</p>`;

const EXCL = ["No", "Aún no sé"];
const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Arma el mensaje y la URL de WhatsApp exactamente como el original (exportado para pruebas). */
export function buildWhatsApp(S: Answers, keys: Set<string>) {
  let m = "Hola Federico, soy " + S.nombre + ". Completé el cuestionario para mi render.\n\n";
  Object.keys(labels).forEach((k) => {
    if (S[k] && keys.has(k)) m += "• " + labels[k] + ": " + S[k] + "\n";
  });
  m += "\nMi WhatsApp: " + S.tel + "\nMi mail: " + S.email;
  m += "\n\n¿Cuándo podemos coordinar la llamada?";
  return { message: m, url: "https://wa.me/" + WA + "?text=" + encodeURIComponent(m) };
}

/** Pregunta con piel accesible: grupo con nombre, o <label for> si es un campo de texto. */
function renderQuestion(q: Question) {
  const field = /<(input type="(text|number)"|textarea)/.test(q.h);
  const hintId = q.hint ? ` aria-describedby="h_${q.k}"` : "";
  const hint = q.hint ? `<p class="hint" id="h_${q.k}">${q.hint}</p>` : "";
  if (field) {
    const h = q.h.replace(`name="${q.k}"`, `id="f_${q.k}" name="${q.k}"${hintId}`);
    return `<div class="q"><label class="lbl" id="l_${q.k}" for="f_${q.k}">${q.l}</label>${hint}${h}</div>`;
  }
  return `<div class="q" role="group" aria-labelledby="l_${q.k}"${hintId}><div class="lbl" id="l_${q.k}">${q.l}</div>${hint}${q.h}</div>`;
}

export function mountEngine(els: EngineEls, hooks: EngineHooks = {}) {
  const { form: f, stepLbl, pbar } = els;
  const S: Answers = {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openUrl = hooks.openUrl ?? ((url: string) => window.open(url, "_blank"));
  const upd = () => hooks.onUpdate?.();

  const TIEMPOS = (): Step => {
    const loc = (S.tipo || "").indexOf("Local") === 0,
      ref = S.alcance === "Reforma";
    const q: Question[] = [{ k: "inicio", l: "¿Cuándo querés empezar?", h: chips("inicio", ["Ya mismo", "En 3 a 6 meses", "En 6 a 12 meses", "Más adelante", "Estoy explorando"]) }];
    if (loc && ref) q.push({ k: "abierto", l: "¿El local tiene que seguir abierto durante la obra?", h: chips("abierto", ["Sí", "No", "No sé"]) });
    if (S.alcance !== "Solo el render")
      q.push({ k: "servicio", l: "¿Hasta dónde querés que me involucre?", h: chips("servicio", ["Solo anteproyecto", "Proyecto ejecutivo", "Proyecto y dirección de obra (llave en mano)", "Todavía no sé"]) });
    q.push(
      { k: "presu", l: "¿Tenés un presupuesto de referencia?", hint: "Opcional. Me ayuda a que el render sea realista.", h: chips("presu", ["Prefiero hablarlo en la llamada", "Tengo un número en mente", "Todavía no definí"]) },
      { k: "nota", l: "Algo que no te pregunté y quieras contarme", h: `<textarea name="nota" placeholder="Opcional"></textarea>` },
    );
    return { t: "Tiempos", h: "<em>Cuándo</em> y con qué escala.", l: "Esto es para orientarte con realismo. Nada de lo que respondas te compromete.", q };
  };
  function buildSteps(): Step[] {
    const t = S.tipo || "Vivienda";
    const vref = t === "Vivienda" && S.alcance === "Reforma";
    let body = t === "Local comercial" ? LOC : t === "Edificio" ? EDI : vref ? VIVREF : VIV;
    if (!vref) body = body.map((s, i) => (i === 0 && S.alcance === "Reforma" ? Object.assign({}, s, { q: [REF[t]].concat(s.q!) }) : s));
    return [STEP0].concat(body, [TIEMPOS(), FINAL]);
  }
  let steps = buildSteps();
  let cur = -1;

  const byId = <T extends HTMLElement = HTMLElement>(id: string) => f.querySelector<T>("#" + id)!;

  function collect() {
    const fd = new FormData(f);
    steps.forEach((s) =>
      (s.q || []).forEach((q) => {
        const v = fd.getAll(q.k).map(String).filter(Boolean);
        if (v.length) S[q.k] = v.join(", ");
        else if (f.querySelector('[name="' + q.k + '"]')) delete S[q.k];
      }),
    );
    ["nombre", "tel", "email"].forEach((k) => {
      const e = f.querySelector<HTMLInputElement>('[name="' + k + '"]');
      if (e) S[k] = e.value.trim();
    });
    upd();
  }
  function restore() {
    for (const k in S) {
      f.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[name="' + k + '"]').forEach((e) => {
        if (e instanceof HTMLInputElement && (e.type === "radio" || e.type === "checkbox")) e.checked = S[k].split(", ").includes(e.value);
        else e.value = S[k];
      });
    }
  }

  /** Transición entre pasos + scroll arriba + foco en el título. */
  function enter(focus: boolean) {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, reduce ? { immediate: true } : { duration: 0.9 });
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (focus) f.querySelector<HTMLElement>("h1, h2")?.focus({ preventScroll: true });
    if (reduce) return;
    gsap.fromTo(f.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.04, ease: "expo.out", clearProps: "transform,opacity,visibility" });
  }

  function intro(focus = false) {
    cur = -1;
    f.innerHTML = INTRO_HTML;
    byId("go").onclick = () => show(0);
    prog();
    if (focus) enter(true);
    // La primera intro ya viene renderizada desde el servidor (LCP rápido): sin fundido de entrada.
  }
  function prog() {
    setTimeout(upd, 0);
    const p = (cur + 1) / steps.length;
    pbar.style.transform = `scaleX(${cur < 0 ? 0 : p})`;
    stepLbl.textContent = cur < 0 ? "" : `Paso ${cur + 1} de ${steps.length} · ${steps[cur].t}`;
  }
  function show(i: number) {
    if (cur >= 0) collect();
    cur = i;
    const s = steps[i];
    let body = "";
    if (s.final) {
      body = `<div class="q row"><div><label for="nombre">Tu nombre</label><input id="nombre" type="text" name="nombre" autocomplete="name" placeholder="Nombre y apellido"></div>
  <div><label for="tel">Tu WhatsApp</label><input id="tel" type="tel" name="tel" autocomplete="tel" inputmode="tel" required placeholder="11 5555 5555"></div>
  <div><label for="email">Tu mail</label><input id="email" type="email" name="email" autocomplete="email" required placeholder="nombre@mail.com"></div></div>
  <div class="err" id="err" role="alert"></div>
  <div class="sum" id="sum"></div>
  <label class="check"><input type="checkbox" id="ok"> Acepto que Federico use estas respuestas para armar mi render y contactarme.</label>`;
    } else
      body =
        s.q!.map(renderQuestion).join("") +
        (i === 0 ? '<div class="err" id="err0" role="alert">Elegí el tipo de proyecto y qué necesitás hacer.</div>' : "");
    f.innerHTML = `<div class="step-n" aria-hidden="true">${steps.map((_, j) => `<i class="${j <= i ? "on" : ""}"></i>`).join("")}</div>
  <div class="eyebrow">${s.t}</div><h2 tabindex="-1">${s.h}</h2><p class="lead">${s.l}</p>${body}
  <div class="nav"><button type="button" class="btn s" id="back">Atrás</button>
  <button type="button" class="btn p" id="next">${s.final ? "Enviar y recibir mi render" : "Siguiente"}</button></div>
  <p class="note">${s.final ? "WhatsApp y mail son obligatorios para enviarte el render. Se abre WhatsApp con tus respuestas listas para enviar." : "Podés saltear lo que no sepas."}</p>`;
    restore();
    if (s.final) summary();
    byId("back").onclick = () => {
      collect();
      if (i === 0) intro(true);
      else show(i - 1);
    };
    byId("next").onclick = () => {
      if (i === 0) {
        collect();
        if (!S.tipo || !S.alcance) {
          byId("err0").style.display = "block";
          return;
        }
        steps = buildSteps();
      }
      if (s.final) send();
      else show(i + 1);
    };
    prog();
    enter(true);
  }
  function curKeys() {
    const ks = new Set(["tipo", "alcance"]);
    steps.forEach((s) => (s.q || []).forEach((q) => ks.add(q.k)));
    return ks;
  }
  function summary() {
    collect();
    const ck = curKeys();
    const rows = Object.keys(labels)
      .filter((k) => S[k] && ck.has(k))
      .map((k) => `<dt>${labels[k]}</dt><dd>${esc(S[k])}</dd>`)
      .join("");
    byId("sum").innerHTML = rows
      ? `<strong>Tu resumen</strong><dl style="margin-top:10px">${rows}</dl>`
      : "Todavía no completaste respuestas. Podés volver atrás o enviar igual.";
  }
  function send() {
    collect();
    const er = byId("err");
    const bad = (id: string, msg: string) => {
      er.textContent = msg;
      er.style.display = "block";
      byId(id).focus();
    };
    if (!S.nombre) return bad("nombre", "Falta tu nombre.");
    if ((S.tel || "").replace(/\D/g, "").length < 8) return bad("tel", "Necesito tu WhatsApp para mandarte el render.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email || "")) return bad("email", "Revisá tu mail: tiene que ser algo como nombre@mail.com.");
    er.style.display = "none";
    if (!byId<HTMLInputElement>("ok").checked) {
      byId("ok").focus();
      return;
    }
    const { url } = buildWhatsApp(S, curKeys());
    f.innerHTML = `<div class="eyebrow">Listo</div><h2 tabindex="-1">Gracias, <em>${esc(S.nombre.split(" ")[0])}.</em></h2>
 <p class="lead">Se abrió WhatsApp con tus respuestas. Mandá el mensaje y Federico te responde con tu render conceptual.</p>
 <div class="nav"><a class="btn p" href="${url}" target="_blank" rel="noopener">Abrir WhatsApp de nuevo</a><a class="btn s" href="/">Volver al inicio</a></div>`;
    pbar.style.transform = "scaleX(1)";
    enter(true);
    openUrl(url);
  }

  const onSubmit = (e: Event) => e.preventDefault();
  const onChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.type === "checkbox" && t.name) {
      const grp = [...f.querySelectorAll<HTMLInputElement>('input[name="' + t.name + '"]')];
      if (t.checked) {
        if (EXCL.includes(t.value))
          grp.forEach((g) => {
            if (g !== t) g.checked = false;
          });
        else
          grp.forEach((g) => {
            if (EXCL.includes(g.value)) g.checked = false;
          });
      }
    }
    collect();
    if (t.name === "tipo" || t.name === "alcance") {
      steps = buildSteps();
      const bars = f.querySelector(".step-n");
      if (bars) bars.innerHTML = steps.map((_, j) => `<i class="${j <= cur ? "on" : ""}"></i>`).join("");
      prog();
    }
  };
  f.addEventListener("submit", onSubmit);
  f.addEventListener("change", onChange);
  intro();

  return {
    /** Estado para el bosquejo 3D. */
    ctx: () => ({ S, cur, total: steps.length }),
    destroy() {
      f.removeEventListener("submit", onSubmit);
      f.removeEventListener("change", onChange);
      gsap.killTweensOf(f.children);
      f.innerHTML = "";
    },
  };
}
