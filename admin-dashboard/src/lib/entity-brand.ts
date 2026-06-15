import type { EntityBrand } from "@/data/demo/types";
import { formatCompany } from "@/data/demo/types";

export function inferEntityBrand(text: string): EntityBrand {
  const lower = text.toLowerCase();
  if (lower.includes("ssl") || lower.includes("script") || lower.includes("dreamhost") || lower.includes("systems")) {
    return "Systems Alert";
  }
  if (lower.includes("yellow") || lower.includes("ysp")) return "Yellow Star";
  if (lower.includes("3sk") || lower.includes("3k")) return "Solar3K";
  return "Solar2SK";
}

export function normalizeEntityBrand(brand: string | EntityBrand): EntityBrand {
  if (brand === "Solar2SK" || brand === "Solar3K" || brand === "Yellow Star" || brand === "Systems Alert") {
    return brand;
  }
  return inferEntityBrand(brand);
}

export function entityBrandLabel(brand: string | EntityBrand): string {
  return formatCompany(normalizeEntityBrand(brand));
}

export type EntityBrandTone = "solar2sk" | "solar3k" | "yellowStar" | "systems";

export function entityBrandTone(brand: string | EntityBrand): EntityBrandTone {
  const normalized = normalizeEntityBrand(brand);
  if (normalized === "Solar3K") return "solar3k";
  if (normalized === "Yellow Star") return "yellowStar";
  if (normalized === "Systems Alert") return "systems";
  return "solar2sk";
}

export const entityBrandStyles: Record<
  EntityBrandTone,
  { badge: string; accent: string; accentBar: string; icon: string; text: string }
> = {
  solar2sk: {
    badge: "border-[color-mix(in_oklab,var(--brand-2sk)_30%,transparent)] bg-[var(--brand-2sk-bg)] text-[var(--brand-2sk-text)]",
    accent: "border-[var(--brand-2sk)]",
    accentBar: "border-l-4 border-[var(--brand-2sk)]",
    icon: "text-[var(--brand-2sk)]",
    text: "text-[var(--brand-2sk-text)]",
  },
  solar3k: {
    badge: "border-[color-mix(in_oklab,var(--brand-3sk)_30%,transparent)] bg-[var(--brand-3sk-bg)] text-[var(--brand-3sk-text)]",
    accent: "border-[var(--brand-3sk)]",
    accentBar: "border-l-4 border-[var(--brand-3sk)]",
    icon: "text-[var(--brand-3sk)]",
    text: "text-[var(--brand-3sk-text)]",
  },
  yellowStar: {
    badge: "border-[color-mix(in_oklab,var(--brand-ysp)_30%,transparent)] bg-[var(--brand-ysp-bg)] text-[var(--brand-ysp-text)]",
    accent: "border-[var(--brand-ysp)]",
    accentBar: "border-l-4 border-[var(--brand-ysp)]",
    icon: "text-[var(--brand-ysp)]",
    text: "text-[var(--brand-ysp-text)]",
  },
  systems: {
    badge: "border-[color-mix(in_oklab,var(--status-critical)_30%,transparent)] bg-[var(--status-critical-bg)] text-[var(--status-critical-text)]",
    accent: "border-[var(--status-critical)]",
    accentBar: "border-l-4 border-[var(--status-critical)]",
    icon: "text-[var(--status-critical)]",
    text: "text-[var(--status-critical-text)]",
  },
};

/** @deprecated Use entityBrandStyles[tone].badge */
export const entityBrandBadgeClass: Record<EntityBrandTone, string> = {
  solar2sk: entityBrandStyles.solar2sk.badge,
  solar3k: entityBrandStyles.solar3k.badge,
  yellowStar: entityBrandStyles.yellowStar.badge,
  systems: entityBrandStyles.systems.badge,
};

export const statusStyles = {
  live: "border-[color-mix(in_oklab,var(--status-live)_30%,transparent)] bg-[var(--status-live-bg)] text-[var(--status-live-text)]",
  warning: "border-[color-mix(in_oklab,var(--brand-ysp)_30%,transparent)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]",
  critical: "border-[color-mix(in_oklab,var(--status-critical)_30%,transparent)] bg-[var(--status-critical-bg)] text-[var(--status-critical-text)]",
  info: "border-border bg-muted/30 text-muted-foreground",
} as const;

export const dashKpiValueClass = "font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground";
export const dashKpiValueLgClass = "font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground";
export const dashCodeBlockClass =
  "overflow-x-auto rounded-md bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100";
export const dashCodeBlockSmClass =
  "overflow-x-auto rounded-md bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100";
export const dashProseClass = "text-sm leading-relaxed text-slate-700";
export const dashSectionTitleClass = "font-semibold text-foreground";

export function entityBrandStylesFor(brand: string) {
  return entityBrandStyles[entityBrandTone(brand)];
}

export function entityBadgeClassForLabel(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("yellow") || lower.includes("ysp")) return entityBrandStyles.yellowStar.badge;
  if (lower.includes("3sk") || lower.includes("3k")) return entityBrandStyles.solar3k.badge;
  if (lower.includes("2sk")) return entityBrandStyles.solar2sk.badge;
  return "border-border bg-muted/30 text-muted-foreground";
}

export function entityAccentBarForLabel(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("yellow") || lower.includes("ysp")) return entityBrandStyles.yellowStar.accentBar;
  if (lower.includes("3sk") || lower.includes("3k")) return entityBrandStyles.solar3k.accentBar;
  if (lower.includes("2sk")) return entityBrandStyles.solar2sk.accentBar;
  return "border-l-4 border-slate-300";
}
