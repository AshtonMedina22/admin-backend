import type { NavGroup } from "@/navigation/sidebar/sidebar-items";
import type { DashboardAccessLevel } from "@/stores/rbac/dashboard-role-provider";

/** Keep every nav item visible — RBAC is enforced on the route with an Access Denied panel, not by hiding links. */
export function filterSidebarByRole(items: readonly NavGroup[], _accessLevel: DashboardAccessLevel): NavGroup[] {
  return items.map((group) => ({
    ...group,
    items: [...group.items],
  }));
}
