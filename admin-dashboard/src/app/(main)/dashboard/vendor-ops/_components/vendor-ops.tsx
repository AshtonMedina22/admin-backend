"use client";

import { useMemo, useState } from "react";

import { AlertTriangle, ClipboardCheck, Search, ShieldAlert, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  activeVendorAssignments,
  complianceRiskCount,
  type ComplianceStatus,
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

function VendorKpiStrip({
  activeAssignments,
  complianceRisks,
  vendorCount,
}: {
  activeAssignments: number;
  complianceRisks: number;
  vendorCount: number;
}) {
  return (
    <div className={dashKpiGrid3Class}>
      <Card size="sm" className={dashCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Users className="size-4" />
            Active Sub-Assignments
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">{activeAssignments}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Live site crews, PE reviews, and permit audits in progress
        </CardContent>
      </Card>
      <Card size="sm" className={dashCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ShieldAlert className="size-4" />
            Compliance Flags
          </CardDescription>
          <CardTitle className={cn("text-2xl tabular-nums", complianceRisks > 0 && "text-amber-600")}>{complianceRisks}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Insurance / COI certifications requiring renewal or review
        </CardContent>
      </Card>
      <Card size="sm" className={dashCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ClipboardCheck className="size-4" />
            Vendor Partner Pool
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">{vendorCount}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Install crews, equipment suppliers, and regulatory specialists
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
        vendorCount={vendors.length}
      />

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-amber-950 text-sm leading-relaxed dark:text-amber-200">
            Critical Path Blockage: Solar 3SK Frisco Commercial Plaza cannot transition to structural assembly until North Texas Structural PE Group uploads verified load assessment blueprints. North TX Racking Crews general liability certificate expires in 14 days.
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[calc(100vh-22rem)]">
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-col gap-1">
            <CardTitle>Contractor & Vendor Registry</CardTitle>
            <CardDescription>Resource allocation, regional coverage, and compliance certification status.</CardDescription>
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
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Partner</TableHead>
                  <TableHead>Specialty Type</TableHead>
                  <TableHead>Regional Coverage</TableHead>
                  <TableHead>Active Sub-Assignments</TableHead>
                  <TableHead>General Liability Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.specialtyType}</TableCell>
                    <TableCell>{vendor.region}</TableCell>
                    <TableCell className="tabular-nums">
                      {vendor.activeAssignments}{" "}
                      {vendor.category === "service"
                        ? vendor.activeAssignments === 1
                          ? "Active Audit"
                          : "Active Audits"
                        : vendor.activeAssignments === 1
                          ? "Live Site"
                          : "Live Sites"}
                    </TableCell>
                    <TableCell>
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
