import Link from "next/link";

import { RouteOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardNotFoundPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card className="mx-auto mt-8 w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <RouteOff className="size-5 text-muted-foreground" />
            Routing Exception
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            The requested application route slug does not match any authenticated Google Sheet tab mapping identifiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Valid workbook tabs include Command Center metrics, Retail Ops, Solar3K Bids, Contractors &amp; Vendors, and
            Website &amp; Systems. Check the sidebar for registered module routes or return to the Command Center.
          </p>
          <Button asChild className="w-fit">
            <Link href="/dashboard" prefetch={false}>
              Return to Command Center
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
