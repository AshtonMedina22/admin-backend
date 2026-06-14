export const DEMO_ORG = {
  parent: "Gold Star Power",
  retail: "Solar 2SK",
  commercial: "Solar 3SK",
  portfolio: "Yellow Star Power",
} as const;

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
