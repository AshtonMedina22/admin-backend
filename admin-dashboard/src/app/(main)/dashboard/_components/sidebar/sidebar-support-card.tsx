import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="gap-0 border-sidebar-border bg-sidebar-accent/60 py-0 shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-2 py-1.5">
        <CardTitle className="text-[var(--brand-3sk-text)] text-[10px] uppercase tracking-wide">Workbook demo</CardTitle>
        <CardDescription className="line-clamp-2 text-[10px] leading-snug">
          Sheets-backed ops views for executive, retail, vendor, and systems workflows.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
