import Link from "next/link";

import { RouteOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashCardClass, dashCardContentClass, dashCardHeaderClass } from "@/lib/dashboard-ui";

export default function DashboardNotFoundPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card className={`${dashCardClass} mx-auto mt-8 w-full max-w-2xl`}>
        <CardHeader className={dashCardHeaderClass}>
          <CardTitle className="flex items-center gap-2 text-xl">
            <RouteOff className="size-5 text-cyan-300" />
            Routing Exception
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            The requested application route slug does not match any authenticated Google Sheet tab mapping identifiers.
          </CardDescription>
        </CardHeader>
        <CardContent className={`${dashCardContentClass} flex flex-col gap-4`}>
          <p className="text-slate-400 text-sm leading-relaxed">
            Valid workbook tabs include Command Center metrics, Retail Ops, Solar3K Bids, Contractors &amp; Vendors, and
            Website &amp; Systems. Check the sidebar for registered module routes or return to the Command Center.
          </p>
          <Button asChild className="w-fit border border-cyan-400/30 bg-white/5 text-cyan-100 hover:bg-white/10">
            <Link href="/dashboard" prefetch={false}>
              Return to Command Center
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
