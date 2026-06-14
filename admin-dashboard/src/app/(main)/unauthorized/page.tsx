import Link from "next/link";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto size-10 text-amber-600" />
          <CardTitle className="mt-3 font-bold text-2xl tracking-tight sm:text-3xl">
            Access Level Warning: Restricted View
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Directory Account &apos;S. Khan (Operations Manager)&apos; does not possess Global Administrative clearance
            to modify core financial-summary tab lines.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground text-sm">
            Multi-tenant RBAC simulation - Enterprise and Systems modules require Global Super Admin scope (T. Khan).
          </p>
          <Button asChild>
            <Link href="/dashboard/retail" prefetch={false}>
              Return to Consumer Retail Hub
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
