import type { EntityBrand } from "./types";

export interface WebsiteHealth {
  id: string;
  siteDomain: string;
  company: EntityBrand;
  status: "URGENT" | "HEALTHY";
  platform: string;
  hosting: string;
  sslValid: boolean;
  sslStatus: string;
  lastChecked: string;
}

export interface SoftwareSubscription {
  id: string;
  toolName: string;
  monthlyCost: number;
  accountOwner: string;
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
    sslStatus: "CRITICAL - SSL handshake failing on base domain",
    lastChecked: "Dynamic: 4 days overdue",
  },
  {
    id: "web-002",
    siteDomain: "shop.solar2sk.com",
    company: "Solar2SK",
    status: "HEALTHY",
    platform: "WooCommerce on WordPress",
    hosting: "DreamHost",
    sslValid: true,
    sslStatus: "OPERATIONAL - active retail customer traffic",
    lastChecked: "2026-06-13",
  },
  {
    id: "web-003",
    siteDomain: "solar3k.com",
    company: "Solar3K",
    status: "HEALTHY",
    platform: "Next.js",
    hosting: "Vercel",
    sslValid: true,
    sslStatus: "OPERATIONAL - active SSL binding",
    lastChecked: "2026-06-13",
  },
  {
    id: "web-004",
    siteDomain: "yellowstarpower.com",
    company: "Yellow Star",
    status: "HEALTHY",
    platform: "Next.js",
    hosting: "Vercel",
    sslValid: true,
    sslStatus: "OPERATIONAL - active SSL binding",
    lastChecked: "2026-06-11",
  },
];

export const softwareSubscriptionData: SoftwareSubscription[] = [
  {
    id: "sub-001",
    toolName: "DreamHost Server Stack",
    monthlyCost: 45,
    accountOwner: "Builder Ops",
    category: "Hosting",
    serves: "PHP/WordPress retail storefront (shop.solar2sk.com)",
    renewal: "Jul 13, 2026",
  },
  {
    id: "sub-002",
    toolName: "Vercel Pro Tier",
    monthlyCost: 20,
    accountOwner: "Builder Ops",
    category: "Hosting",
    serves: "Next.js commercial landing pages (Solar 3SK / Yellow Star Power)",
    renewal: "Jul 1, 2026",
  },
  {
    id: "sub-003",
    toolName: "Zapier Team Tier",
    monthlyCost: 49,
    accountOwner: "Builder Ops",
    category: "Automation",
    serves: "WooCommerce webhooks, lead forms, Google Sheets sync",
    renewal: "Jul 15, 2026",
  },
  {
    id: "sub-004",
    toolName: "DocuSign Corporate Pro",
    monthlyCost: 45,
    accountOwner: "Builder Ops",
    category: "Contracts",
    serves: "Solar 3SK engineering layouts and power consultation contracts",
    renewal: "Jun 28, 2026",
  },
  {
    id: "sub-005",
    toolName: "QuickBooks Online",
    monthlyCost: 90,
    accountOwner: "Builder Ops",
    category: "Finance",
    serves: "Retail invoicing ledger and cross-entity financial reconciliation",
    renewal: "Jul 1, 2026",
  },
];

export const totalMonthlySpend = softwareSubscriptionData.reduce((acc, item) => acc + item.monthlyCost, 0);
export const urgentAlertsCount = websiteHealthData.filter((site) => site.status === "URGENT").length;
