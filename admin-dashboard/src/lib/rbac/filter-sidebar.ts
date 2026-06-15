import type { NavGroup } from "@/navigation/sidebar/sidebar-items";
import type { DashboardAccessLevel } from "@/stores/rbac/dashboard-role-provider";

export function filterSidebarByRole(items: readonly NavGroup[], _accessLevel: DashboardAccessLevel): NavGroup[] {
  return items.map((group) => ({
    ...group,
    items: [...group.items],
  }));
}
