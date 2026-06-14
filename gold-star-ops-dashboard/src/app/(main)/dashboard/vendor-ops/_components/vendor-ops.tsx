"use client";

import { useMemo, useState } from "react";

import { AlertTriangle, Search } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type VendorOpsRow = {
  name: string;
  category: string;
  scope: string;
  brand: string;
  status: string;
  value: string;
};

export const defaultVendorOpsRows: VendorOpsRow[] = [
  {
    name: "Rich Solar Distribution",
    category: "Hardware Wholesaler",
    scope: "Bulk 3KW Inverter Pallet Freight",
    brand: "Solar 2SK",
    status: "In Transit via LTL",
    value: "$14,250",
  },
  {
    name: "North Texas Structural PE Group",
    category: "Structural Engineering Stamp",
    scope: "120kW Roof Load Assessment",
    brand: "Solar 3SK",
    status: "Awaiting PE Signature",
    value: "$3,200",
  },
  {
    name: "Lone Star Electrical & Interconnection",
    category: "Field Subcontractor",
    scope: "Hunt County Combiner Box Upgrade",
    brand: "Yellow Star",
    status: "On-Site Crew Dispatched",
    value: "$8,500",
  },
  {
    name: "DFW Solar Appointment Setters",
    category: "Marketing Agency / Lead Gen",
    scope: "Commercial Roof Pre-Qualification Run",
    brand: "Solar 3SK",
    status: "Completed (Pay-Per-Sit Out)",
    value: "$1,800",
  },
];

function statusVariant(status: string) {
  if (status.includes("Awaiting")) return "secondary";
  if (status.includes("Completed")) return "outline";
  return "default";
}

export function VendorOps({ vendors = defaultVendorOpsRows }: { vendors?: VendorOpsRow[] }) {
  const [query, setQuery] = useState("");
  const filteredVendors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return vendors;

    return vendors.filter((vendor) =>
      [vendor.name, vendor.category, vendor.scope, vendor.brand, vendor.status, vendor.value]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, vendors]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-semibold text-2xl tracking-tight">Vendor Ops</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Focused dispatch, freight logistics, and professional contractor pipeline for active solar operations.
        </p>
      </div>

      <Alert className="border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200">
        <AlertTriangle className="size-4" />
        <AlertDescription className="font-medium text-amber-900 dark:text-amber-200">
          Critical Path Blockage: Solar 3SK Frisco Commercial Plaza Project cannot transition to structural assembly
          until North Texas Structural PE Group uploads verified structural engineering weight-load assessment
          blueprints.
        </AlertDescription>
      </Alert>

      <Card className="min-h-[calc(100vh-18rem)]">
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-col gap-1">
            <CardTitle>Master Vendor Data Table</CardTitle>
            <CardDescription>Dispatch, freight, and contractor status by operating brand.</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Filter vendors, scopes, or status..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.name}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.category}</TableCell>
                    <TableCell>{vendor.scope}</TableCell>
                    <TableCell>{vendor.brand}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(vendor.status)}>{vendor.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{vendor.value}</TableCell>
                  </TableRow>
                ))}
                {filteredVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
