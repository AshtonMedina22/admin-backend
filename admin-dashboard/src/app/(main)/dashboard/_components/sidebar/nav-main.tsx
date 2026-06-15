"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, Lock } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { filterSidebarByRole } from "@/lib/rbac/filter-sidebar";
import { isNavItemRestrictedForRole } from "@/lib/rbac/access-policy";
import { cn } from "@/lib/utils";
import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";
import type { DashboardAccessLevel } from "@/stores/rbac/dashboard-role-provider";
import { useDashboardRole } from "@/stores/rbac/dashboard-role-provider";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

const navItemClass =
  "h-9 min-h-0 items-center gap-2 rounded-lg px-2 py-0 text-[13px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:border-l-2 data-[active=true]:border-[var(--brand-3sk)] data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-[var(--brand-3sk-text)]";
const navSubItemClass =
  "text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-[var(--brand-3sk-text)]";

function navItemTooltip(item: NavMainItem, suffix?: string) {
  const skills = item.skills?.join(" · ");
  return [item.title, skills, suffix].filter(Boolean).join(" — ");
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">Soon</span>
);

const NavRestrictedBadge = () => (
  <span
    className="shrink-0 rounded border border-[color-mix(in_oklab,var(--status-critical)_35%,transparent)] bg-[var(--status-critical-bg)] px-1 py-px font-mono text-[8px] text-[var(--status-critical-text)] uppercase leading-none tracking-wide"
    title="Global Super Admin required"
  >
    Admin
  </span>
);

const NavItemExpanded = ({
  item,
  isActive,
  isSubmenuOpen,
  accessLevel,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
  accessLevel: DashboardAccessLevel;
}) => {
  const isRestricted = isNavItemRestrictedForRole(item, accessLevel);

  return (
    <Collapsible key={item.title} asChild defaultOpen={isSubmenuOpen(item.subItems)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.subItems ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={navItemTooltip(item)}
              className={cn(navItemClass, isRestricted && "opacity-90")}
            >
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
              {isRestricted ? <NavRestrictedBadge /> : null}
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={navItemTooltip(item, isRestricted ? "Access Denied for current profile" : undefined)}
              className={cn(navItemClass, isRestricted && "opacity-90")}
            >
              <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon className="size-4 shrink-0" />}
                <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                  {isRestricted ? <Lock className="size-3 shrink-0 text-[var(--status-critical)]" /> : null}
                  <span className="truncate">{item.title}</span>
                </span>
                {isRestricted ? <NavRestrictedBadge /> : null}
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.subItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    aria-disabled={subItem.comingSoon}
                    isActive={isActive(subItem.url)}
                    asChild
                    className={navSubItemClass}
                  >
                    <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

const NavItemCollapsed = ({
  item,
  isActive,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={isActive(item.url, item.subItems)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 space-y-1 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
          side="right"
          align="start"
        >
          {item.subItems?.map((subItem) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <SidebarMenuSubButton
                key={subItem.title}
                asChild
                className={cn("focus-visible:ring-0", navSubItemClass)}
                aria-disabled={subItem.comingSoon}
                isActive={isActive(subItem.url)}
              >
                <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                  {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                  <span>{subItem.title}</span>
                  {subItem.comingSoon && <IsComingSoon />}
                </Link>
              </SidebarMenuSubButton>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const { state, isMobile } = useSidebar();
  const { accessLevel } = useDashboardRole();
  const visibleItems = filterSidebarByRole(items, accessLevel);

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url));
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false;
  };

  return (
    <>
      {visibleItems.map((group) => (
        <SidebarGroup key={group.id} className="py-0">
          {group.label && (
            <SidebarGroupLabel className="h-7 px-2 py-0 text-[10px] uppercase tracking-widest">{group.label}</SidebarGroupLabel>
          )}
          <SidebarGroupContent className="flex flex-col gap-0 px-0">
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  // If no subItems, just render the button as a link
                  if (!item.subItems) {
                    const isRestricted = isNavItemRestrictedForRole(item, accessLevel);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          aria-disabled={item.comingSoon}
                          tooltip={navItemTooltip(item, isRestricted ? "Access Denied for current profile" : undefined)}
                          isActive={isItemActive(item.url)}
                          className={cn(navItemClass, isRestricted && "opacity-90")}
                        >
                          <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                            {item.icon && <item.icon />}
                            <span className="flex items-center gap-1 truncate">
                              {isRestricted ? <Lock className="size-3 text-[var(--status-critical)]" /> : null}
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  // Otherwise, render the dropdown as before
                  return <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} />;
                }
                // Expanded view
                return (
                  <NavItemExpanded
                    key={item.title}
                    item={item}
                    isActive={isItemActive}
                    isSubmenuOpen={isSubmenuOpen}
                    accessLevel={accessLevel}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
