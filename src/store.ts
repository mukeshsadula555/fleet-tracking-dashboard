import type { TripEvent as FleetEvent } from './types';

type TripState = {
  tripId: string;
  lastEvent?: FleetEvent;
  pointer: number;
  events: FleetEvent[];
  completed: boolean;
};

class TripsStore {
  trips: Map<string, TripState> = new Map();
  fleetMetrics = {
    totalTrips: 0,
    active: 0,
    cancelled: 0
  };

  loadEvents(events: FleetEvent[]) {
    // Group by tripId
    const map = new Map<string, FleetEvent[]>();
    for (const ev of events) {
      if (!map.has(ev.tripId)) map.set(ev.tripId, []);
      map.get(ev.tripId)!.push(ev);
    }

    // Sort events and store each trip's state
    for (const [tripId, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          new Date(a.ts).getTime() - new Date(b.ts).getTime() // ✅ use "ts" (your field in TripEvent)
      );

      const state: TripState = { tripId, pointer: 0, events: arr, completed: false };
      this.trips.set(tripId, state); // ✅ actually store state
    }

    this.fleetMetrics.totalTrips = this.trips.size;
  }

  processUpTo(simTimeMs: number) {
    // Advance each trip's pointer to events <= simTimeMs
    for (const [, state] of this.trips.entries()) {
      let changed = false;

      while (
        state.pointer < state.events.length &&
        new Date(state.events[state.pointer].ts).getTime() <= simTimeMs // ✅ use "ts"
      ) {
        state.lastEvent = state.events[state.pointer];
        state.pointer++;
        changed = true;
      }

      if (state.pointer >= state.events.length && !state.completed) {
        state.completed = true;
      }

      if (changed) {
        // could emit event to listeners or update map layer outside
      }
    }

    // Update fleet metrics
    let active = 0;
    let cancelled = 0;

    for (const s of this.trips.values()) {
      if (s.completed) continue;
      active++;
      if (s.lastEvent?.eventType === 'cancelled') cancelled++;
    }

    this.fleetMetrics.active = active;
    this.fleetMetrics.cancelled = cancelled;
  }

  getTripStates() {
    return Array.from(this.trips.values()).map(s => ({
      tripId: s.tripId,
      lastEvent: s.lastEvent,
      pointer: s.pointer,
      totalEvents: s.events.length,
      completed: s.completed
    }));
  }

  getAllLastPositions() {
    const out: { tripId: string; lat: number; lng: number; speed?: number }[] = [];
    for (const s of this.trips.values()) {
      if (s.lastEvent && s.lastEvent.lat && s.lastEvent.lng) {
        out.push({
          tripId: s.tripId,
          lat: s.lastEvent.lat,
          lng: s.lastEvent.lng,
          speed: s.lastEvent.speed
        });
      }
    }
    return out;
  }
}

export default new TripsStore();
