import { Building2, Calendar, Forklift, LayoutDashboard, type LucideIcon, Settings, ShoppingBag } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export type NavAccess = "admin" | "all";

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  accessRequired?: NavAccess;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Operations",
    items: [
      {
        title: "Command Center",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Enterprise",
        url: "/dashboard/enterprise",
        icon: Building2,
        accessRequired: "admin",
      },
      {
        title: "Consumer Retail",
        url: "/dashboard/retail",
        icon: ShoppingBag,
      },
      {
        title: "Vendor Ops",
        url: "/dashboard/vendor-ops",
        icon: Forklift,
      },
      {
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        title: "Systems",
        url: "/dashboard/systems",
        icon: Settings,
        accessRequired: "admin",
      },
    ],
  },
];
