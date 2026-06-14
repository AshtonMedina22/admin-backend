import { loadEnvConfig } from "@next/env";
import { google } from "googleapis";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

loadEnvConfig(process.cwd());

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

const sheetsToWrite = {
  Dashboard: [
    ["section", "item", "Yellow Star Power", "Solar 2SK", "Solar 3SK", "total", "detail", "priority", "action"],
    [
      "company_roles",
      "Umbrella / developer",
      "Large commercial development, capital markets, asset strategy",
      "",
      "",
      "",
      "Parent entity",
      "",
      "",
    ],
    [
      "company_roles",
      "Residential / DIY",
      "",
      "Hybrid solar kits, backup power, portable power sales",
      "",
      "",
      "Consumer-facing",
      "",
      "",
    ],
    [
      "company_roles",
      "Commercial engineering",
      "",
      "",
      "C&I consulting, structural design, system engineering",
      "",
      "Commercial delivery",
      "",
      "",
    ],
    ["executive_kpi", "Active Projects", "1", "6", "4", "11", "Current open work across companies", "", ""],
    ["executive_kpi", "Lead Pipeline", "2", "7", "4", "13", "$438.5k weighted value", "", ""],
    [
      "executive_kpi",
      "Active Revenue",
      "$275,000",
      "$96,500",
      "$67,000",
      "$438,500",
      "Demo operating pipeline",
      "",
      "",
    ],
    ["executive_kpi", "Upcoming Deadlines", "1", "2", "2", "5", "Items due within 30 days", "", ""],
    [
      "urgent_alert",
      "SSL renewal required",
      "",
      "solar2sk.com certificate expires soon",
      "",
      "",
      "Renew certificate in DreamHost",
      "Critical",
      "Renew via DreamHost",
    ],
    [
      "urgent_alert",
      "Permit follow-up overdue",
      "",
      "Brown residence has been in permit review for 23 days",
      "",
      "",
      "Request permit status update",
      "Critical",
      "Follow up vendor",
    ],
    [
      "urgent_alert",
      "Solar 3SK design scope due",
      "",
      "",
      "Commercial plan set needs final review",
      "",
      "Finalize engineering scope and pricing",
      "Warning",
      "Review with design partner",
    ],
    [
      "urgent_alert",
      "Yellow Star Power asset review",
      "Large commercial valuation model needs owner review",
      "",
      "",
      "",
      "Review assumptions",
      "Warning",
      "Review model",
    ],
  ],
  "Lead Tracker": [
    [
      "lead_id",
      "timestamp",
      "client_business_name",
      "entity_brand",
      "project_type",
      "source",
      "status",
      "expected_value",
      "estimated_kw_size",
    ],
    [
      "LD-201",
      "2026-06-10",
      "Frisco Office Complex",
      "Solar 3SK",
      "B2B Commercial Roof",
      "DFW Appointment Setters",
      "New",
      "$145,000",
      "120 kW",
    ],
    [
      "LD-202",
      "2026-06-11",
      "Garrett Miller",
      "Solar 2SK",
      "Residential DIY Kit",
      "Organic Search",
      "Contacted",
      "$4,200",
      "3.5 kW",
    ],
    [
      "LD-203",
      "2026-06-12",
      "Wylie Industrial Park",
      "Yellow Star Power",
      "Microgrid / Asset Dev",
      "Executive Referral",
      "In Progress",
      "$450,000",
      "300 kW",
    ],
    [
      "LD-204",
      "2026-06-13",
      "Plano Auto Body Shop",
      "Solar 3SK",
      "B2B Commercial Roof",
      "Cold Outreach",
      "New",
      "$85,000",
      "60 kW",
    ],
  ],
  "Solar 3SK Bids & Contracts": [
    [
      "proposal_id",
      "client_name",
      "scope_of_work",
      "opensolar_layout",
      "structural_pe_status",
      "interconnection_status",
      "contract_status",
      "bid_total",
    ],
    [
      "BID-301",
      "McKinney Logistics Hub",
      "150kW Layout Design",
      "Completed",
      "Pending Review",
      "Oncor App Filed",
      "Sent via DocuSign",
      "$185,000",
    ],
    [
      "BID-302",
      "Rockwall Retail Strip",
      "90kW Structural Assessment",
      "In Progress",
      "Awaiting Draft",
      "Not Started",
      "Reviewing Scope",
      "$110,000",
    ],
    [
      "BID-303",
      "Denton Multi-Family Array",
      "200kW Grid Interconnection",
      "Completed",
      "PE Approved",
      "Approved by Utility",
      "Executed",
      "$240,000",
    ],
  ],
  "Project Tracker": [
    [
      "project_id",
      "project_name",
      "entity_brand",
      "assigned_crew",
      "phase_milestone",
      "on_site_permit_status",
      "solaredge_api_status",
      "estimated_completion",
    ],
    [
      "PRJ-101",
      "Hunt County Asset Expansion",
      "Yellow Star Power",
      "Lone Star Electrical",
      "Combiner Box Tie-In",
      "Approved (Local)",
      "Live - 48.2kW",
      "2026-06-30",
    ],
    [
      "PRJ-102",
      "Frisco Commercial Plaza",
      "Solar 3SK",
      "NTX Structural Group",
      "Structural Load Testing",
      "Pending Municipality",
      "Provisioned (Offline)",
      "2026-07-15",
    ],
    [
      "PRJ-103",
      "Wylie Warehouse Restock",
      "Solar 2SK",
      "Internal Ops Core",
      "Inbound Freight Check",
      "N/A (Retail)",
      "N/A",
      "2026-06-18",
    ],
  ],
  "Website & Systems": [
    ["asset", "company", "platform", "hosting", "domain_expires", "ssl_expires", "last_backup", "status", "notes"],
    [
      "yellowstarpower.com",
      "Yellow Star Power",
      "WordPress",
      "DreamHost",
      "6/1/2026",
      "6/1/2026",
      "6/11/2025",
      "Healthy",
      "Umbrella company site",
    ],
    [
      "solar2sk.com",
      "Solar 2SK",
      "WordPress",
      "DreamHost",
      "3/15/2026",
      "6/20/2025",
      "6/13/2025",
      "SSL urgent",
      "Residential and DIY solar hardware",
    ],
    [
      "shop.solar2sk.com",
      "Solar 2SK",
      "WooCommerce",
      "DreamHost",
      "3/15/2026",
      "12/15/2025",
      "6/13/2025",
      "Healthy",
      "Direct-to-consumer store",
    ],
    [
      "solar3sk.com",
      "Solar 3SK",
      "WordPress",
      "DreamHost",
      "9/20/2026",
      "9/20/2025",
      "6/12/2025",
      "Healthy",
      "Commercial consulting and engineering",
    ],
    ["Google Workspace", "Shared", "SaaS", "Google", "Monthly", "N/A", "N/A", "Active", "Email and cloud files"],
    ["QuickBooks Online", "Shared", "SaaS", "Intuit", "Monthly", "N/A", "N/A", "Active", "Multi-entity bookkeeping"],
  ],
};

