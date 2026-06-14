import { calendarEventsByDay } from "@/data/demo/calendar-events";
import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarEvent = {
  brand: string;
  text: string;
  variant: "default" | "secondary" | "outline";
};

export const defaultCalendarEvents: Record<number, CalendarEvent[]> = calendarEventsByDay();

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
            Field operations calendar - municipal permitting, warehouse freight, and utility inspection windows across
            North Texas operating units.
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
                        <EntityBrandBadge brand={event.brand} className="mb-2" />
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
