import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { OgTitle } from "@/lib/og-title";
import { site } from "@/data/site";

export const OG_SIZE = { width: 1200, height: 630 };

/*
  Lecturas de disco cacheadas con "use cache": así las imágenes OG se prerenderizan en el
  build (estáticas) en lugar de leer /public y assets/ en cada request.
*/
async function font(file: string) {
  "use cache";
  const buf = await readFile(join(process.cwd(), "assets/fonts", file));
  return new Uint8Array(buf).buffer;
}

async function imageData(publicPath: string) {
  "use cache";
  const buf = await readFile(join(process.cwd(), "public", publicPath));
  const ext = publicPath.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

type Props = {
  /** Foto/poster de fondo (ruta dentro de /public). */
  image: string;
  /** Posición vertical del recorte (0 arriba – 100 abajo). */
  focusY?: number;
  eyebrow: string;
  /** Título; `italic` = palabra en itálica dorada. Datos planos: son la clave del caché. */
  title: { text: string; italic?: string };
  titleSize?: number;
  footer: string;
};

/**
 * Plantilla OG 1200×630 del sitio: foto a sangre con el mismo etalonaje luminoso del hero,
 * degradado inferior para el texto, título en Fraunces y firma en Manrope.
 * El bloque de texto va a la izquierda y abajo, legible también en las miniaturas de WhatsApp.
 * Sale en JPEG (≈60–75 KB) para que WhatsApp no descarte la vista previa.
 */
async function ogJpeg({ image, focusY = 50, eyebrow, title, titleSize = 92, footer }: Props): Promise<Uint8Array> {
  // Toda la generación (satori + sharp) queda cacheada: la imagen se prerenderiza en el build.
  "use cache";
  const [bg, logo, frauncesLight, frauncesItalic, manrope] = await Promise.all([
    imageData(image),
    imageData("/brand/logo-mp.png"),
    font("Fraunces-normal.woff"),
    font("Fraunces-italic.woff"),
    font("Manrope-normal.woff"),
  ]);

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#141414" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) */}
        <img
          src={bg}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover", objectPosition: `50% ${focusY}%` }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(0deg, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.6) 42%, rgba(20,20,20,0.05) 70%, rgba(20,20,20,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "52px 72px 56px",
            color: "#F2EBDD",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) */}
            <img src={logo} alt="" width={57} height={48} style={{ width: 57, height: 48 }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Fraunces", fontSize: 30, lineHeight: 1.1 }}>{site.nombre}</span>
              <span style={{ fontFamily: "Manrope", fontSize: 15, letterSpacing: 3.5, textTransform: "uppercase", color: "#D9C08A" }}>
                {site.rol}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Manrope", fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "#D9C08A" }}>
              <div style={{ width: 40, height: 1, background: "#A0823F" }} />
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 18,
                fontFamily: "Fraunces",
                fontSize: titleSize,
                lineHeight: 0.98,
                letterSpacing: -2.5,
                width: 1020,
                textShadow: "0 2px 30px rgba(0,0,0,0.35)",
              }}
            >
              <OgTitle text={title.text} italic={title.italic} />
            </div>
            <div style={{ display: "flex", marginTop: 26, fontFamily: "Manrope", fontSize: 20, color: "rgba(242,235,221,0.85)" }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Fraunces", data: frauncesLight, style: "normal", weight: 300 },
        { name: "Fraunces", data: frauncesItalic, style: "italic", weight: 300 },
        { name: "Manrope", data: manrope, style: "normal", weight: 600 },
      ],
    },
  );
  // JPEG (≈100 KB) en vez de PNG (≈800 KB): WhatsApp descarta previews pesadas.
  const jpg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Uint8Array(jpg);
}

export async function renderOg(props: Props) {
  const body = await ogJpeg(props);
  return new Response(body.buffer as ArrayBuffer, { headers: { "Content-Type": "image/jpeg" } });
}
