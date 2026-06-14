import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calendarEventsByDay } from "@/data/demo/calendar-events";
import {
  dashCardClass,
  dashPageClass,
  dashPageHeaderClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
} from "@/lib/dashboard-ui";
import { entityBrandTone } from "@/lib/entity-brand";
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

function flattenEvents(calendarEvents: Record<number, CalendarEvent[]>) {
  return Object.entries(calendarEvents)
    .flatMap(([day, events]) => events.map((event) => ({ day: Number(day), ...event })))
    .sort((a, b) => a.day - b.day || String(a.time ?? "").localeCompare(String(b.time ?? "")));
}

function AgendaFeed({ events }: { events: Array<CalendarEvent & { day: number }> }) {
  return (
    <Card size="sm" className={cn("border-indigo-500/70 border-l-4 bg-neutral-900/50", dashCardClass)}>
      <CardHeader className={cn("border-neutral-800 border-b", dashSectionCardHeaderClass)}>
        <CardTitle>Upcoming Critical Milestones</CardTitle>
        <CardDescription>Glance-and-go timeline for active municipal, freight, and utility milestones.</CardDescription>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="flex flex-col space-y-3">
          {events.map((event) => (
            <div
              key={`${event.day}-${event.brand}-${event.event || event.text}`}
              className={cn(
                "flex min-w-0 gap-3 rounded-lg border border-neutral-800 border-l-4 bg-neutral-900 p-3",
                eventAccentClass(event.brand),
              )}
            >
              <div className="grid shrink-0 content-start gap-1 text-right">
                <span className="font-mono font-semibold text-sm tabular-nums tracking-tight">Jun {event.day}</span>
                {event.time ? (
                  <span className="font-mono text-muted-foreground text-xs tabular-nums tracking-tight">
                    {event.time}
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="font-medium text-sm leading-tight">{event.event || event.text}</h3>
                  <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                  {event.type ? (
                    <span className="whitespace-nowrap rounded border border-neutral-800 bg-muted/40 px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground">
                      {event.type}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-muted-foreground text-xs">{event.notes || event.text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarPage({
  calendarEvents = defaultCalendarEvents,
}: {
  calendarEvents?: Record<number, CalendarEvent[]>;
}) {
  const agendaEvents = flattenEvents(calendarEvents);

  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Calendar</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Full month view mapping operational dependencies, municipal schedules, freight movement, and installation
          timelines.
        </p>
      </div>

      <AgendaFeed events={agendaEvents} />

      <Card size="sm" className={cn("hidden md:block", dashCardClass)}>
        <CardHeader className={cn("border-neutral-800 border-b", dashSectionCardHeaderClass)}>
          <CardTitle>June 2026 Month Reference Grid</CardTitle>
          <CardDescription>
            Compact monthly reference - municipal permitting, warehouse freight, and utility inspection windows.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="mx-auto w-full max-w-5xl">
            <div className="grid grid-cols-7 border-neutral-800 border-t border-l text-sm">
              {weekdays.map((weekday) => (
                <div
                  key={weekday}
                  className="border-neutral-800 border-r border-b bg-muted/30 px-2 py-2 font-medium text-muted-foreground text-xs"
                >
                  {weekday}
                </div>
              ))}
              {monthCells.map((cell) => (
                <div
                  key={cell.key}
                  className="max-h-[120px] min-h-24 overflow-hidden border-neutral-800 border-r border-b bg-card p-1.5 empty:bg-muted/15"
                >
                  {cell.day && (
                    <div className="grid gap-1.5">
                      <div className="font-medium font-mono text-sm tabular-nums">{cell.day}</div>
                      {calendarEvents[cell.day]?.map((event) => (
                        <div
                          key={`${cell.day}-${event.brand}-${event.event || event.text}`}
                          className={cn(
                            "rounded-md border border-l-4 bg-neutral-900 p-1.5",
                            eventAccentClass(event.brand),
                          )}
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-1">
                            <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                            {event.time ? (
                              <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                                {event.time}
                              </span>
                            ) : null}
                          </div>
                          <div className="line-clamp-2 font-medium text-[11px] leading-snug">
                            {event.event || event.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
