"use client";

import { ScrollText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Card key={lane.title}>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="size-4" />
                {lane.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-4">
              <div className="rounded-md border bg-muted/35 p-4">
                <div className="font-medium">{lane.card}</div>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="size-2 rounded-full bg-primary" />
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
