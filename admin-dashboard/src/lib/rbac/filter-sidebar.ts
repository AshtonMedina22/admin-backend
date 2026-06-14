import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";
import type { DashboardAccessLevel } from "@/stores/rbac/dashboard-role-provider";

export function filterSidebarByRole(items: readonly NavGroup[], accessLevel: DashboardAccessLevel): NavGroup[] {
  return items.map((group) => ({
    ...group,
    items: group.items.filter((item) => isNavItemVisible(item, accessLevel)),
  }));
}

function isNavItemVisible(item: NavMainItem, accessLevel: DashboardAccessLevel) {
  if (accessLevel === "admin") return true;
  return item.accessRequired !== "admin";
}
