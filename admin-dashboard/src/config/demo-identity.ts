/**
 * Operating company identities for the demo dashboard.
 * Verified entities: YSP, 2SK, 3SK
 * (related renewable-energy portfolio — not to be confused with unrelated "Texas Star Power").
 */
export const DEMO_ORG = {
  parent: "YSP",
  retail: "2SK",
  commercial: "3SK",
  portfolio: "YSP",
} as const;

/** Fictional personnel — no real client names in RBAC UI. */
export const DEMO_ADMIN = {
  id: "amorgan",
  name: "Alex Morgan",
  email: "alex.morgan@demo-ops.local",
  roleLabel: "Global Super Admin",
  company: DEMO_ORG.portfolio,
} as const;

export const DEMO_MANAGER = {
  id: "jlee",
  name: "Jordan Lee",
  email: "jordan.lee@demo-ops.local",
  roleLabel: "Operations Manager",
  company: DEMO_ORG.retail,
} as const;

export type DemoAccountOwner = typeof DEMO_ADMIN.name | typeof DEMO_MANAGER.name;
