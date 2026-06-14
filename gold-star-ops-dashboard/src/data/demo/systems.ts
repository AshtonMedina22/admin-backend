import type { EntityBrand } from "./types";

export interface WebsiteHealth {
  id: string;
  siteDomain: string;
  company: EntityBrand;
  status: "URGENT" | "HEALTHY";
  platform: string;
  hosting: string;
  sslValid: boolean;
  lastChecked: string;
}

export interface SoftwareSubscription {
  id: string;
  toolName: string;
  monthlyCost: number;
  accountOwner: "T. Khan" | "S. Khan";
  category: string;
  serves: string;
  renewal: string;
}

export const websiteHealthData: WebsiteHealth[] = [
  {
    id: "web-001",
    siteDomain: "solar2sk.com",
    company: "Solar2SK",
    status: "URGENT",
    platform: "WordPress",
    hosting: "DreamHost",
    sslValid: false,
    lastChecked: "2026-06-12",
  },
  {
    id: "web-002",
    siteDomain: "www.solar2sk.com",
    company: "Solar2SK",
    status: "HEALTHY",
    platform: "WordPress",
    hosting: "DreamHost",
    sslValid: true,
    lastChecked: "2026-06-13",
  },
  {
    id: "web-003",
    siteDomain: "solar3k.com",
    company: "Solar3K",
    status: "HEALTHY",
    platform: "WordPress",
    hosting: "DreamHost",
    sslValid: true,
    lastChecked: "2026-06-13",
  },
  {
    id: "web-004",
    siteDomain: "yellowstarpower.com",
    company: "Yellow Star",
    status: "HEALTHY",
    platform: "WordPress",
    hosting: "DreamHost",
    sslValid: true,
    lastChecked: "2026-06-11",
  },
];

export const softwareSubscriptionData: SoftwareSubscription[] = [
  {
    id: "sub-001",
    toolName: "Google Workspace",
    monthlyCost: 72,
    accountOwner: "T. Khan",
    category: "Productivity",
    serves: "All companies",
    renewal: "Jul 1, 2026",
  },
  {
    id: "sub-002",
    toolName: "DreamHost",
    monthlyCost: 45,
    accountOwner: "T. Khan",
    category: "Hosting",
    serves: "Websites",
    renewal: "Jul 13, 2026",
  },
  {
    id: "sub-003",
    toolName: "OpenSolar",
    monthlyCost: 199,
    accountOwner: "T. Khan",
    category: "Design",
    serves: "Solar 3SK",
    renewal: "Aug 1, 2026",
  },
  {
    id: "sub-004",
    toolName: "DocuSign",
    monthlyCost: 40,
    accountOwner: "S. Khan",
    category: "Contracts",
    serves: "All companies",
    renewal: "Jun 28, 2026",
  },
  {
    id: "sub-005",
    toolName: "SolarEdge Monitoring",
    monthlyCost: 85,
    accountOwner: "T. Khan",
    category: "Telemetry",
    serves: "Yellow Star / 3SK",
    renewal: "Sep 1, 2026",
  },
  {
    id: "sub-006",
    toolName: "Zapier",
    monthlyCost: 29,
    accountOwner: "S. Khan",
    category: "Automation",
    serves: "Lead alerts",
    renewal: "Jul 15, 2026",
  },
];

export const totalMonthlySpend = softwareSubscriptionData.reduce((acc, item) => acc + item.monthlyCost, 0);
export const urgentAlertsCount = websiteHealthData.filter((site) => site.status === "URGENT").length;
