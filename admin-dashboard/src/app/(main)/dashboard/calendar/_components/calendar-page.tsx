import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calendarEventsByDay } from "@/data/demo/calendar-events";
import { entityBrandTone } from "@/lib/entity-brand";
import { dashCardClass, dashPageClass, dashPageHeaderClass, dashSectionCardContentClass, dashSectionCardHeaderClass } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarEvent = {
  brand: string;
  event?: string;
  type?: string;
  time?: string;
  notes?: string;
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

function eventAccentClass(brand: string) {
  const tone = entityBrandTone(brand);
  if (tone === "solar3k") return "border-l-indigo-500";
  if (tone === "yellowStar") return "border-l-amber-500";
  if (tone === "systems") return "border-l-red-500";
  return "border-l-emerald-500";
}

export function CalendarPage({
  calendarEvents = defaultCalendarEvents,
}: {
  calendarEvents?: Record<number, CalendarEvent[]>;
}) {
  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Calendar</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Full month view mapping operational dependencies, municipal schedules, freight movement, and installation
          timelines.
        </p>
      </div>

      <Card size="sm" className={dashCardClass}>
        <CardHeader className={cn("border-b", dashSectionCardHeaderClass)}>
          <CardTitle>June 2026 Operational Calendar</CardTitle>
          <CardDescription>
            Field operations calendar - municipal permitting, warehouse freight, and utility inspection windows across
            North Texas operating units.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="grid grid-cols-7 border-t border-l text-sm">
            {weekdays.map((weekday) => (
              <div
                key={weekday}
                className="border-r border-b bg-muted/40 px-2 py-2 font-medium text-muted-foreground text-xs"
              >
                {weekday}
              </div>
            ))}
            {monthCells.map((cell) => (
              <div key={cell.key} className="min-h-24 border-r border-b bg-card p-1.5 empty:bg-muted/15">
                {cell.day && (
                  <div className="grid gap-2">
                    <div className="font-medium font-mono text-sm tabular-nums">{cell.day}</div>
                    {calendarEvents[cell.day]?.map((event) => (
                      <div
                        key={`${cell.day}-${event.brand}-${event.event || event.text}`}
                        className={cn("rounded-md border border-l-4 bg-background p-2", eventAccentClass(event.brand))}
                      >
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <EntityBrandBadge brand={event.brand} />
                          {event.type && (
                            <span className="rounded border bg-muted/50 px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground">
                              {event.type}
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-xs leading-snug">{event.event || event.text}</div>
                        {event.time && (
                          <div className="mt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                            {event.time}
                          </div>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                          {event.notes || event.text}
                        </p>
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
