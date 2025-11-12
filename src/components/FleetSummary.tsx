type TripStatus = {
  tripId: string;
  name: string;
  status: string;
  progressPct: number;
};

export default function FleetSummary({ items }: { items: TripStatus[] }) {
  const total = items.length;
  const active = items.filter((i) => i.status === "active").length;
  const cancelled = items.filter((i) => i.status === "cancelled").length;
  const completed = items.filter((i) => i.status === "complete" || i.status === "delivered").length;

  return (
    <div className="fleet-summary">
      <h3>Fleet Summary</h3>
      <div>Total trips: {total} — Active: {active} — Cancelled: {cancelled} — Completed: {completed}</div>
      <div className="fleet-list">
        {items.map((t) => (
          <div key={t.tripId} className="trip-summary-card">
            <div className="trip-row">
              <div className="trip-name">{t.name}</div>
              <div className="trip-status">{t.status}</div>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${t.progressPct}%` }} />
            </div>
            <div className="small">{Math.round(t.progressPct)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