async function getCredentials(): Promise<ServiceAccountCredentials> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as ServiceAccountCredentials;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const filePath = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    return JSON.parse(await readFile(filePath, "utf8")) as ServiceAccountCredentials;
  }

  throw new Error("Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.");
}

async function main() {
  if (!spreadsheetId) {
    throw new Error("Set GOOGLE_SHEET_ID.");
  }

  const credentials = await getCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const tabs = new Map(
    metadata.data.sheets?.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]) ?? [],
  );

  const requests = [];
  const bidsSheetId = tabs.get("Solar3K Bids");
  const contractsSheetId = tabs.get("Solar3K Contracts");

  if (typeof bidsSheetId === "number" && !tabs.has("Solar 3SK Bids & Contracts")) {
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: bidsSheetId, title: "Solar 3SK Bids & Contracts" },
        fields: "title",
      },
    });
  }

  if (typeof contractsSheetId === "number" && !tabs.has("Archive - Solar3K Contracts")) {
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: contractsSheetId, title: "Archive - Solar3K Contracts" },
        fields: "title",
      },
    });
  }

  if (!tabs.has("Solar3K Bids") && !tabs.has("Solar 3SK Bids & Contracts")) {
    requests.push({ addSheet: { properties: { title: "Solar 3SK Bids & Contracts" } } });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  }

  for (const [sheetName, values] of Object.entries(sheetsToWrite)) {
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `'${sheetName}'!A1:Z200` });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  }

  console.log("Workbook cleaned for Yellow Star Power / Solar 2SK / Solar 3SK demo model.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
