"use client";

import { ShieldAlert } from "lucide-react";

import { statusStyles } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";
import { useDashboardRole } from "@/stores/rbac/dashboard-role-provider";

export function RoleScopeBanner() {
  const { accessLevel, profile } = useDashboardRole();

  if (accessLevel !== "manager") return null;

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide lg:flex",
        statusStyles.warning,
      )}
    >
      <ShieldAlert className="size-3.5 shrink-0" />
      <span>
        Scoped as {profile.name} — Enterprise &amp; Systems show <strong className="font-bold">Access Denied</strong>
      </span>
    </div>
  );
}
