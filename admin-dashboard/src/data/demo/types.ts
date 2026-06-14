export type EntityBrand = "Solar2SK" | "Solar3K" | "Yellow Star" | "Systems Alert";

export type DisplayCompany = "All Companies" | "Yellow Star Power" | "Solar 2SK" | "Solar 3SK";

export function formatCompany(brand: EntityBrand): string {
  const map: Record<EntityBrand, string> = {
    Solar2SK: "Solar 2SK",
    Solar3K: "Solar 3SK",
    "Yellow Star": "Yellow Star Power",
    "Systems Alert": "Systems Alert",
  };
  return map[brand];
}

export function brandToDisplayCompany(brand: EntityBrand): Exclude<DisplayCompany, "All Companies"> {
  return formatCompany(brand) as Exclude<DisplayCompany, "All Companies">;
}
