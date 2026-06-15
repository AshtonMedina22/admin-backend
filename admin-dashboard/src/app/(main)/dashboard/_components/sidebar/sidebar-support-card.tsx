import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="gap-0 border-sidebar-border bg-sidebar-accent/60 py-0 shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-2.5 pt-2.5 pb-0">
        <CardTitle className="text-[var(--brand-3sk-text)] text-xs">Workbook-backed demo</CardTitle>
        <CardDescription className="text-[11px] leading-snug">
          Proof-of-capability site showing how Google Sheets workflows can power executive, retail, vendor, calendar,
          and systems views.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
