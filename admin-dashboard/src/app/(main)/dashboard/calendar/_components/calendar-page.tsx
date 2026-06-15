import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calendarEventsByDay } from "@/data/demo/calendar-events";
import {
  dashCardClass,
  dashPageClass,
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
  if (tone === "solar3k") return "border-l-2 border-l-cyan-500";
  if (tone === "yellowStar") return "border-l-2 border-l-amber-500";
  if (tone === "systems") return "border-l-2 border-l-rose-500";
  return "border-l-2 border-l-lime-500";
}

function flattenEvents(calendarEvents: Record<number, CalendarEvent[]>) {
  return Object.entries(calendarEvents)
    .flatMap(([day, events]) => events.map((event) => ({ day: Number(day), ...event })))
    .sort((a, b) => a.day - b.day || String(a.time ?? "").localeCompare(String(b.time ?? "")));
}

const calendarSyncSteps = [
  "Calendar tab row is marked Ready to Schedule in the workbook.",
  "Apps Script time trigger reads unsynced rows from the Calendar tab.",
  "Calendar.Events.insert() creates the meeting with attendees and reminders.",
  "The returned calendarEventId is written back to the same row for idempotent updates.",
];

const GOOGLE_CALENDAR_SYNC_SCRIPT = `function syncCalendarRows() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Calendar');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(String);
  const col = (name) => headers.indexOf(name);
  const calendarId = PropertiesService.getScriptProperties().getProperty('OPS_CALENDAR_ID');
  if (!calendarId) throw new Error('Missing OPS_CALENDAR_ID script property');

  rows.slice(1).forEach((row, index) => {
    if (row[col('Status')] !== 'Ready to Schedule') return;
    if (row[col('Calendar Event ID')]) return;

    const event = Calendar.Events.insert({
      summary: row[col('Meeting Title')],
      description: row[col('Next Action')],
      start: { dateTime: new Date(row[col('Start Time')]).toISOString() },
      end: { dateTime: new Date(row[col('End Time')]).toISOString() },
      attendees: String(row[col('Attendees')])
        .split(',')
        .map((email) => ({ email: email.trim() }))
        .filter((attendee) => attendee.email),
      reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }] },
    }, calendarId, { sendUpdates: 'all' });

    sheet.getRange(index + 2, col('Calendar Event ID') + 1).setValue(event.id);
    sheet.getRange(index + 2, col('Status') + 1).setValue('Scheduled');
  });
}`;

const GMAIL_REMINDER_DRAFT_SCRIPT = `function buildMeetingReminderDraft(row) {
  if (row['Meeting Status'] !== 'Needs Reminder') return;

  GmailApp.createDraft(
    row['Vendor Email'],
    'Reminder: ' + row['Project'] + ' / ' + row['Meeting Date'],
    'Meeting: ' + row['Meeting Date'] +
      '\nVendor/AHJ: ' + row['Vendor or AHJ'] +
      '\nProject: ' + row['Project'] +
      '\nNext action: ' + row['Next Action'],
    { name: 'Demo Ops Scheduling Desk' }
  );
}`;

const actionItems = [
  {
    brand: "3SK",
    text: "Follow up with Alex Morgan on the McKinney Logistics Hub CAD blueprint adjustments.",
  },
  {
    brand: "2SK",
    text: "Verify warehouse pull inventory levels for the pending bulk Anenji hybrid inverter freight cargo.",
  },
  {
    brand: "YSP",
    text: "Review Oncor POI interconnection circuit line balance logs ahead of Friday's field review.",
  },
];

function brandTextClass(brand: string) {
  const tone = entityBrandTone(brand);
  if (tone === "solar3k") return "border-cyan-500/30 text-cyan-400";
  if (tone === "yellowStar") return "border-amber-500/30 text-amber-400";
  return "border-lime-500/30 text-lime-400";
}

function brandActionAccentClass(brand: string) {
  const tone = entityBrandTone(brand);
  if (tone === "solar3k") return "border-l-cyan-500";
  if (tone === "yellowStar") return "border-l-amber-500";
  return "border-l-lime-500";
}

function TasksHeader() {
  return (
    <Card className="rounded-xl border border-zinc-900 bg-zinc-900/60 backdrop-blur-md">
      <CardContent className="grid gap-2 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-[11px] text-zinc-400 uppercase tracking-[0.18em]">
            Task Management
          </span>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1 font-mono text-[11px] text-cyan-300">
            3SK · 2SK · YSP
          </span>
        </div>
        <h1 className="text-balance font-bold text-2xl text-zinc-100 tracking-tight md:text-3xl">Tasks & Schedule</h1>
        <p className="max-w-3xl text-sm text-zinc-400 leading-relaxed">
          Operational timelines, multi-company action items, and document automation tracking.
        </p>
      </CardContent>
    </Card>
  );
}

