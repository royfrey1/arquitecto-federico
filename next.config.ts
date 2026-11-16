import path from "node:path";
import type { NextConfig } from "next";

/** Caché larga para assets estáticos de /public (videos, posters, fotos, logo). */
const CACHE_INMUTABLE = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Requerido desde Next 16: allowlist de calidades.
    qualities: [70, 80],
    formats: ["image/avif", "image/webp"],
  },
  // Las imágenes OG leen posters de /public: el rastreo de archivos no tiene que sumar los videos
  // (≈55 MB) a esas funciones. Ningún código de servidor lee .mp4.
  outputFileTracingExcludes: {
    "/**": ["./public/**/*.mp4"],
  },
  async headers() {
    return [
      { source: "/media/:path*", headers: CACHE_INMUTABLE },
      { source: "/brand/:path*", headers: CACHE_INMUTABLE },
    ];
  },
  turbopack: {
    // Raíz = carpeta del proyecto (relativa a este archivo, sin rutas absolutas de la máquina).
    // Evita que tome un package-lock.json de una carpeta superior como raíz del workspace.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
