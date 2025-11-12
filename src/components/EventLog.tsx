
import type { TripEvent } from "../types";


export default function EventLog({ entries }: { entries: { ts: string; tripId: string; event: TripEvent }[] }) {
  return (
    <div className="event-log">
      <h3>Event Log</h3>
      <div className="log-entries">
        {entries.slice().reverse().map((e, idx) => (
          <div key={idx} className="log-entry">
            <div className="log-time">{new Date(e.ts).toISOString()}</div>
            <div className="log-body">
              <strong>{e.tripId}</strong> — {e.event.eventType || "position"} @ ({e.event.lat.toFixed(4)}, {e.event.lng.toFixed(4)}) {e.event.speed ? `— ${e.event.speed}mph` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
