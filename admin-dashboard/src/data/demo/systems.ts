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
  accountOwner: "Alex Morgan" | "Jordan Lee";
  category: string;
  serves: string;
  renewal: string;
}

export const websiteHealthData: WebsiteHealth[] = [
  {
    id: "web-001",
    siteDomain: "novaretail.demo",
    company: "Solar2SK",
    status: "URGENT",
    platform: "WordPress",
    hosting: "DreamHost",
    sslValid: false,
    sslStatus: "CRITICAL - SSL handshake failing on base domain",
    lastChecked: "2026-06-12",
  },
  {
    id: "web-002",
    siteDomain: "shop.novaretail.demo",
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
    siteDomain: "summitci.demo",
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
    siteDomain: "cedargrid.demo",
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
    accountOwner: "Alex Morgan",
    category: "Hosting",
    serves: "PHP/WordPress retail storefront (shop.novaretail.demo)",
    renewal: "Jul 13, 2026",
  },
  {
    id: "sub-002",
    toolName: "Vercel Pro Tier",
    monthlyCost: 20,
    accountOwner: "Alex Morgan",
    category: "Hosting",
    serves: "Next.js commercial landing pages (Summit C&I Group / Cedar Grid Assets)",
    renewal: "Jul 1, 2026",
  },
  {
    id: "sub-003",
    toolName: "Zapier Team Tier",
    monthlyCost: 49,
    accountOwner: "Alex Morgan",
    category: "Automation",
    serves: "WooCommerce webhooks, lead forms, Google Sheets sync",
    renewal: "Jul 15, 2026",
  },
  {
    id: "sub-004",
    toolName: "DocuSign Corporate Pro",
    monthlyCost: 45,
    accountOwner: "Alex Morgan",
    category: "Contracts",
    serves: "Summit C&I Group engineering layouts and power consultation contracts",
    renewal: "Jun 28, 2026",
  },
  {
    id: "sub-005",
    toolName: "QuickBooks Online",
    monthlyCost: 90,
    accountOwner: "Jordan Lee",
    category: "Finance",
    serves: "Retail invoicing ledger and cross-entity financial reconciliation",
    renewal: "Jul 1, 2026",
  },
];

export const totalMonthlySpend = softwareSubscriptionData.reduce((acc, item) => acc + item.monthlyCost, 0);
export const urgentAlertsCount = websiteHealthData.filter((site) => site.status === "URGENT").length;
