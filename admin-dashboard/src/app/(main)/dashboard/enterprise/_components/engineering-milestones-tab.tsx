"use client";

import { ScrollText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashCardContentClass, dashCardHeaderClass, dashSurfaceCardClass } from "@/lib/dashboard-ui";
import { entityBrandStyles } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

import { EngineeringBomConsole } from "./engineering-bom-console";

const milestoneLanes = [
  {
    title: "CAD & Electric Usage Review",
    card: "Plano Auto Body Shop (60kW)",
    update: "Structural PE roof-load engineering analysis finalized; pending municipal zoning sign-off.",
  },
  {
    title: "OpenSolar Layout Mapping",
    card: "Frisco Commercial Plaza (120kW)",
    update: "OpenSolar 3D shading layout locked; verifying line-side tap connection path with Oncor engineers.",
  },
  {
    title: "Municipal Permitting",
    card: "Rockwall Retail Strip (90kW)",
    update: "AHJ plan-set corrections queued; waiting on revised electrical one-line before permit resubmittal.",
  },
];

export function EngineeringMilestonesTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {milestoneLanes.map((lane) => (
          <Card key={lane.title} className={cn(dashSurfaceCardClass, entityBrandStyles.solar3k.accentBar)}>
            <CardHeader className={cn(dashCardHeaderClass, "px-3 pt-3")}>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ScrollText className={cn("size-4", entityBrandStyles.solar3k.icon)} />
                {lane.title}
              </CardTitle>
            </CardHeader>
            <CardContent className={dashCardContentClass}>
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <div className="font-medium text-foreground text-sm">{lane.card}</div>
                <div className="mt-2 flex items-start gap-2 text-muted-foreground text-xs leading-relaxed">
                  <span className="size-2 rounded-full bg-[var(--brand-3sk)]" />
                  {lane.update}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <EngineeringBomConsole />
    </div>
  );
}
