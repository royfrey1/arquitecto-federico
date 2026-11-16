/*
  "Bosquejo en vivo": maqueta 3D que se arma con las respuestas del cuestionario.

  Port 1:1 del script original (three r128 incrustado en cuestionario.html) a three desde npm.
  La lógica de armado (build / buildLocal / buildEdificio / buildReforma), las etapas, las
  etiquetas y el giro con arrastre son los mismos. Cambios:
  - Solo la "piel": colores de líneas, volúmenes por defecto, entorno urbano, personas y
    acentos pasan a la paleta del sitio (constante K). Los colores que elige el usuario
    (paletas, fachadas, estilos, tejas) no cambian.
  - three moderno: se desactiva la gestión de color y se escalan las luces por π para
    reproducir el render "legacy" de r128 (mismo brillo y mismos tonos).
  - Accesibilidad / rendimiento: se gira también con las flechas del teclado, con
    reduced-motion no hay giro automático y el loop se pausa fuera de pantalla.
  Este módulo se carga con import() dinámico solo en /cuestionario.
*/
import * as THREE from "three";

export type Answers = Record<string, string>;
export type SketchContext = () => { S: Answers; cur: number; total: number };
export type SketchUi = { vst: HTMLElement; vtx: HTMLElement; vtg: HTMLElement };

/** Paleta del sitio para todo lo que no elige el usuario. */
const K = {
  linea: 0x1e4c4c, // petróleo: aristas
  dorado: "#A0823F",
  doradoHex: 0xa0823f,
  petroleo: "#1E4C4C",
  crema: "#F2EBDD",
  crema2: "#E6DED0",
  crema3: "#D8CFBE",
  carbon2: "#1F2A2A",
  calle: "#3A4444",
  vereda: "#E6DED0",
  manzana: "#CFC6B4",
  zocalo: "#4A5252",
  ventana: "#1F2A2A",
  ventanaVecino: "#2E3B3B",
  marco: "#141414",
};

