import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card
      size="sm"
      className="gap-0 border-[#1B1B3A]/10 bg-[#FFFFFF]/80 py-0 text-[#1B1B3A] shadow-none group-data-[collapsible=icon]:hidden"
    >
      <CardHeader className="px-2.5 pt-2.5 pb-0">
        <CardTitle className="text-[#6A00FF] text-xs">Workbook-backed demo</CardTitle>
        <CardDescription className="text-[#1B1B3A]/70 text-[11px] leading-snug">
          Proof-of-capability site showing how Google Sheets workflows can power executive, retail, vendor, calendar,
          and systems views.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
