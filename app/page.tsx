import db from "@/lib/db";

type EventMode = "online" | "offline";

type LandingEvent = {
  id: number;
  title: string;
  description: string | null;
  meeting_type: string;
  start_date: string | Date;
  start_time: string | null;
  address: string | null;
  link: string | null;
  mode: EventMode;
};

const eventTypeLabels: Record<string, string> = {
  meetup: "Meetup",
  workshop: "Workshop",
  special_events: "Special event",
};

const formatEventDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const getEventSummary = (description: string | null) =>
  (description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function getEvents(): Promise<LandingEvent[]> {
  try {
    const model = db as unknown as {
      NConnect: { findAll: (options: object) => Promise<LandingEvent[]> };
    };

    return await model.NConnect.findAll({
      order: [["start_date", "ASC"], ["start_time", "ASC"]],
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">NammaQA</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">Upcoming events</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Meetups, workshops, and special events from the NammaQA community.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16" aria-label="Upcoming events">
        {events.length === 0 ? (
          <p className="text-slate-600">No events are scheduled right now.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isOnline = event.mode === "online";
              const summary = getEventSummary(event.description);

              return (
                <article key={event.id} className="flex min-h-64 flex-col border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium text-slate-500">
                      {eventTypeLabels[event.meeting_type] || "Event"}
                    </p>
                    <span
                      className={`shrink-0 border px-2.5 py-1 text-xs font-semibold ${
                        isOnline
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-bold">{event.title}</h2>
                  {summary ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p> : null}

                  <div className="mt-auto border-t border-slate-100 pt-5 text-sm text-slate-600">
                    <p className="font-medium text-slate-800">
                      {formatEventDate(event.start_date)}{event.start_time ? ` at ${event.start_time.slice(0, 5)}` : ""}
                    </p>
                    <p className="mt-1">{isOnline ? "Online event" : event.address || "Venue to be announced"}</p>
                  </div>

                  {event.link ? (
                    <a
                      className="mt-5 inline-flex w-fit border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-700 hover:text-white"
                      href={event.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Register
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
