import {
  Building2,
  CalendarCheck,
  FileCheck,
  Forklift,
  LayoutDashboard,
  type LucideIcon,
  MailCheck,
  Settings,
  ShoppingBag,
} from "lucide-react";

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
  skills?: string[];
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
        title: "Ops Command Center",
        url: "/dashboard",
        icon: LayoutDashboard,
        skills: ["Sheets API", "Apps Script", "Telemetry", "APIs"],
      },
      {
        title: "Pipeline & Telemetry",
        url: "/dashboard/enterprise",
        icon: Building2,
        accessRequired: "admin",
        skills: ["APIs", "SCADA", "BOM"],
      },
      {
        title: "Retail Fulfillment",
        url: "/dashboard/retail",
        icon: ShoppingBag,
        skills: ["Zapier", "Webhooks", "Sheets"],
      },
      {
        title: "Vendor Compliance",
        url: "/dashboard/vendor-ops",
        icon: Forklift,
        skills: ["Vendors", "Gmail", "Drive"],
      },
      {
        title: "Permits & AHJ",
        url: "/dashboard/permitting",
        icon: FileCheck,
        skills: ["Formulas", "AI Drafts", "Alerts"],
      },
      {
        title: "Calendar & Docs",
        url: "/dashboard/calendar",
        icon: CalendarCheck,
        skills: ["Calendar API", "Docs/PDF", "Gmail"],
      },
      {
        title: "Inbox & AI Drafting",
        url: "/dashboard/inbox",
        icon: MailCheck,
        skills: ["Gmail API", "AI Prompts", "OAuth"],
      },
      {
        title: "Systems & Hosting",
        url: "/dashboard/systems",
        icon: Settings,
        accessRequired: "admin",
        skills: ["OAuth", "DNS/SSL", "SaaS"],
      },
    ],
  },
];
