"use client";

import { Check } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { dashboardProfiles, useDashboardRole } from "@/stores/rbac/dashboard-role-provider";

export function AccountSwitcher() {
  const { profile, setProfileId } = useDashboardRole();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex max-w-[min(100%,14rem)] items-center gap-2 rounded-lg border border-[#2a2a2d] bg-[#101113]/80 px-2 py-1.5 text-left text-slate-100 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:max-w-xs"
        >
          <Avatar className="size-8 shrink-0 rounded-lg">
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-1 sm:grid">
            <span className="truncate font-semibold text-sm">Act as: {profile.name}</span>
            <span className="truncate text-slate-400 text-xs">{profile.roleLabel}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-64 space-y-1 rounded-lg border-[#2a2a2d] bg-[#101113] text-slate-100 shadow-2xl"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <p className="px-2 py-1.5 text-slate-400 text-xs">Switch RBAC profile for demo review</p>
        {dashboardProfiles.map((user) => (
          <DropdownMenuItem
            key={user.id}
            className={cn("p-0 focus:bg-white/5 focus:text-slate-100", user.id === profile.id && "bg-white/5")}
            aria-current={user.id === profile.id ? "true" : undefined}
            onClick={() => setProfileId(user.id)}
          >
            <div className="flex w-full items-center gap-2 px-1 py-1.5">
              <Avatar className="size-9 rounded-lg">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-slate-400 text-xs">
                  {user.roleLabel} · {user.company}
                </span>
              </div>
              <span
                className={cn(
                  "mr-1 flex size-5 items-center justify-center rounded-full text-cyan-300 opacity-0",
                  user.id === profile.id && "opacity-100",
                )}
              >
                <Check aria-hidden="true" />
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
