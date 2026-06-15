"use client";

import Link from "next/link";

import { LockKeyhole, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashCardClass, dashCardContentClass, dashCardHeaderClass } from "@/lib/dashboard-ui";
import { entityBrandStyles, statusStyles } from "@/lib/entity-brand";
import { moduleLabelForRestrictedPath } from "@/lib/rbac/access-policy";
import { cn } from "@/lib/utils";
import { DEMO_ADMIN } from "@/config/demo-identity";
import type { DashboardProfile } from "@/stores/rbac/dashboard-role-provider";

type AccessDeniedPanelProps = {
  pathname: string;
  profile: DashboardProfile;
  onSwitchToAdmin?: () => void;
};

export function AccessDeniedPanel({ pathname, profile, onSwitchToAdmin }: AccessDeniedPanelProps) {
  const moduleLabel = moduleLabelForRestrictedPath(pathname);

  return (
    <Card
      className={cn(
        "mx-auto mt-6 max-w-xl border-[color-mix(in_oklab,var(--status-critical)_35%,transparent)] border-l-4 border-l-[var(--status-critical)] shadow-md",
        dashCardClass,
      )}
    >
      <CardHeader className={cn(dashCardHeaderClass, "space-y-3")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest", statusStyles.critical)}>
            RBAC enforcement
          </span>
          <span className={cn("rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wide", entityBrandStyles.solar3k.badge)}>
            {moduleLabel}
          </span>
        </div>
        <CardTitle className="flex items-center gap-2 text-2xl tracking-tight">
          <ShieldAlert className="size-7 text-[var(--status-critical)]" />
          Access denied
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          <strong className="text-foreground">{profile.name}</strong> ({profile.roleLabel} · {profile.company}) does not
          have clearance for this module. Switch to{" "}
          <strong className="text-foreground">{DEMO_ADMIN.name}</strong> (Global Super Admin) to unlock Enterprise and
          Systems administration.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(dashCardContentClass, "grid gap-3")}>
        <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <LockKeyhole className="size-4" />
            Permission boundary
          </div>
          <p>
            Required scope: <span className="text-foreground">Global Super Admin</span> · Current scope:{" "}
            <span className="text-foreground">{profile.roleLabel}</span> · Blocked route:{" "}
            <span className="text-foreground">{pathname}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onSwitchToAdmin ? (
            <Button type="button" onClick={onSwitchToAdmin}>
              Switch to {DEMO_ADMIN.name}
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/dashboard/retail">Go to Consumer Retail Hub</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/default">Return to Command Center</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
