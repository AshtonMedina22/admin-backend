import { DEMO_ORG } from "@/config/demo-identity";

export type EntityBrand = "Solar2SK" | "Solar3K" | "Yellow Star" | "Systems Alert";

export type DisplayCompany =
  | "All Companies"
  | typeof DEMO_ORG.portfolio
  | typeof DEMO_ORG.retail
  | typeof DEMO_ORG.commercial;

export function formatCompany(brand: EntityBrand): string {
  const map: Record<EntityBrand, string> = {
    Solar2SK: DEMO_ORG.retail,
    Solar3K: DEMO_ORG.commercial,
    "Yellow Star": DEMO_ORG.portfolio,
    "Systems Alert": "Systems Alert",
  };
  return map[brand];
}

export function brandToDisplayCompany(brand: EntityBrand): Exclude<DisplayCompany, "All Companies"> {
  return formatCompany(brand) as Exclude<DisplayCompany, "All Companies">;
}
