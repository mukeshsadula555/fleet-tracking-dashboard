import React from 'react';
import tripsStore from '../store';

const TripList: React.FC = () => {
  const tripStates = tripsStore.getTripStates();
  const fleetMetrics = tripsStore.fleetMetrics;
  return (
    <div>
      <h3>Fleet Summary</h3>
      <div className="small">Total trips: {fleetMetrics.totalTrips} — Active: {fleetMetrics.active} — Cancelled: {fleetMetrics.cancelled}</div>
      <h4 style={{marginTop:12}}>Trips</h4>
      <div>
        {tripStates.map(t => (
          <div key={t.tripId} className="tripCard">
            <strong>{t.tripId}</strong>
            <div className="small">events: {t.totalEvents} — processed: {t.pointer} — completed: {String(t.completed)}</div>
            <div className="small">last: {t.lastEvent ? new Date(t.lastEvent.timestamp).toISOString() : '—'}</div>
            <div className="small">pos: {t.lastEvent?.lat?.toFixed?.(4) || '—'}, {t.lastEvent?.lon?.toFixed?.(4) || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripList;