function TaskAndDocumentDeck() {
  return (
    <div className="mb-2 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className="rounded-xl border border-zinc-900 bg-zinc-900/60 backdrop-blur-md">
        <CardHeader className="border-zinc-900 border-b p-5 pb-3">
          <CardTitle>Operational Action Items</CardTitle>
          <CardDescription>
            Current administrative and system priorities sorted by business entity handle.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 pt-4">
          {actionItems.map((item) => (
            <div
              key={item.text}
              className={cn(
                "rounded-lg border border-zinc-900 border-l-2 bg-zinc-950/60 p-3",
                brandActionAccentClass(item.brand),
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 font-mono font-semibold text-[11px] tracking-tight",
                    brandTextClass(item.brand),
                  )}
                >
                  {item.brand}
                </span>
                <p className="font-mono text-xs text-zinc-300 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-zinc-900 bg-zinc-900/60 backdrop-blur-md">
        <CardHeader className="border-zinc-900 border-b p-5 pb-3">
          <CardTitle>Automated Document Tracking</CardTitle>
          <CardDescription>
            Active status of spreadsheet-driven document generation and template workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 pt-4">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-sm text-zinc-100">Project Charter & Agreement Automation</h3>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                Active Listener
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-zinc-400 leading-relaxed">
              Production wiring: DocuSign Connect completion event ➔ Google Apps Script handler ➔ formatted PDF compile
              ➔ shared Google Drive asset folder upload.
            </p>
            <div className="mt-2 border-zinc-950 border-t pt-2 font-mono text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200">Document Assembly Engineering:</strong> Production wiring would parse
              spreadsheet tracking arrays, initialize a Google Docs contract template, populate project metadata and
              custom tables, compile the final agreement PDF, and upload it into a permissioned Google Drive folder by
              entity, project, and document type.
            </div>
          </div>
          <Button className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-300 transition-all hover:bg-zinc-800 hover:text-cyan-400 active:scale-[0.98]">
            📄 Re-Generate System Manifest PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarApiSyncCard() {
  return (
    <Card className="rounded-xl border border-cyan-500/30 border-l-4 border-l-cyan-500 bg-zinc-900/60 backdrop-blur-md">
      <CardHeader className="border-zinc-900 border-b p-5 pb-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Google Calendar API Sync</CardTitle>
            <CardDescription>
              Scripted scheduling workflow that turns workbook rows into calendar events, reminders, and auditable row
              IDs.
            </CardDescription>
          </div>
          <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 font-mono text-[10px] text-cyan-300">
            Calendar.Events.insert()
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 pt-4 lg:grid-cols-[0.85fr_1.25fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/70 p-3">
            <p className="font-mono text-[11px] text-cyan-300 uppercase tracking-[0.18em]">Scheduling contract</p>
            <ol className="mt-3 space-y-2 text-xs text-zinc-400 leading-relaxed">
              {calendarSyncSteps.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="font-mono text-cyan-300 tabular-nums">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3 font-mono text-xs text-zinc-400 leading-relaxed">
            <strong className="text-amber-200">Gmail reminder draft companion:</strong> when a row's meeting status is
            <span className="text-amber-200"> Needs Reminder</span>, Apps Script can build a Gmail draft containing the
            meeting date, vendor/AHJ, project, and next action for human review before sending.
          </div>
        </div>
        <div className="grid gap-3">
          <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-900 bg-black/80 p-4 font-mono text-[10px] text-cyan-200 leading-relaxed">
            <code>{GOOGLE_CALENDAR_SYNC_SCRIPT}</code>
          </pre>
          <pre className="max-h-52 overflow-auto rounded-lg border border-zinc-900 bg-black/80 p-4 font-mono text-[10px] text-amber-200 leading-relaxed">
            <code>{GMAIL_REMINDER_DRAFT_SCRIPT}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaFeed({ events }: { events: Array<CalendarEvent & { day: number }> }) {
  return (
    <Card size="sm" className={cn("border-indigo-500/70 border-l-4 bg-neutral-950/80", dashCardClass)}>
      <CardHeader className={cn("border-neutral-800 border-b", dashSectionCardHeaderClass)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Upcoming Milestones</CardTitle>
            <CardDescription>
              Chronological timeline of active North Texas utility, municipal, and freight events.
            </CardDescription>
          </div>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-[11px] text-indigo-300">
            {events.length} scheduled
          </span>
        </div>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {events.map((event) => (
            <div
              key={`${event.day}-${event.brand}-${event.event || event.text}`}
              className={cn(
                "min-w-0 rounded-xl border border-neutral-800 bg-neutral-900/90 p-3 shadow-[0_0_0_1px_theme(colors.white/0.03)]",
                eventAccentClass(event.brand),
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid w-16 shrink-0 justify-items-center rounded-lg border border-neutral-800 bg-black/30 px-2 py-2 text-center">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Jun</span>
                  <span className="font-bold font-mono text-2xl tabular-nums leading-none">{event.day}</span>
                  {event.time ? (
                    <span className="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">{event.time}</span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                    {event.type ? (
                      <span className="rounded-full border border-neutral-800 bg-muted/40 px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
                        {event.type}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-balance font-semibold text-sm leading-snug">{event.event || event.text}</h3>
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                    {event.notes || event.text}
                  </p>
                </div>
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
      <TasksHeader />

      <TaskAndDocumentDeck />

      <CalendarApiSyncCard />

      <AgendaFeed events={agendaEvents} />

      <div className="hidden md:block">
        <Card size="sm" className={dashCardClass}>
          <CardHeader className={cn("border-neutral-800 border-b", dashSectionCardHeaderClass)}>
            <CardTitle>Month View Reference</CardTitle>
            <CardDescription>Compact 7-column planning reference for desktop review.</CardDescription>
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
    </div>
  );
}
