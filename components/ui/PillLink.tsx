import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "light" | "outline-light" | "outline-dark" | "gold";

const styles: Record<Variant, string> = {
  primary: "bg-petroleo text-crema hover:bg-[#173d3d]",
  light: "bg-crema text-carbon hover:bg-white",
  gold: "bg-dorado-claro text-carbon hover:bg-[#e6d3a6]",
  "outline-light": "border border-crema/40 text-crema hover:border-crema hover:bg-crema/10",
  "outline-dark": "border border-carbon/30 text-carbon hover:border-carbon hover:bg-carbon/5",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
  external?: boolean;
  ariaLabel?: string;
};

export default function PillLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
  ariaLabel,
}: Props) {
  const cls = `group inline-flex items-center justify-center gap-3 rounded-full font-semibold tracking-[0.01em] transition-colors duration-300 ${
    size === "lg" ? "min-h-14 px-7 text-base md:min-h-16 md:px-9 md:text-lg" : "min-h-12 px-6 text-[0.9375rem]"
  } ${styles[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  // Las anclas se manejan con <a> para que SmoothScroll las intercepte sin pasar por el router.
  if (href.startsWith("#") || href.startsWith("/#")) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
