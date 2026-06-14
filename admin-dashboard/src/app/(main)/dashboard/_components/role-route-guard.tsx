"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardRole } from "@/stores/rbac/dashboard-role-provider";

const restrictedPaths = ["/dashboard/enterprise", "/dashboard/settings"];

export function RoleRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { accessLevel, profile } = useDashboardRole();

  const isRestricted =
    accessLevel === "manager" && restrictedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isRestricted) {
    return (
      <Card className="mx-auto mt-8 max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-amber-600" />
            Access restricted
          </CardTitle>
          <CardDescription>
            {profile.name} ({profile.roleLabel}) does not have permission to view this module. Enterprise and Systems
            settings are scoped to global administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/retail">Go to Consumer Retail Hub</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return children;
}
