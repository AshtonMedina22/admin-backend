import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { RoleRouteGuard } from "@/app/(main)/dashboard/_components/role-route-guard";
import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { WorkbookSyncStatusBar } from "@/app/(main)/dashboard/_components/workbook-sync-status-bar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { cn } from "@/lib/utils";
import { getWorkbookSyncStatus } from "@/lib/workbook-sync-status";
import { getPreference } from "@/server/server-actions";
import { DashboardRoleProvider } from "@/stores/rbac/dashboard-role-provider";

import { AccountSwitcher } from "./_components/sidebar/account-switcher";
import { SearchDialog } from "./_components/sidebar/search-dialog";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const [variant, collapsible, syncStatus] = await Promise.all([
    getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    getWorkbookSyncStatus(),
  ]);

  return (
    <DashboardRoleProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 50)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant={variant} collapsible={collapsible} />
        <SidebarInset
          className={cn(
            "[html[data-content-layout=centered]_&>*]:mx-auto",
            "[html[data-content-layout=centered]_&>*]:w-full",
            "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
            "peer-data-[variant=inset]:border peer-data-[variant=inset]:border-[#1B1B3A]/10",
            "[--dashboard-header-height:--spacing(12)]",
            "dashboard-shell min-w-0 overflow-x-hidden bg-[#F7F7FF] text-[#1B1B3A]",
          )}
        >
          <header
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 border-[#1B1B3A]/10 border-b bg-[#F7F7FF]/95 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
              "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-[#F7F7FF]/85 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <Separator
                  orientation="vertical"
                  className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                />
                <SearchDialog />
                <WorkbookSyncStatusBar {...syncStatus} />
              </div>
              <div className="flex shrink-0 items-center">
                <AccountSwitcher />
              </div>
            </div>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden bg-[#F7F7FF] p-3 has-data-[content-padding=false]:p-0 md:p-5">
            <RoleRouteGuard>{children}</RoleRouteGuard>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardRoleProvider>
  );
}
