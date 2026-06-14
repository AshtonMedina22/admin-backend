import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarEvent = {
  brand: string;
  text: string;
  variant: "default" | "secondary" | "outline";
};

export const defaultCalendarEvents: Record<number, CalendarEvent[]> = {
  15: [
    {
      brand: "Solar 3SK",
      text: "Submit zoning variance paperwork to City of Plano Building Inspections Department (60kW Auto Body Build).",
      variant: "secondary",
    },
  ],
  18: [
    {
      brand: "Solar 2SK",
      text: "Inbound bulk freight pallet arrival from Rich Solar at Wylie Warehouse.",
      variant: "default",
    },
  ],
  22: [
    {
      brand: "Yellow Star Power",
      text: "Oncor On-Site Utility Engineering Field Inspection window for Hunt County 60kW Asset expansion tie-in.",
      variant: "outline",
    },
  ],
  26: [
    {
      brand: "Solar 3SK",
      text: "Structural engineer on-site roof load assessment walk at Frisco Commercial Plaza.",
      variant: "secondary",
    },
  ],
};

const monthCells = Array.from({ length: 35 }, (_, index) => {
  const day = index;
  return {
    key: `june-2026-cell-${index}`,
    day: day >= 1 && day <= 30 ? day : null,
  };
});

export function CalendarPage({
  calendarEvents = defaultCalendarEvents,
}: {
  calendarEvents?: Record<number, CalendarEvent[]>;
}) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-semibold text-2xl tracking-tight">Calendar</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Full month view mapping operational dependencies, municipal schedules, freight movement, and installation
          timelines.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>June 2026 Operational Calendar</CardTitle>
          <CardDescription>
            Municipal permitting, warehouse freight, utility inspections, and roof assessment windows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 border-t border-l text-sm">
            {weekdays.map((weekday) => (
              <div key={weekday} className="border-r border-b bg-muted/40 px-3 py-2 font-medium text-muted-foreground">
                {weekday}
              </div>
            ))}
            {monthCells.map((cell) => (
              <div key={cell.key} className="min-h-36 border-r border-b bg-card p-3 empty:bg-muted/15">
                {cell.day && (
                  <div className="grid gap-2">
                    <div className="font-medium text-sm tabular-nums">{cell.day}</div>
                    {calendarEvents[cell.day]?.map((event) => (
                      <div key={`${cell.day}-${event.brand}`} className="rounded-md border bg-background p-2">
                        <Badge variant={event.variant} className="mb-2">
                          [{event.brand}]
                        </Badge>
                        <p className="text-xs leading-relaxed">{event.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
