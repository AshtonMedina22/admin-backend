"use client";

import { useMemo, useState } from "react";

import { AlertTriangle, MapPinned, Search, ShieldAlert, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DashImplementationLabel } from "@/components/dashboard/implementation-label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  activeVendorAssignments,
  type ComplianceStatus,
  complianceRiskCount,
  type VendorRecord,
  vendorsData,
} from "@/data/demo/vendors";
import {
  dashAlertBannerClass,
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGrid3Class,
  dashPageClass,
  dashPageHeaderClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashKpiValueClass,
  dashProseClass,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { implementationLabels } from "@/lib/implementation-labels";
import { cn } from "@/lib/utils";

const vendorComplianceSteps = [
  "Vendor record updated in the Google Sheets vendor registry.",
  "Scheduled Apps Script checks COI expiration dates against a 14-day renewal window.",
  "Gmail draft is generated for human review with the vendor record and renewal request.",
  "Drive folder URL from the row is included so COI / W-9 uploads land in the correct repository.",
  "Compliance Status and Last Outreach are written back together to reduce Sheets API round trips.",
];

const vendorComplianceScript = `function checkVendorComplianceRenewals() {
  const workbookId = PropertiesService.getScriptProperties().getProperty('OPS_WORKBOOK_ID');
  if (!workbookId) throw new Error('Missing OPS_WORKBOOK_ID script property');

  const sheet = SpreadsheetApp.openById(workbookId).getSheetByName('Contractors & Vendors');
  if (!sheet) throw new Error('Missing Contractors & Vendors sheet');

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return;

  const headers = values[0].map(String);
  const col = (name) => headers.indexOf(name);
  const required = [
    'Vendor Partner',
    'Vendor Email',
    'COI Expiration',
    'Drive Folder URL',
    'Compliance Status',
    'Last Outreach',
  ];
  if (required.some((name) => col(name) === -1)) {
    throw new Error('Missing required vendor compliance headers');
  }

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;

  values.slice(1).forEach((row, index) => {
    const rawDate = row[col('COI Expiration')];
    if (!rawDate) return;

    const expiresAt = new Date(rawDate);
    const expiryMidnight = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
    const daysUntilExpiration = Math.round((expiryMidnight.getTime() - todayMidnight.getTime()) / msPerDay);
    const status = String(row[col('Compliance Status')]);

    if (Number.isNaN(daysUntilExpiration) || daysUntilExpiration < 0 || daysUntilExpiration > 14) return;
    if (status === 'Needs Renewal') return;

    GmailApp.createDraft(
      row[col('Vendor Email')],
      'COI renewal required within 14 days',
      'Please upload updated COI / W-9 documents to this Drive folder: ' +
        row[col('Drive Folder URL')] +
        '\n\nVendor: ' +
        row[col('Vendor Partner')],
      { name: 'Demo Ops Compliance Desk' }
    );

    const sheetRow = index + 2;
    const statusColIndex = col('Compliance Status') + 1;
    sheet.getRange(sheetRow, statusColIndex, 1, 2).setValues([['Needs Renewal', new Date()]]);
  });
}`;

function complianceVariant(status: ComplianceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Verified Active") return "outline";
  if (status === "General Liability Expiring") return "secondary";
  return "destructive";
}

function compliancePrefix(status: ComplianceStatus): string {
  if (status === "Verified Active") return "OK";
  if (status === "General Liability Expiring") return "WARN";
  return "BLOCK";
}

function tradeTagClass(specialty: string) {
  const normalized = specialty.toLowerCase();
  if (normalized.includes("electrical") || normalized.includes("interconnection")) {
    return entityBrandStyles.solar3k.badge;
  }
  if (normalized.includes("regulatory") || normalized.includes("zoning")) {
    return entityBrandStyles.yellowStar.badge;
  }
  return entityBrandStyles.solar2sk.badge;
}

function assignmentLabel(vendor: VendorRecord) {
  if (vendor.name.includes("TX Permit")) return `${vendor.activeAssignments} Active Audits`;
  if (vendor.name.includes("Kaufman")) return `${vendor.activeAssignments} Pending Dispatch`;
  return `${vendor.activeAssignments} Live Sites`;
}

function VendorKpiStrip({
  activeAssignments,
  complianceRisks,
}: {
  activeAssignments: number;
  complianceRisks: number;
}) {
  const cardClass = cn(dashSurfaceCardClass, entityBrandStyles.solar2sk.accentBar, "min-h-[7.25rem]");
  const contentClass = cn("line-clamp-2 text-muted-foreground text-[11px] leading-snug", dashCardContentClass);

  return (
    <div className={cn(dashKpiGrid3Class, "grid-cols-1 gap-3 md:grid-cols-3")}>
      <Card size="sm" className={cardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Users className={cn("size-4", entityBrandStyles.solar2sk.icon)} />
            Active Subcontractor Crews
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>12</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          Roof, electrical, and permit partner crews available for field execution.
        </CardContent>
      </Card>
      <Card size="sm" className={cardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <MapPinned className={cn("size-4", entityBrandStyles.solar2sk.icon)} />
            Live Field Assignments
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{Math.max(6, activeAssignments)}</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          Active sites, permit audits, and interconnection dispatch lanes.
        </CardContent>
      </Card>
      <Card size="sm" className={cn(dashSurfaceCardClass, "min-h-[7.25rem]")}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ShieldAlert className={cn("size-4", entityBrandStyles.yellowStar.icon)} />
            Compliance Renewal Alerts
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{Math.max(1, complianceRisks)}</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          General Liability / COI renewal exposure requiring owner-visible follow-up.
        </CardContent>
      </Card>
    </div>
  );
}

function VendorComplianceAutomationCard() {
  return (
    <Card className={dashSurfaceCardClass}>
      <CardHeader className={dashCardHeaderClass}>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <DashImplementationLabel variant={implementationLabels.vendorCompliance.variant}>
              {implementationLabels.vendorCompliance.title}
            </DashImplementationLabel>
            <CardDescription>
              Production wiring for turning vendor records into renewal drafts, Drive document routing, and compliance
              status updates.
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("w-fit font-mono", statusStyles.live)}>
            Sheets -&gt; Apps Script -&gt; Gmail -&gt; Drive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-4 lg:grid-cols-12", dashCardContentClass)}>
        <div className="space-y-3 lg:col-span-5">
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className={cn("font-mono text-[11px] uppercase tracking-[0.2em]", entityBrandStyles.solar2sk.text)}>
              Workflow contract
            </p>
            <ol className="mt-3 max-h-[380px] space-y-2 overflow-y-auto pr-1 text-muted-foreground text-xs leading-relaxed">
              {vendorComplianceSteps.map((step, index) => (
                <li key={step} className="rounded-lg border border-border bg-card/60 p-2.5">
                  <span className={cn("block font-mono text-[10px] uppercase tabular-nums", entityBrandStyles.solar2sk.text)}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className={cn(dashProseClass, "text-xs")}>
            Accurate implementation pattern: install a time-driven Apps Script trigger, read the vendor registry from
            Sheets, create Gmail drafts instead of auto-sending, include the row-level Drive folder URL, and write the
            resulting renewal status back to the compliance ledger for auditability.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-border border-b pb-2">
            <p className="font-semibold text-[11px] text-foreground uppercase tracking-wide">Registry Automation Script</p>
            <span className="font-mono text-[10px] text-muted-foreground">checkVendorComplianceRenewals()</span>
          </div>
          <pre className={cn(dashCodeBlockClass, "max-h-[390px] overflow-y-auto text-[10px]")}>
            <code>{vendorComplianceScript}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

export function VendorOps({ vendors = vendorsData }: { vendors?: VendorRecord[] }) {
  const [query, setQuery] = useState("");

  const filteredVendors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return vendors;

    return vendors.filter((vendor) =>
      [
        vendor.name,
        vendor.specialtyType,
        vendor.region,
        vendor.specialty,
        vendor.complianceStatus,
        String(vendor.activeAssignments),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, vendors]);

  const activeAssignments = vendors.reduce((sum, vendor) => sum + vendor.activeAssignments, 0);
  const complianceRisks =
    vendors.filter((vendor) => vendor.complianceStatus !== "Verified Active").length || complianceRiskCount;

  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Vendor Operations</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Field labor pools, subcontractor assignments, and insurance compliance for multi-tenant solar operations.
        </p>
      </div>

      <VendorKpiStrip
        activeAssignments={activeAssignments || activeVendorAssignments}
        complianceRisks={complianceRisks}
      />

      <Card className={dashSurfaceCardClass}>
        <CardContent className={cn(dashAlertBannerClass, "flex items-start gap-2 border-0 px-3 py-2", dashCardContentClass)}>
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="text-xs leading-snug">
            <strong>Critical Path Blockage:</strong> 3SK Frisco Commercial Plaza is held for structural PE load
            assessment blueprints. North TX Racking Crews general liability certificate expires in 14 days.
          </p>
        </CardContent>
      </Card>

      <Card className={dashCardClass}>
        <CardHeader className={cn("gap-3 border-border border-b bg-muted/20", dashCardHeaderClass)}>
          <div className="flex flex-col gap-1">
            <CardTitle>Solar Field Partner Matrix</CardTitle>
            <CardDescription>
              Regional subcontractor coverage, live assignments, and General Liability compliance status.
            </CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 border-border bg-card pl-8 text-foreground text-xs placeholder:text-muted-foreground"
              placeholder="Filter vendors, regions, or compliance..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className={dashCardContentClass}>
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-border">
            <Table className="min-w-[940px] table-fixed text-[11px]">
              <TableHeader>
                <TableRow className="h-9 bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[25%] font-semibold text-foreground">Vendor Partner</TableHead>
                  <TableHead className="w-[25%] font-semibold text-foreground">Specialty Type</TableHead>
                  <TableHead className="w-[20%] font-semibold text-foreground">Regional Coverage</TableHead>
                  <TableHead className="w-[15%] font-semibold text-foreground">Active Assignments</TableHead>
                  <TableHead className="w-[15%] font-semibold text-foreground">Compliance Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="h-10 border-border/60 hover:bg-muted/30">
                    <TableCell className="truncate py-2 font-medium">{vendor.name}</TableCell>
                    <TableCell className="py-2">
                      <span
                        className={cn(
                          "inline-flex max-w-full truncate rounded-md border px-2 py-0.5 font-bold font-mono text-[10px] uppercase tracking-tight",
                          tradeTagClass(vendor.specialtyType),
                        )}
                      >
                        {vendor.specialtyType}
                      </span>
                    </TableCell>
                    <TableCell className="truncate py-2 font-mono text-xs">{vendor.region}</TableCell>
                    <TableCell className="whitespace-nowrap py-2 font-mono tabular-nums">
                      {assignmentLabel(vendor)}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant={complianceVariant(vendor.complianceStatus)} className="max-w-full gap-1 truncate font-normal text-[10px]">
                        <span aria-hidden>{compliancePrefix(vendor.complianceStatus)}</span>
                        {vendor.complianceStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No vendors match the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VendorComplianceAutomationCard />
    </div>
  );
}
