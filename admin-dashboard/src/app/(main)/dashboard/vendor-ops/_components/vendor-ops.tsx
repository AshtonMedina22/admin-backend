"use client";

import { useMemo, useState } from "react";

import { AlertTriangle, MapPinned, Search, ShieldAlert, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGrid3Class,
  dashPageClass,
  dashPageHeaderClass,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

function complianceVariant(status: ComplianceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Verified Active") return "outline";
  if (status === "General Liability Expiring") return "secondary";
  return "destructive";
}

function compliancePrefix(status: ComplianceStatus): string {
  if (status === "Verified Active") return "✅";
  if (status === "General Liability Expiring") return "⚠️";
  return "⛔";
}

function tradeTagClass(specialty: string) {
  const normalized = specialty.toLowerCase();
  if (normalized.includes("electrical") || normalized.includes("interconnection")) {
    return "border-cyan-500/20 bg-cyan-950/30 text-cyan-300";
  }
  if (normalized.includes("regulatory") || normalized.includes("zoning")) {
    return "border-amber-500/20 bg-amber-950/30 text-amber-300";
  }
  return "border-lime-500/20 bg-lime-950/20 text-lime-300";
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
  return (
    <div className={cn(dashKpiGrid3Class, "grid-cols-1 md:grid-cols-3")}>
      <Card size="sm" className={cn("border-emerald-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Users className="size-4 text-emerald-500" />
            Active Subcontractor Crews
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">12</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Roof, electrical, and permit partner crews available for field execution.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-emerald-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <MapPinned className="size-4 text-emerald-500" />
            Live Field Assignments
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{Math.max(6, activeAssignments)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Active sites, permit audits, and interconnection dispatch lanes.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-amber-500 border-l-4 bg-amber-500/5", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ShieldAlert className="size-4 text-amber-500" />
            Compliance Renewal Alerts
          </CardDescription>
          <CardTitle className="font-mono text-2xl text-amber-600 tabular-nums">
            {Math.max(1, complianceRisks)}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          General Liability / COI renewal exposure requiring owner-visible follow-up.
        </CardContent>
      </Card>
    </div>
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
        <h1 className="font-semibold text-2xl tracking-tight">Vendor Ops</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Field labor pools, subcontractor assignments, and insurance compliance for multi-tenant solar operations.
        </p>
      </div>

      <VendorKpiStrip
        activeAssignments={activeAssignments || activeVendorAssignments}
        complianceRisks={complianceRisks}
      />

      <Card className="border-amber-500/30 bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-4 md:p-5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-amber-200 text-xs leading-relaxed md:text-sm">
            Critical Path Blockage: 3SK Frisco Commercial Plaza cannot transition to structural assembly until North
            Texas Structural PE Group uploads verified load assessment blueprints. North TX Racking Crews general
            liability certificate expires in 14 days.
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[calc(100vh-22rem)]">
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-col gap-1">
            <CardTitle>Solar Field Partner Matrix</CardTitle>
            <CardDescription>
              Regional subcontractor coverage, live assignments, and General Liability compliance status.
            </CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Filter vendors, regions, or compliance..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-zinc-900">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Partner</TableHead>
                  <TableHead>Specialty Type</TableHead>
                  <TableHead>Regional Coverage</TableHead>
                  <TableHead>Active Assignments</TableHead>
                  <TableHead>Compliance Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="border-zinc-900">
                    <TableCell className="max-w-[12rem] whitespace-normal py-2 font-medium">{vendor.name}</TableCell>
                    <TableCell className="py-2">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 font-bold font-mono text-[10px] uppercase tracking-wider",
                          tradeTagClass(vendor.specialtyType),
                        )}
                      >
                        {vendor.specialtyType}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 font-mono text-xs">{vendor.region}</TableCell>
                    <TableCell className="py-2 font-mono tabular-nums">{assignmentLabel(vendor)}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant={complianceVariant(vendor.complianceStatus)} className="gap-1 font-normal">
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
    </div>
  );
}
