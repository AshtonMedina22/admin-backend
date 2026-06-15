"use client";

import Link from "next/link";

import { LogOut, Shield } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { getInitials } from "@/lib/utils";
import { useDashboardRole } from "@/stores/rbac/dashboard-role-provider";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { profile } = useDashboardRole();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="default"
              className="h-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-[var(--brand-3sk-text)] data-[state=open]:bg-sidebar-accent data-[state=open]:text-[var(--brand-3sk-text)]"
            >
              <Avatar className="size-7 rounded-md">
                <AvatarFallback className="rounded-md text-[10px]">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left leading-none">
                <span className="truncate font-medium text-[13px]">{profile.name}</span>
                <span className="truncate text-[10px] text-sidebar-foreground/70">{profile.roleLabel}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-border bg-popover text-sidebar-foreground shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profile.name}</span>
                  <span className="truncate text-sidebar-foreground/70 text-xs">{profile.company}</span>
                  <span className="truncate text-sidebar-foreground/55 text-[11px]">{profile.roleLabel}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/systems" prefetch={false}>
                <Shield />
                Systems &amp; access
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-sidebar-foreground/55">
              <LogOut />
              End session (demo)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
