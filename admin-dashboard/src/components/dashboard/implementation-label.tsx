import type { ReactNode } from "react";

import { entityBrandStyles } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

/** Semantic layer for implementation callouts — not interchangeable across pages. */
export type ImplementationLabelVariant = "architecture" | "engineering" | "automation" | "logistics" | "enterprise";

const variantClass: Record<ImplementationLabelVariant, string> = {
  architecture: entityBrandStyles.solar3k.badge,
  engineering: entityBrandStyles.solar2sk.badge,
  automation: entityBrandStyles.yellowStar.badge,
  logistics: entityBrandStyles.solar2sk.badge,
  enterprise: entityBrandStyles.solar3k.badge,
};

type DashImplementationLabelProps = {
  variant: ImplementationLabelVariant;
  children: ReactNode;
  className?: string;
  /** When true, renders only the chip (inline in prose). Default adds section divider spacing. */
  inline?: boolean;
};

export function DashImplementationLabel({
  variant,
  children,
  className,
  inline = false,
}: DashImplementationLabelProps) {
  const chip = (
    <span
      className={cn(
        "inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );

  if (inline) return chip;

  return (
    <div className="mb-2 flex items-center gap-1.5 border-border border-b pb-1.5">
      {chip}
    </div>
  );
}
