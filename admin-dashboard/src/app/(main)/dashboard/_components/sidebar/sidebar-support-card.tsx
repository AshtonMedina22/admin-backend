import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Workbook-backed preview</CardTitle>
        <CardDescription>
          Operations views are scoped for executive review across enterprise, retail, vendor, calendar, and systems
          workflows.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