export function createSketch(cv: HTMLCanvasElement, ui: SketchUi, ctx: SketchContext) {
  THREE.ColorManagement.enabled = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc4a8, 0.55 * Math.PI));
  const sun = new THREE.DirectionalLight(0xfff1d6, 0.6 * Math.PI);
  sun.position.set(5, 8, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 });
  scene.add(sun);
  const root = new THREE.Group();
  scene.add(root);

  let S: Answers = {};
  let G: THREE.Group | null = null;
  let rot = 0.6,
    auto = !reduce,
    drag = false,
    lx = 0,
    resume: ReturnType<typeof setTimeout> | undefined,
    tgtDist = 9.6;

  function size() {
    const w = cv.clientWidth,
      h = cv.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(size);
  ro.observe(cv);
  size();

  const resumeAuto = () => {
    clearTimeout(resume);
    if (!reduce) resume = setTimeout(() => (auto = true), 2500);
  };
  const onDown = (e: PointerEvent) => {
    drag = true;
    auto = false;
    lx = e.clientX;
    cv.setPointerCapture(e.pointerId);
    cv.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    rot += (e.clientX - lx) * 0.01;
    lx = e.clientX;
  };
  const up = () => {
    drag = false;
    cv.style.cursor = "grab";
    resumeAuto();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    auto = false;
    rot += e.key === "ArrowLeft" ? -0.15 : 0.15;
    resumeAuto();
  };
  cv.addEventListener("pointerdown", onDown);
  cv.addEventListener("pointermove", onMove);
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", up);
  cv.addEventListener("keydown", onKey);

  type MatOpts = THREE.MeshStandardMaterialParameters;
  const M = (c: THREE.ColorRepresentation, o?: MatOpts) =>
    new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85, metalness: 0 }, o || {}));
  function add<T extends THREE.Object3D>(mesh: T, x: number, y: number, z: number): T {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    G!.add(mesh);
    return mesh;
  }
  const box = (w: number, h: number, d: number, c: THREE.ColorRepresentation, x: number, y: number, z: number, o?: MatOpts) =>
    add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c, o)), x, y, z);
  function edges(m: THREE.Mesh) {
    const l = new THREE.LineSegments(
      new THREE.EdgesGeometry(m.geometry),
      new THREE.LineBasicMaterial({ color: K.linea, transparent: true, opacity: 0.55 }),
    );
    m.add(l);
  }
  const has = (k: string, v: string) => (S[k] || "").split(", ").includes(v);

  const palettes: Record<string, [string, string]> = {
    "Blancos y madera clara": ["#F1EDE4", "#C9A877"],
    "Grises y negro": ["#BFBFBC", "#2B2B2B"],
    "Tierras y terracota": ["#E3CCA8", "#B5683F"],
    "Verdes y madera oscura": ["#CBD3BF", "#5A4330"],
    "Azules y arena": ["#EFE6D2", "#5E7E92"],
  };
  const facade: Record<string, string> = {
    "Ladrillo visto": "#A9553B",
    "Revoque blanco": "#F4F1EA",
    Madera: "#A67C52",
    Piedra: "#A39C8E",
    "Hormigón visto": "#A5A6A3",
    "Metal / vidrio": "#8D969A",
  };
  const m2map: Record<string, number> = { "Hasta 150": 130, "150–250": 200, "250–350": 300, "350–500": 420, "Más de 500": 600 };
  const stageNames = [
    "Terreno y replanteo",
    "Cimientos",
    "Implantación en el lote",
    "Volúmenes y espacios",
    "Techo, color y materiales",
    "Obra casi lista",
    "Listo para revisión",
  ];

  function disposeGroup() {
    if (!G) return;
    root.remove(G);
    G.traverse((o) => {
      const g = (o as THREE.Mesh).geometry;
      if (g) g.dispose();
    });
  }

  function build(stage: number) {
    disposeGroup();
    G = new THREE.Group();
    root.add(G);
    const tags: string[] = [];
    const sel = (k: string) => (S[k] || "").split(", ").filter(Boolean);
    const ex = sel("extras");
    // orientación: dirección del frente y del norte
    const nv = ({ Norte: [0, 1], Sur: [0, -1], Este: [1, 0], Oeste: [-1, 0] } as Record<string, [number, number]>)[S.orientacion];
    if (nv) {
      sun.position.set(nv[0] * 8, 8, nv[1] * 8);
      tags.push("frente " + S.orientacion.toLowerCase());
    } else sun.position.set(5, 8, 4);
    // lote y relieve
    const m2l = parseFloat(S.m2lote) || 800,
      L = Math.max(2.2, Math.min(4.2, Math.sqrt(m2l) / 10));
    const slope = S.desnivel === "Con desnivel" ? 0.1 : S.desnivel === "Con pendiente fuerte" ? 0.22 : 0;
    const water = sel("vista").some((v) => v.indexOf("laguna") >= 0);
    const hy = (x: number, z: number) => {
      let y = -slope * z;
      if (water && z > 2.2) y -= 0.18;
      return y;
    };
    const gg = new THREE.PlaneGeometry(6, 6, 12, 12);
    gg.rotateX(-Math.PI / 2);
    const pos = gg.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, hy(pos.getX(i), pos.getZ(i)));
    gg.computeVertexNormals();
    const ground = new THREE.Mesh(gg, M("#B3BF93"));
    ground.receiveShadow = true;
    G.add(ground);
    (function () {
      const h = 3,
        N = 12,
        bot = -0.7,
        v: number[] = [];
      (
        [
          [[-h, -h], [h, -h]],
          [[h, -h], [h, h]],
          [[h, h], [-h, h]],
          [[-h, h], [-h, -h]],
        ] as [number, number][][]
      ).forEach(([a, b]) => {
        for (let i = 0; i < N; i++) {
          const p = [a[0] + ((b[0] - a[0]) * i) / N, a[1] + ((b[1] - a[1]) * i) / N],
            q = [a[0] + ((b[0] - a[0]) * (i + 1)) / N, a[1] + ((b[1] - a[1]) * (i + 1)) / N];
          v.push(
            p[0], hy(p[0], p[1]), p[1], q[0], hy(q[0], q[1]), q[1], q[0], bot, q[1],
            p[0], hy(p[0], p[1]), p[1], q[0], bot, q[1], p[0], bot, p[1],
          );
        }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      g.computeVertexNormals();
      G!.add(new THREE.Mesh(g, M("#8E7B5A", { side: THREE.DoubleSide })));
      const bt = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), M("#6E5F45"));
      bt.rotation.x = Math.PI / 2;
      bt.position.y = bot;
      G!.add(bt);
    })();
    const lot = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        [[-L / 2, -L / 2], [L / 2, -L / 2], [L / 2, L / 2], [-L / 2, L / 2]].map((a) => new THREE.Vector3(a[0], 0.01, a[1])),
      ),
      new THREE.LineBasicMaterial({ color: K.doradoHex }),
    );
    G.add(lot);
    if (S.m2lote) tags.push(S.m2lote + " m² lote");
    if (slope) tags.push(S.desnivel.toLowerCase());
    if (water) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 1.0), M("#6FA3B5", { transparent: true, opacity: 0.8, roughness: 0.2 }));
      w.position.set(0, -0.24 - slope * 2.6, 2.5);
      G.add(w);
      tags.push("frente al agua");
    }
    // flecha norte
    if (nv) {
      const a = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 3), M(K.dorado));
      a.position.set(nv[0] * 2.7, 0.12, nv[1] * 2.7);
      G.add(a);
      tags.push("norte marcado");
    }
    // entorno
    const vs = sel("vista");
    if (vs.includes("Calle y vecinos")) {
      box(6, 0.02, 0.5, K.calle, 0, 0.015, -2.75);
      [-2, -0.6, 1.1].forEach((x) => box(0.7, 0.35, 0.5, K.crema3, x, 0.2, -2.15));
      tags.push("calle y vecinos");
    }
    if (vs.includes("Esquina")) {
      box(0.5, 0.02, 6, K.calle, -2.75, 0.015, 0);
      tags.push("esquina");
    }
    // programa
    const floors = S.pisos === "Una planta" ? 1 : S.pisos === "Dos plantas" ? 2 : (S.pisos || "").indexOf("Tres") === 0 ? 3 : 1;
    const area = m2map[S.m2casa] || 250;
    const wm = Math.sqrt((area / floors) * 1.5),
      dm = area / floors / wm;
    const W = Math.min(wm / 10, L * 0.82),
      D = Math.min(dm / 10, L * 0.62);
    const fh = 0.3,
      est = S.estilo || "";
    const pal = palettes[S.paleta] || [K.crema, K.dorado];
    const fac = sel("fachada");
    const wall = (fac[0] && facade[fac[0]]) || pal[0];
    const accent = pal[1];
    const hx = 0,
      hz = -0.15 * L;
    const showBody = stage >= 3 || !!S.pisos || !!S.m2casa;
    const showRoof = showBody && (stage >= 4 || !!S.techo || !!S.estilo);
    const solid = showRoof || stage >= 4;
    const wo = { transparent: !solid, opacity: solid ? 1 : 0.55 };
    const wallCol = solid ? wall : K.crema2;
    // personas, chicos, mascotas
    const n = S.personas === "6 o más" ? 6 : parseInt(S.personas) || 0;
    for (let i = 0; i < n; i++) {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.26, 10), M(i % 2 ? K.petroleo : K.dorado));
      f.position.set(-L / 2 - 0.35 + (i % 3) * 0.18, 0.14, L / 2 - 0.2 - Math.floor(i / 3) * 0.2);
      f.castShadow = true;
      G.add(f);
    }
    if (n) tags.push(n + " pers.");
    const kids = sel("chicos").filter((k) => k.indexOf("Sí") === 0);
    kids.forEach((k, i) => {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 10), M("#E09A4B"));
      f.position.set(-L / 2 - 0.35 + i * 0.14, 0.08, L / 2 + 0.1);
      f.castShadow = true;
      G!.add(f);
    });
    if (kids.length) tags.push("chicos");
    const pets = sel("mascotas").filter((m) => m !== "No");
    pets.forEach((m, i) => {
      const big = m.indexOf("grande") >= 0,
        sm = big ? 1 : 0.7;
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.16 * sm, 0.08 * sm, 0.06 * sm), M(m.indexOf("Gato") === 0 ? "#9A9A9A" : "#6B4F36"));
      d.position.set(-L / 2 - 0.2 + i * 0.2, 0.05, L / 2 + 0.3);
      G!.add(d);
    });
    if (pets.length) tags.push("mascotas");
    // estacas si aún no hay cuerpo
    if (!showBody) {
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((c) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), M(K.dorado));
        p.position.set(hx + (c[0] * W) / 2, 0.15, hz + (c[1] * D) / 2);
        G!.add(p);
      });
    } else {
      box(W + 0.16, 0.04, D + 0.16, K.zocalo, hx, 0.02, hz);
    }
    // árboles
    {
      const tn = vs.includes("Vista al verde") ? 9 : 5;
      for (let i = 0; i < tn; i++) {
        const a = (i / tn) * Math.PI * 2 + 0.4,
          r = L * 0.62 + ((i * 37) % 5) * 0.06;
        const x = Math.cos(a) * r,
          z = Math.sin(a) * r;
        if (Math.abs(x) > 2.8 || Math.abs(z) > 2.8 || (z > 2 && water) || (vs.includes("Calle y vecinos") && z < -1.9)) continue;
        const h = 0.35 + ((i * 13) % 4) * 0.07,
          y = hy(x, z);
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, h * 0.5), M("#6B4F36")), x, y + h * 0.25, z);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.17, h, 8), M("#58734F")), x, y + h * 0.75, z);
      }
      if (vs.includes("Vista al verde")) tags.push("vista al verde");
    }
    // exteriores que aparecen apenas se eligen
    const galZ = hz + D / 2 + 0.22;
    const gal = (S.asado && S.asado !== "Casi nunca") || (S.quincho || "").indexOf("galería") >= 0 || ex.includes("Pileta");
    const gx = hx - W * 0.1;
    if (gal) {
      box(W * 0.55, 0.03, 0.44, "#B9A586", gx, 0.055, galZ);
      box(W * 0.55, 0.025, 0.5, accent, gx, 0.04 + fh * 0.78, galZ);
      [-0.27, 0.27].forEach((k) => box(0.025, fh * 0.74, 0.025, accent, gx + k * W, 0.04 + fh * 0.37, galZ + 0.2));
      tags.push("galería");
    }
    if (S.asado && S.asado !== "Casi nunca" && (S.quincho || "").indexOf("No necesito") < 0) {
      const q = S.quincho || "";
      if (q.indexOf("Quincho separado") < 0 && q.indexOf("living") < 0) {
        box(0.16, 0.09, 0.1, "#2B2B2B", gx + W * 0.2, 0.1, galZ);
        box(0.1, 0.02, 0.06, "#E0702B", gx + W * 0.2, 0.16, galZ, { emissive: 0x7a2a08 });
      }
      tags.push("parrilla");
    }
    if ((S.quincho || "").indexOf("Quincho separado") === 0) {
      box(0.5, fh * 0.7, 0.4, wallCol, hx - W / 2 - 0.55, 0.04 + fh * 0.35, hz - D * 0.2, wo);
      box(0.62, 0.03, 0.52, accent, hx - W / 2 - 0.55, 0.04 + fh * 0.7 + 0.015, hz - D * 0.2);
      tags.push("quincho");
    }
    if (ex.includes("Pileta")) {
      const px = hx + W * 0.28,
        pz = hz + D / 2 + 0.85;
      box(W * 0.45 + 0.1, 0.02, 0.65, "#E7DFCB", px, 0.02, pz);
      box(W * 0.45, 0.03, 0.55, "#5EB0C9", px, 0.03, pz, { roughness: 0.15, transparent: true, opacity: 0.9 });
      tags.push("pileta");
    }
    if (ex.includes("Huerta")) {
      box(0.5, 0.02, 0.3, "#7C9A57", hx - W / 2 - 0.3, 0.025, hz + D / 2 + 0.5);
      [0, 1, 2].forEach((i) => box(0.4, 0.03, 0.04, "#5E7A3E", hx - W / 2 - 0.3, 0.04, hz + D / 2 + 0.4 + i * 0.1));
      tags.push("huerta");
    }
    if (S.movilidad && S.movilidad !== "No") {
      const r = box(0.3, 0.02, 0.5, "#B9A586", hx + W * 0.32, 0.03, hz + D / 2 + 0.3);
      r.rotation.x = 0.12;
      tags.push("rampa de acceso");
    }
    const annex = ex.filter((x) => ["Gimnasio", "Sala de cine", "Playroom", "Bodega"].includes(x));
    if (annex.length) {
      const aw = 0.55 + annex.length * 0.1;
      box(aw, fh * 0.8, 0.5, wallCol, hx + W / 2 + aw / 2 - 0.05, 0.04 + fh * 0.4, hz - D / 2 - 0.3, wo);
      box(aw + 0.06, 0.03, 0.56, accent, hx + W / 2 + aw / 2 - 0.05, 0.04 + fh * 0.8 + 0.015, hz - D / 2 - 0.3);
      annex.forEach((a) => tags.push(a.toLowerCase()));
    }
    if (S.oficina === "Necesito un estudio aparte") {
      box(0.4, fh * 0.7, 0.4, wallCol, hx - W / 2 - 0.35, 0.04 + fh * 0.35, hz + D * 0.3, wo);
      box(0.46, 0.03, 0.46, accent, hx - W / 2 - 0.35, 0.04 + fh * 0.7 + 0.015, hz + D * 0.3);
      tags.push("estudio aparte");
    }
    if (S.visitas === "Seguido" || S.visitas === "Vive alguien más con frecuencia") {
      box(0.5, fh * 0.7, 0.4, wallCol, hx + W / 2 + 0.4, 0.04 + fh * 0.35, hz + D / 2 + 0.4, wo);
      box(0.56, 0.03, 0.46, accent, hx + W / 2 + 0.4, 0.04 + fh * 0.7 + 0.015, hz + D / 2 + 0.4);
      tags.push("cuarto de huéspedes");
    }
    if (ex.includes("Domótica")) tags.push("domótica");
    // textos de interiores
    ["lavadero", "cocina", "oficina", "living"].forEach((k) => {
      if (S[k] && !(k === "oficina" && S[k] === "Necesito un estudio aparte") && S[k] !== "No") tags.push(S[k].toLowerCase());
    });
    if (S.dorm) tags.push(S.dorm + " dorm.");
    if (S.suite && S.suite !== "No necesito") tags.push("suites: " + S.suite.toLowerCase());
    if (!showBody) return fin(tags, stage);
    // cuerpo de la casa
    const glaz = est === "Contemporánea" || fac.includes("Metal / vidrio") || S.living === "Muy conectados al jardín" ? 0.55 : 0.3;
    const off = est === "Contemporánea" || est === "Minimalista";
    for (let i = 0; i < floors; i++) {
      const sh = i > 0 && off ? 0.88 : 1;
      const cx = hx + (i > 0 ? (W * (1 - sh)) / 2 : 0);
      const col = i === 0 && fac[1] ? (solid ? facade[fac[1]] : K.crema2) : wallCol;
      const b = box(W * sh, fh - 0.01, D * sh, col, cx, 0.04 + fh / 2 + i * fh, hz, wo);
      edges(b);
      if (solid) {
        const k = Math.max(2, Math.round(W / 0.55)),
          ww = (W * sh * 0.8) / k;
        for (let j = 0; j < k; j++) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(ww * 0.7, fh * 0.55 * (1 + glaz)), M(K.ventana, { roughness: 0.2, metalness: 0.3 }));
          win.position.set(cx - W * sh * 0.4 + ww * (j + 0.5), 0.04 + fh * 0.55 + i * fh, hz + (D * sh) / 2 + 0.006);
          G.add(win);
        }
      }
    }
    if (solid) {
      if (fac[2]) box(W * 0.22, fh * 0.95, 0.025, facade[fac[2]], hx - W * 0.3, 0.04 + fh * 0.5, hz + D / 2 + 0.015, wo);
      if (fac[1] && floors > 1) box(W * 0.22, fh * 0.95, 0.025, facade[fac[1]], hx + W * 0.3, 0.04 + fh * 0.5, hz + D / 2 + 0.02, wo);
    }
    if (S.living === "Doble altura") {
      box(W * 0.3, floors * fh + 0.12, 0.03, K.ventana, hx + W * 0.12, 0.04 + (floors * fh + 0.12) / 2, hz + D / 2 + 0.03, { roughness: 0.2 });
      tags.push("doble altura");
    }
    tags.push(floors + (floors > 1 ? " plantas" : " planta"), area + " m²");
    if (has("extras", "Cochera cubierta")) {
      const gw = W * 0.38;
      box(gw, fh * 0.8, D * 0.6, wallCol, hx + W / 2 + gw / 2, 0.04 + fh * 0.4, hz + D * 0.1, wo);
      box(gw + 0.06, 0.03, D * 0.6 + 0.06, accent, hx + W / 2 + gw / 2, 0.04 + fh * 0.8 + 0.015, hz + D * 0.1);
      tags.push("cochera");
    }
    const top = 0.04 + floors * fh;
    // techo
    const rt = S.techo || "";
    let kind: "hip" | "gable" | "flat" | "chapa" | null =
      rt.indexOf("cuatro") >= 0 ? "hip" : rt.indexOf("dos aguas") >= 0 ? "gable" : rt.indexOf("plano") >= 0 ? "flat" : rt === "Chapa" ? "chapa" : null;
    if (!kind && showRoof) kind = est === "Española / Mediterránea" ? "hip" : est === "Campo / Rústica" ? "gable" : "flat";
    let rh = 0;
    const Wt = W * (floors > 1 && off ? 0.88 : 1),
      cxr = hx + (floors > 1 && off ? W * 0.06 : 0);
    if (kind && showRoof) {
      const tej = kind === "chapa" ? "#6F7478" : rt.indexOf("Teja") === 0 || est === "Española / Mediterránea" ? "#B5683F" : "#7A6A58";
      const o = 0.12;
      rh = Math.max(0.2, Math.min(0.42, W * 0.14));
      if (kind === "flat") {
        box(Wt + o * 2, 0.04, D + o * 2, accent, cxr, top + 0.02, hz);
      } else if (kind === "hip") {
        const c = new THREE.Mesh(new THREE.ConeGeometry(Math.SQRT1_2, rh, 4), M(tej));
        c.rotation.y = Math.PI / 4;
        c.scale.set(Wt + o * 2, 1, D + o * 2);
        add(c, cxr, top + rh / 2, hz);
      } else {
        const sh = new THREE.Shape();
        sh.moveTo(-(Wt / 2 + o), 0);
        sh.lineTo(Wt / 2 + o, 0);
        sh.lineTo(0, rh);
        sh.lineTo(-(Wt / 2 + o), 0);
        const gm = new THREE.ExtrudeGeometry(sh, { depth: D + o * 2, bevelEnabled: false });
        gm.translate(0, 0, -(D / 2 + o));
        add(new THREE.Mesh(gm, M(tej)), cxr, top, hz);
      }
      tags.push(kind === "flat" ? "techo plano" : kind === "chapa" ? "techo de chapa" : kind === "hip" ? "techo a cuatro aguas" : "techo a dos aguas");
    }
    if (ex.includes("Panel solar")) {
      const flat = !kind || kind === "flat" || !showRoof;
      const p = box(0.4, 0.015, 0.25, "#1B2B3A", cxr + (flat ? 0 : Wt * 0.18), flat ? top + 0.07 : top + rh * 0.55 + 0.02, hz + 0, { roughness: 0.3 });
      if (flat) p.rotation.x = -0.4;
      else p.rotation.z = -Math.atan2(rh, Wt / 2);
      tags.push("paneles solares");
    }
    if (est && est !== "Todavía no sé") tags.push(est.toLowerCase());
    if (S.paleta && S.paleta !== "Que me sugiera Fede") tags.push(S.paleta.toLowerCase());
    fac.forEach((f) => tags.push("fachada: " + f.toLowerCase()));
    return fin(tags, stage);
  }

  let stageLbl: string | null = null;
  function fin(tags: string[], stage: number) {
    const st = Math.max(0, Math.min(stage, 6));
    ui.vst.textContent = stageLbl || stageNames[st];
    stageLbl = null;
    ui.vtg.replaceChildren(
      ...[...new Set(tags)].slice(0, 24).map((t) => {
        const s = document.createElement("span");
        s.textContent = t;
        return s;
      }),
    );
    const { cur, total } = ctx();
    const last = cur >= total - 1;
    ui.vtx.textContent = last
      ? "Este bosquejo es solo una guía para vos. Federico arma tu render con tus respuestas."
      : "Arrastrá para girar. Se va armando con tus respuestas.";
  }

  let camY = 0.3;
  function reset() {
    disposeGroup();
    G = new THREE.Group();
    root.add(G);
    sun.position.set(5, 8, 4);
    tgtDist = 9.6;
    camY = 0.3;
  }
  const glass = (o?: MatOpts) => M("#7FA6B5", Object.assign({ transparent: true, opacity: 0.42, roughness: 0.05, metalness: 0.2 }, o || {}));
  function people(n: number, x0: number, z0: number) {
    for (let i = 0; i < n; i++) {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.26, 10), M(i % 3 ? K.petroleo : K.dorado));
      f.position.set(x0 + (i % 6) * 0.22, 0.14, z0 + Math.floor(i / 6) * 0.2);
      f.castShadow = true;
      G!.add(f);
    }
  }
  function city(opts: { corner?: boolean; mall?: boolean; lawn?: boolean }) {
    // manzana, vereda y calle; opts.corner, opts.mall, opts.lawn
    box(6, 0.3, 6, opts.lawn ? "#B3BF93" : K.manzana, 0, -0.15, 0);
    if (opts.lawn) {
      [[-2.3, -2], [2.2, -1.8], [-2.4, 1.2], [2.4, 0.9]].forEach(([x, z]) => {
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.2), M("#6B4F36")), x, 0.1, z);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), M("#58734F")), x, 0.42, z);
      });
    }
    if (opts.mall) {
      box(6, 0.02, 2.2, K.crema, 0, 0.01, 2.0);
      return;
    }
    box(6, 0.06, 0.8, K.vereda, 0, 0.03, 1.5);
    box(6, 0.02, 1.6, K.calle, 0, 0.01, 2.7);
    for (let i = -2; i <= 2; i++) box(0.35, 0.005, 0.05, K.crema, i * 1.2, 0.025, 2.7);
    if (opts.corner) {
      box(0.8, 0.06, 6, K.vereda, 2.5, 0.03, 0);
      box(0.9, 0.02, 6, K.calle, 3.05, 0.01, -0.2);
    }
  }
  const facL: Record<string, string> = {
    "Vidrio y metal": "#3A3F42",
    Madera: "#A67C52",
    Ladrillo: "#A9553B",
    "Revoque pintado": "#EDE6D6",
    "Chapa o metal": "#6F7478",
  };
  const estL: Record<string, [string, string]> = {
    Industrial: ["#4A4A48", "#B5683F"],
    "Nórdico / madera clara": ["#F1EDE4", "#C9A877"],
    "Moderno minimalista": ["#F4F1EA", "#2B2B2B"],
    "Cálido / rústico": ["#D9C3A0", "#6B4F36"],
    "De diseño / llamativo": ["#1E4C4C", "#E0A33B"],
  };
  function buildLocal(stage: number) {
    reset();
    const tags: string[] = [];
    const sel = (k: string) => (S[k] || "").split(", ").filter(Boolean);
    tgtDist = 7.4;
    const ub = S.ubicacion || "";
    const mall = ub.indexOf("galería") >= 0,
      corner = ub.indexOf("esquina") >= 0;
    city({ corner, mall });
    const wmap: Record<string, number> = { "Hasta 50": 1.5, "50–100": 1.9, "100–200": 2.3, "200–400": 2.7, "Más de 400": 3.1 };
    const W = wmap[S.local_m2] || 2.1,
      D = 2.2;
    const hmap: Record<string, number> = { "Planta baja": 0.55, "PB + entrepiso": 0.8, "Dos plantas": 1.1 };
    const H = hmap[S.local_pisos] || 0.6;

    if (ub) tags.push(ub.toLowerCase());
    if (S.rubro) tags.push(S.rubro.toLowerCase());
    if (S.local_m2) tags.push(S.local_m2 + " m²");
    if (stage < 1) {
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((c) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), M(K.dorado));
        p.position.set((c[0] * W) / 2, 0.15, -0.1 + (c[1] * D) / 2);
        G!.add(p);
      });
      stageLbl = "Tu local en la cuadra";
      return fin(tags, 0);
    }
    const est = estL[S.local_estilo] || null;
    const pal = palettes[S.paleta] || null;
    const wall = facL[S.fachada_l] || (pal && pal[0]) || (est && est[0]) || K.crema;
    const acc = (pal && pal[1]) || (est && est[1]) || K.petroleo;
    // piso, fondo y laterales
    box(W, 0.03, D, "#B9AE98", 0, 0.015, -0.1);
    box(W, H, 0.06, wall, 0, H / 2, -0.1 - D / 2);
    box(0.06, H, D, wall, -W / 2, H / 2, -0.1);
    box(0.06, H, D, wall, W / 2, H / 2, -0.1);
    box(W + 0.08, 0.06, D + 0.08, "#8C8A84", 0, H + 0.03, -0.1);
    if (S.local_pisos === "PB + entrepiso") box(W * 0.95, 0.03, D * 0.4, "#9C8F78", 0, 0.55, -0.1 - D * 0.28);
    if (S.local_pisos === "Dos plantas") box(W, 0.04, D, "#9C8F78", 0, 0.55, -0.1);
    // fachada: vidriera, banda de cartel y puerta
    const zf = -0.1 + D / 2;
    const vid = S.vidriera || "Vidriera de piso a techo";
    const band = 0.14;
    let gh: number, gy: number;
    if (vid.indexOf("piso a techo") >= 0) {
      gh = H - band - 0.02;
      gy = gh / 2 + 0.01;
    } else if (vid.indexOf("mediana") >= 0) {
      gh = (H - band) * 0.55;
      gy = 0.12 + gh / 2;
      box(W, 0.12, 0.05, wall, 0, 0.06, zf);
    } else {
      gh = (H - band) * 0.3;
      gy = (H - band) * 0.55;
      box(W, H - band, 0.05, wall, 0, (H - band) / 2, zf - 0.01);
    }
    add(new THREE.Mesh(new THREE.BoxGeometry(W - 0.06, gh, 0.02), glass()), 0, gy, zf);
    [-W / 2 + 0.03, W / 2 - 0.03, 0].forEach((x) => box(0.03, H - band, 0.04, K.marco, x, (H - band) / 2, zf + 0.01));
    box(0.28, (H - band) * 0.85, 0.03, K.marco, W * 0.32, ((H - band) * 0.85) / 2, zf + 0.02);
    const cart = S.cartel || "";
    const bandM: MatOpts = cart.indexOf("luminoso") >= 0 ? { emissive: new THREE.Color(acc), emissiveIntensity: 0.55 } : {};
    box(W, band, 0.07, cart.indexOf("pintado") >= 0 ? acc : cart.indexOf("corpóreas") >= 0 ? wall : acc, 0, H - band / 2, zf + 0.01, bandM);
    if (cart.indexOf("corpóreas") >= 0) for (let i = 0; i < 6; i++) box(0.07, 0.08, 0.03, K.dorado, -0.25 + i * 0.1, H - band / 2, zf + 0.06);
    if (cart) tags.push(cart.toLowerCase());
    tags.push(vid.toLowerCase());
    if (corner) {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.02, gh, D * 0.7), glass()), W / 2 + 0.02, gy, -0.1 + D * 0.1);
      tags.push("dos frentes");
    }
    // interior según la atención
    const at = S.atencion || "";
    if (at.indexOf("Mostrador") >= 0) box(W * 0.55, 0.16, 0.18, acc, -W * 0.1, 0.08, -0.1 - D * 0.15);
    if (at.indexOf("mesas") >= 0)
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 2; j++) {
          const x = -W / 2 + 0.4 + (i * (W - 0.8)) / 2,
            z = -0.1 + j * 0.55;
          add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 12), M("#6B4F36")), x, 0.14, z);
          add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.13), M("#2B2B2B")), x, 0.07, z);
        }
    if (at.indexOf("Góndolas") >= 0) for (let i = 0; i < 3; i++) box(0.08, 0.3, D * 0.55, acc, -W / 2 + 0.45 + (i * (W - 0.9)) / 2, 0.15, -0.2);
    if (at.indexOf("Boxes") >= 0) for (let i = 1; i < 3; i++) box(0.03, 0.35, D * 0.45, K.crema, -W / 2 + (i * W) / 3, 0.175, -0.1 - D * 0.25);
    if (at.indexOf("Escritorios") >= 0)
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) box(0.35, 0.12, 0.18, "#C9A877", -W / 4 + (i * W) / 2, 0.06, -0.4 + j * 0.5);
    if (at) tags.push(at.toLowerCase());
    const ex = sel("local_extras");
    if (ex.includes("Toldo")) {
      const t = box(W * 0.9, 0.02, 0.45, acc, 0, H - band - 0.06, zf + 0.22);
      t.rotation.x = 0.3;
      tags.push("toldo");
    }
    if (ex.includes("Terraza o deck") && !mall) {
      box(W * 0.8, 0.04, 0.55, "#A67C52", 0, 0.08, zf + 0.4);
      for (let i = 0; i < 2; i++) add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), M("#2B2B2B")), -W * 0.2 + i * W * 0.4, 0.2, zf + 0.42);
      tags.push("deck en la vereda");
    }
    if (ex.includes("Rampa de accesibilidad")) {
      const r = box(0.3, 0.02, 0.35, "#B9AE98", W * 0.32, 0.05, zf + 0.2);
      r.rotation.x = 0.15;
      tags.push("rampa");
    }
    ex.filter((x) => !["Toldo", "Terraza o deck", "Rampa de accesibilidad"].includes(x)).forEach((x) => tags.push(x.toLowerCase()));
    const pm: Record<string, number> = { "Hasta 10 personas": 3, "10 a 30": 6, "30 a 80": 9, "Más de 80": 12 };
    people(pm[S.publico] || 0, -1.2, mall ? 1.4 : 1.35);
    if (S.local_estilo && S.local_estilo !== "Todavía no sé") tags.push(S.local_estilo.toLowerCase());
    if (S.fachada_l) tags.push("fachada: " + S.fachada_l.toLowerCase());
    stageLbl = ["Tu local en la cuadra", "El local y su programa", "Vidriera y espacio interior", "Imagen y marca", "Listo para revisión", "Listo para revisión"][Math.min(stage, 5)];
    return fin(tags, stage);
  }
  const facE: Record<string, string> = {
    "Hormigón visto": "#A5A6A3",
    "Ladrillo visto": "#A9553B",
    "Revoque blanco": "#F1EDE4",
    "Vidrio y metal": "#5B6B72",
    "Mixto con madera": "#C9A877",
  };
  function buildEdificio(stage: number) {
    reset();
    const tags: string[] = [];
    const sel = (k: string) => (S[k] || "").split(", ").filter(Boolean);
    const fr = S.ed_frente || "";
    const corner = fr.indexOf("Esquina") >= 0,
      libre = fr.indexOf("libre") >= 0;
    city({ corner, lawn: libre });
    const nmap: Record<string, number> = { "PB + 2": 3, "PB + 3 a 5": 5, "PB + 6 a 10": 8, "Más de 10": 12 };
    const n = nmap[S.ed_pisos] || 4;
    const fh = 0.3,
      W = 2.4,
      D = 2.0,
      z0 = -0.2,
      zf = z0 + D / 2;
    tgtDist = 7.6 + n * 0.22;
    camY = 0.2 + n * fh * 0.3;

    if (fr) tags.push(fr.toLowerCase());
    if (stage < 1) {
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((c) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), M(K.dorado));
        p.position.set((c[0] * W) / 2, 0.15, z0 + (c[1] * D) / 2);
        G!.add(p);
      });
      stageLbl = "El lote en la cuadra";
      return fin(tags, 0);
    }
    const pal = palettes[S.paleta] || null;
    const wall = facE[S.ed_fachada] || (pal && pal[0]) || K.crema;
    const acc = (pal && pal[1]) || K.carbon2;
    const upn = ({ "1": 1, "2": 2, "3 a 4": 3, "5 o más": 5 } as Record<string, number>)[S.ed_unidades] || 2;
    const bal = S.ed_balcones || "";
    for (let i = 0; i < n; i++) {
      const y = i * fh;
      const b = box(W, fh - 0.03, D, wall, 0, y + fh / 2, z0);
      edges(b);
      box(W + 0.04, 0.03, D + 0.04, K.crema2, 0, y + fh - 0.015, z0);
      if (i === 0) {
        const pb = S.ed_pb || "";
        if (pb.indexOf("Local") >= 0) {
          add(new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, fh * 0.75, 0.02), glass()), 0, fh * 0.42, zf + 0.01);
          box(W, 0.06, 0.05, acc, 0, fh - 0.06, zf + 0.02);
          tags.push("local en PB");
        } else {
          box(W * 0.35, fh * 0.7, 0.02, K.marco, -W * 0.25, fh * 0.35, zf + 0.01);
          add(new THREE.Mesh(new THREE.BoxGeometry(W * 0.3, fh * 0.75, 0.02), glass()), W * 0.2, fh * 0.4, zf + 0.01);
          if (pb) tags.push(pb.toLowerCase());
        }
        continue;
      }
      for (let u = 0; u < upn; u++) {
        const uw = W / upn;
        const x = -W / 2 + uw * (u + 0.5);
        add(new THREE.Mesh(new THREE.BoxGeometry(uw * 0.75, fh * 0.6, 0.02), glass({ opacity: 0.6, color: "#4E6670" })), x, y + fh * 0.5, zf + 0.01);
        if (bal.indexOf("aislados") >= 0) {
          box(uw * 0.6, 0.03, 0.22, K.crema2, x, y + 0.02, zf + 0.11);
          add(new THREE.Mesh(new THREE.BoxGeometry(uw * 0.6, 0.1, 0.01), glass()), x, y + 0.08, zf + 0.22);
        }
        if (bal.indexOf("Galerías") >= 0) {
          box(uw * 0.85, 0.03, 0.28, K.crema2, x, y + 0.02, zf + 0.14);
          box(uw * 0.8, 0.07, 0.06, "#58734F", x, y + 0.07, zf + 0.26);
        }
      }
      if (bal.indexOf("corridos") >= 0) {
        box(W, 0.03, 0.25, K.crema2, 0, y + 0.02, zf + 0.125);
        add(new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, 0.01), glass()), 0, y + 0.08, zf + 0.25);
      }
    }
    const top = n * fh;
    box(W + 0.06, 0.05, D + 0.06, acc, 0, top + 0.025, z0);
    const am = sel("amenities");
    if (am.includes("Pileta en terraza")) {
      box(W * 0.45, 0.03, D * 0.35, "#E7DFCB", -W * 0.2, top + 0.065, z0 + D * 0.15);
      box(W * 0.4, 0.03, D * 0.3, "#5EB0C9", -W * 0.2, top + 0.08, z0 + D * 0.15, { roughness: 0.15 });
    }
    if (am.includes("SUM") || am.includes("Gimnasio") || am.includes("Coworking")) {
      add(new THREE.Mesh(new THREE.BoxGeometry(W * 0.35, fh * 0.7, D * 0.4), glass({ opacity: 0.55 })), W * 0.25, top + 0.05 + fh * 0.35, z0 - D * 0.2);
    }
    if (am.includes("Parrilla")) box(0.18, 0.12, 0.12, "#2B2B2B", W * 0.35, top + 0.11, z0 + D * 0.3);
    if (am.includes("Solarium")) box(W * 0.3, 0.02, D * 0.25, "#A67C52", W * 0.2, top + 0.06, z0 + D * 0.25);
    am.forEach((a) => tags.push(a.toLowerCase()));
    if ((S.ed_cocheras || "").indexOf("Subsuelo") >= 0 && !libre) {
      const r = box(0.4, 0.02, 0.7, "#3A3A3A", W / 2 - 0.25, -0.05, zf + 0.3);
      r.rotation.x = -0.18;
      tags.push("cocheras en subsuelo");
    }
    tags.push(S.ed_pisos ? "PB + " + (n - 1) + " pisos" : n + " niveles");
    tags.push(upn + (upn > 1 ? " unidades" : " unidad") + " por piso");
    if (S.destino) tags.push(S.destino.toLowerCase());
    if (bal) tags.push(bal.toLowerCase());
    if (S.ed_fachada) tags.push("fachada: " + S.ed_fachada.toLowerCase());
    stageLbl = ["El lote en la cuadra", "Volumen y pisos", "Implantación", "Amenities en terraza", "Fachada y balcones", "Listo para revisión", "Listo para revisión"][Math.min(stage, 6)];
    return fin(tags, stage);
  }
  const ESTV: Record<string, [string, string]> = {
    Contemporánea: ["#E8E2D6", "#2B2B2B"],
    Minimalista: ["#F4F1EA", "#4A4A4A"],
    "Española / Mediterránea": ["#E9DCC4", "#B5683F"],
    "Campo / Rústica": ["#C9B79A", "#6B4F36"],
    "Moderna con steel frame": ["#DADDDE", "#1F2A2A"],
  };
  function buildReforma(stage: number) {
    reset();
    tgtDist = 6.6;
    camY = 0.2;
    const tags: string[] = [];
    const sel = (k: string) => (S[k] || "").split(", ").filter(Boolean);
    city({ lawn: true });
    box(0.7, 0.03, 1.6, K.crema3, 1.5, 0.015, 1.8);
    const m2 = ({ "Hasta 100": 90, "100–200": 150, "200–300": 250, "Más de 300": 340 } as Record<string, number>)[S.casa_m2] || 150;
    const pisos = S.casa_pisos === "Dos plantas" ? 2 : 1;
    const fh = 0.3;
    const A = m2 / pisos;
    const W = Math.min(3.2, Math.sqrt(A * 1.6) / 10),
      D = Math.min(2.2, A / (W * 100)),
      z0 = -0.3,
      zf = z0 + D / 2;
    const ref = sel("reforma");
    const toda = ref.includes("Toda la casa");
    const pr = sel("problemas");
    const pal = palettes[S.paleta] || null;
    const ev = ESTV[S.estilo] || null;
    const fac = S.fachada && S.fachada !== "Mantener la actual" ? facade[S.fachada] : null;
    const nuevo = fac || (pal && pal[0]) || (ev && ev[0]) || K.crema;
    const acc = (pal && pal[1]) || (ev && ev[1]) || K.petroleo;
    const viejo = "#D6CDB8",
      GOLD = K.doradoHex;
    const hl = (m: THREE.Mesh) => {
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: GOLD }));
      m.add(l);
      return m;
    };
    if (S.casa_m2) tags.push(S.casa_m2 + " m² hoy");
    if (S.casa_antig && S.casa_antig !== "No sé") tags.push(S.casa_antig.toLowerCase());
    const interior = ref.some((r) => ["Cocina", "Baños", "Dormitorios", "Living-comedor"].includes(r));
    const show = stage >= 1;
    // casa existente
    const fachadaNueva = toda || ref.includes("Fachada") || pr.includes("Fachada antigua");
    const wallCol = fachadaNueva && show ? nuevo : viejo;
    const op: MatOpts = interior && show ? { transparent: true, opacity: 0.35 } : {};
    for (let i = 0; i < pisos; i++) {
      const b = box(W, fh - 0.01, D, wallCol, 0, 0.02 + fh / 2 + i * fh, z0, op);
      edges(b);
      if (fachadaNueva && show) hl(b);
    }
    const top = 0.02 + pisos * fh;
    // ventanas: chicas si es vieja, grandes si hay poca luz o fachada nueva
    const big = show && (pr.includes("Poca luz") || fachadaNueva || S.objetivo === "Más luz");
    for (let i = 0; i < pisos; i++) {
      const k = big ? 3 : 4;
      for (let j = 0; j < k; j++) {
        const ww = big ? W * 0.22 : W * 0.1,
          hh = big ? fh * 0.62 : fh * 0.35;
        const w = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), M(K.ventana, { roughness: 0.2, metalness: 0.3 }));
        w.position.set(-W / 2 + (W * (j + 0.5)) / k, 0.02 + fh * 0.55 + i * fh, zf + 0.006);
        G!.add(w);
        if (big) box(ww + 0.03, hh + 0.03, 0.01, K.dorado, w.position.x, w.position.y, zf + 0.003);
      }
    }
    if (big) tags.push("ventanales más grandes");
    // techo actual o nuevo
    const rt = S.casa_techo || "Teja a dos aguas";
    const rh = Math.min(0.38, W * 0.13),
      o = 0.1;
    const roofCol = toda && show ? acc : rt === "Chapa" ? "#6F7478" : rt === "Losa plana" ? "#9C978A" : "#A8634A";
    const ropt: MatOpts = interior && show ? { transparent: true, opacity: 0.25 } : {};
    const amp = S.ampliacion || "";
    const alta = show && amp === "Una planta alta";
    if (!alta) {
      if (rt === "Losa plana") {
        box(W + o * 2, 0.04, D + o * 2, roofCol, 0, top + 0.02, z0, ropt);
      } else if (rt.indexOf("cuatro") >= 0) {
        const c = new THREE.Mesh(new THREE.ConeGeometry(Math.SQRT1_2, rh, 4), M(roofCol, ropt));
        c.rotation.y = Math.PI / 4;
        c.scale.set(W + o * 2, 1, D + o * 2);
        add(c, 0, top + rh / 2, z0);
      } else {
        const sh = new THREE.Shape();
        sh.moveTo(-(W / 2 + o), 0);
        sh.lineTo(W / 2 + o, 0);
        sh.lineTo(0, rh);
        sh.lineTo(-(W / 2 + o), 0);
        const g = new THREE.ExtrudeGeometry(sh, { depth: D + o * 2, bevelEnabled: false });
        g.translate(0, 0, -(D / 2 + o));
        add(new THREE.Mesh(g, M(roofCol, ropt)), 0, top, z0);
      }
    }
    // zonas interiores a reformar
    if (show && interior) {
      const zones: [string, string, number, number][] = [
        ["Cocina", "#E0A33B", -W * 0.25, z0 + D * 0.2],
        ["Living-comedor", "#C9A877", W * 0.2, z0 + D * 0.2],
        ["Baños", "#5EB0C9", -W * 0.3, z0 - D * 0.25],
        ["Dormitorios", "#7C9A57", W * 0.2, z0 - D * 0.25],
      ];
      zones.forEach(([n, c, x, z]) => {
        if (ref.includes(n) || toda) {
          const p = box(W * 0.42, 0.03, D * 0.42, c, x, 0.05, z);
          hl(p);
          if (n === "Cocina") box(W * 0.3, 0.1, 0.08, "#2B2B2B", x, 0.1, z - D * 0.12);
          if (n === "Baños") box(0.12, 0.08, 0.08, K.crema, x, 0.09, z);
          if (n === "Dormitorios") box(0.28, 0.06, 0.36, K.crema, x, 0.08, z);
        }
      });
      tags.push("vista interior");
    }
    // ampliación
    if (show && amp && amp !== "No amplío") {
      if (alta) {
        hl(box(W * 0.85, fh - 0.01, D * 0.9, nuevo, -W * 0.05, top + fh / 2, z0));
        box(W * 0.85 + 0.12, 0.04, D * 0.9 + 0.12, acc, -W * 0.05, top + fh + 0.02, z0);
      } else if (amp.indexOf("Quincho") === 0) {
        box(W * 0.6, 0.03, 0.6, "#B9A586", 0, 0.04, zf + 0.32);
        hl(box(W * 0.62, 0.03, 0.64, acc, 0, 0.02 + fh * 0.8, zf + 0.32));
        [-0.28, 0.28].forEach((k) => box(0.03, fh * 0.78, 0.03, acc, k * W, 0.02 + fh * 0.39, zf + 0.6));
        box(0.16, 0.1, 0.1, "#2B2B2B", W * 0.2, 0.08, zf + 0.2);
      } else {
        const aw = amp === "Un dormitorio" ? 0.7 : 1.0;
        hl(box(aw, fh - 0.01, D * 0.7, nuevo, W / 2 + aw / 2, 0.02 + fh / 2, z0 + D * 0.15));
        box(aw + 0.08, 0.04, D * 0.7 + 0.08, acc, W / 2 + aw / 2, 0.02 + fh + 0.02, z0 + D * 0.15);
        const w = new THREE.Mesh(new THREE.PlaneGeometry(aw * 0.6, fh * 0.6), M(K.ventana, { roughness: 0.2 }));
        w.position.set(W / 2 + aw / 2, 0.02 + fh * 0.55, z0 + D * 0.15 + D * 0.35 + 0.006);
        G!.add(w);
      }
      tags.push("ampliación: " + amp.toLowerCase());
    }
    if (show && pr.includes("Poca conexión con el jardín")) {
      box(W * 0.5, 0.03, 0.45, "#A67C52", -W * 0.15, 0.035, zf + 0.25);
      tags.push("deck al jardín");
    }
    ref.forEach((r) => tags.push(r.toLowerCase()));
    if (S.estilo && S.estilo !== "Todavía no sé") tags.push(S.estilo.toLowerCase());
    if (fac) tags.push("fachada: " + S.fachada.toLowerCase());
    stageLbl = stage < 1 ? "Tu casa como está hoy" : ["Tu casa como está hoy", "Qué se reforma", "Lo nuevo", "Estilo de la reforma", "Listo para revisión", "Listo para revisión"][Math.min(stage, 5)];
    return fin(tags, stage);
  }

  let sig = "";
  function upd() {
    const c = ctx();
    S = c.S;
    const st = c.cur < 0 ? 0 : c.cur;
    const k = JSON.stringify(S) + st;
    if (k === sig) return;
    sig = k;
    try {
      const t = S.tipo || "";
      if (t.indexOf("Local") === 0) buildLocal(st);
      else if (t.indexOf("Edificio") === 0) buildEdificio(st);
      else if (S.alcance === "Reforma") buildReforma(st);
      else {
        reset();
        root.remove(G!);
        G = null;
        build(Math.max(0, st - 1));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Loop: se pausa fuera de pantalla o con la pestaña oculta.
  let raf = 0,
    visible = true;
  function loop() {
    raf = 0;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    if (auto) rot += 0.004;
    root.rotation.y = rot;
    const r = tgtDist;
    cam.position.set(0, camY + r * 0.42, r * 0.95);
    cam.lookAt(0, camY, 0);
    renderer.render(scene, cam);
  }
  const start = () => {
    if (!raf) loop();
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    start();
  });
  io.observe(cv);
  document.addEventListener("visibilitychange", start);
  start();
  upd();

  return {
    upd,
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(resume);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", start);
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      cv.removeEventListener("keydown", onKey);
      disposeGroup();
      renderer.dispose();
    },
  };
}
