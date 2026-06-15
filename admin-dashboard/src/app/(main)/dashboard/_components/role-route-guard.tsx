"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { AccessDeniedPanel } from "@/components/dashboard/access-denied-panel";
import { isAccessDenied } from "@/lib/rbac/access-policy";
import { DEMO_ADMIN } from "@/config/demo-identity";
import { useDashboardRole } from "@/stores/rbac/dashboard-role-provider";

export function RoleRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { accessLevel, profile, setProfileId } = useDashboardRole();

  if (isAccessDenied(accessLevel, pathname)) {
    return (
      <AccessDeniedPanel
        pathname={pathname}
        profile={profile}
        onSwitchToAdmin={() => setProfileId(DEMO_ADMIN.id)}
      />
    );
  }

  return children;
}
