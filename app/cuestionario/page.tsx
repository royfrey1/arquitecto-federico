import type { Metadata } from "next";
import Cuestionario from "@/components/cuestionario/Cuestionario";
import { social } from "@/lib/seo";

const title = "Empezá a pensar tu render en 5 minutos";
const description =
  "Casa, local o edificio: respondé un cuestionario de 5 minutos y recibí un render conceptual de tu proyecto. Sin costo.";

export const metadata: Metadata = {
  title,
  description,
  ...social({ title: `${title} — Federico Marzano Pacheco`, description, path: "/cuestionario" }),
};

export default function CuestionarioPage() {
  return <Cuestionario />;
}
