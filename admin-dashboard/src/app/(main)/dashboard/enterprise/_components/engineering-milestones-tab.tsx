"use client";

import { ScrollText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineeringBomConsole } from "./engineering-bom-console";

const milestoneLanes = [
  { title: "CAD & Electric Usage Review", card: "Plano Auto Body Shop (60kW)" },
  { title: "OpenSolar Layout Mapping", card: "Frisco Commercial Plaza (120kW)" },
  { title: "Municipal Permitting", card: "Rockwall Retail Strip (90kW)" },
];

export function EngineeringMilestonesTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {milestoneLanes.map((lane) => (
          <Card key={lane.title} className="min-h-72">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="size-4" />
                {lane.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/35 p-4">
                <div className="font-medium">{lane.card}</div>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="size-2 rounded-full bg-primary" />
                  Design advancement pipeline
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
