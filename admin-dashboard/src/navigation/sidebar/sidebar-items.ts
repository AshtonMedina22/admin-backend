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
        title: "Command Center",
        url: "/dashboard",
        icon: LayoutDashboard,
        skills: ["Sheets API", "Apps Script", "Server Cache"],
      },
      {
        title: "Enterprise Hub",
        url: "/dashboard/enterprise",
        icon: Building2,
        accessRequired: "admin",
        skills: ["SolarEdge API", "SCADA Telemetry", "BOM Automation"],
      },
      {
        title: "Retail Hub",
        url: "/dashboard/retail",
        icon: ShoppingBag,
        skills: ["Webhook Ingestion", "Zapier Middleware", "Deduplication Engine"],
      },
      {
        title: "Vendor Operations",
        url: "/dashboard/vendor-ops",
        icon: Forklift,
        skills: ["Compliance Cron", "Gmail Draft API", "Batch Write Guard"],
      },
      {
        title: "Permitting Queue",
        url: "/dashboard/permitting",
        icon: FileCheck,
        skills: ["Installable Triggers", "Next.js Edge Routes", "AI Context Mapping"],
      },
      {
        title: "Inbox & Drafting",
        url: "/dashboard/inbox",
        icon: MailCheck,
        skills: ["Gmail REST API", "OAuth Client Auth", "Deterministic Prompting"],
      },
      {
        title: "Tasks & Schedule",
        url: "/dashboard/calendar",
        icon: CalendarCheck,
        skills: ["Calendar API", "DocuSign Connect", "Idempotent Syncer"],
      },
      {
        title: "Systems",
        url: "/dashboard/systems",
        icon: Settings,
        accessRequired: "admin",
        skills: ["IAM Access Control", "Quota Guardrails", "RBAC Protection"],
      },
    ],
  },
];
