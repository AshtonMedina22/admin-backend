import type { NavMainItem } from "@/navigation/sidebar/sidebar-items";
import type { DashboardAccessLevel } from "@/stores/rbac/dashboard-role-provider";

export const MANAGER_RESTRICTED_PREFIXES = [
  "/dashboard/enterprise",
  "/dashboard/settings",
  "/dashboard/systems",
] as const;

export function isPathRestrictedForManager(pathname: string): boolean {
  return MANAGER_RESTRICTED_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isAccessDenied(accessLevel: DashboardAccessLevel, pathname: string): boolean {
  return accessLevel === "manager" && isPathRestrictedForManager(pathname);
}

export function isNavItemRestrictedForRole(item: NavMainItem, accessLevel: DashboardAccessLevel): boolean {
  if (accessLevel === "admin") return false;
  return item.accessRequired === "admin";
}

export function moduleLabelForRestrictedPath(pathname: string): string {
  if (pathname.startsWith("/dashboard/enterprise")) return "Enterprise Hub";
  if (pathname.startsWith("/dashboard/systems")) return "Systems & Settings";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Restricted module";
}
