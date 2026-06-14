import Link from "next/link";

import { Lock, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex size-14 items-center justify-center rounded-xl border bg-muted/40">
          <Shield className="size-7 text-primary" />
        </div>
        <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
          Thureen Enterprises &bull; Core Systems Management
        </h1>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
          Authorized Personnel Only. Cross-entity directory authentication required for Solar 2SK, Solar 3SK, and
          Yellow Star Power telemetry access.
        </p>
        <div className="mt-8 flex items-center gap-2 text-muted-foreground text-xs">
          <Lock className="size-3.5" />
          Secure internal operational gateway
        </div>
        <Button asChild className="mt-6" size="lg">
          <Link href="/dashboard" prefetch={false}>
            Enter Command Center
          </Link>
        </Button>
      </div>
    </div>
  );
}
