import type { ReactNode } from "react";

type Props = {
  numero: string;
  label: string;
  tone?: "light" | "dark";
  children?: ReactNode;
};

/** Cabecera editorial: numeración + label en versalitas + línea fina. */
export default function SectionHead({ numero, label, tone = "light", children }: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex items-center gap-4 border-t pt-5 ${
        dark ? "border-crema/15 text-crema/70" : "border-carbon/15 text-texto-suave"
      }`}
    >
      <span className={`num text-sm ${dark ? "text-dorado" : "text-dorado-oscuro"}`}>{numero}</span>
      <span className="label">{label}</span>
      {children && <span className="label ml-auto hidden sm:inline">{children}</span>}
    </div>
  );
}
