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

export const entityBrandBadgeClass: Record<EntityBrandTone, string> = {
  solar2sk: "border-[#00F5D4]/30 bg-[#00F5D4]/10 text-[#008f7d]",
  solar3k: "border-[#6A00FF]/25 bg-[#6A00FF]/10 text-[#6A00FF]",
  yellowStar: "border-[#B5179E]/25 bg-[#B5179E]/10 text-[#B5179E]",
  systems: "border-[#B5179E]/30 bg-[#B5179E]/10 text-[#B5179E]",
};
