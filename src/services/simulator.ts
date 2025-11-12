import type { TripEvent, TripData, LoadedData } from "../types";

export type SimOptions = {
  speedMultiplier?: number; // e.g. 1, 5, 10
  tickIntervalMs?: number; // real ms interval for simulation tick
};

export type SimState = {
  simulationTime: Date;
  playing: boolean;
  speed: number;
};

export type SimCallback = (payload: {
  now: Date;
  events: { tripId: string; event: TripEvent }[];
}) => void;

export class Simulator {
  private data: TripData[] = [];
  private subscribers: SimCallback[] = [];
  private simTime: Date | null = null;
  private realLastTick: number = 0;
  private playing = false;
  private speed = 1;
  private tickHandle: number | null = null;
  private tickMs = 500; // how often we advance simulated time (real ms)

  loadData(data: LoadedData) {
    // sort events per trip
    this.data = data.trips.map((t) => ({
      ...t,
      events: t.events
        .slice()
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()),
    }));
    // set simTime to earliest event
    const earliest = this.data
      .flatMap((t) => t.events)
      .reduce((acc, e) => {
        const d = new Date(e.ts);
        return acc === null || d < acc ? d : acc;
      }, null as Date | null);
    if (earliest) this.simTime = new Date(earliest);
  }

  subscribe(cb: SimCallback) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  start() {
    if (!this.simTime) return;
    this.playing = true;
    this.realLastTick = performance.now();
    if (this.tickHandle == null) this.tickHandle = window.setInterval(() => this.tick(), this.tickMs);
  }

  pause() {
    this.playing = false;
    if (this.tickHandle != null) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  setSpeed(n: number) {
    this.speed = n;
  }

  seek(offsetMs: number) {
    if (!this.simTime) return;
    this.simTime = new Date(this.simTime.getTime() + offsetMs);
    // On seek we also immediately dispatch any events at the new time
    this.emitEvents();
  }

  getState(): SimState {
    return {
      simulationTime: this.simTime ? new Date(this.simTime) : new Date(),
      playing: this.playing,
      speed: this.speed,
    };
  }

  private tick() {
    if (!this.playing || !this.simTime) return;
    const now = performance.now();
    const deltaReal = now - this.realLastTick;
    this.realLastTick = now;
    const deltaSimMs = deltaReal * this.speed;
    this.simTime = new Date(this.simTime.getTime() + deltaSimMs);
    this.emitEvents();
  }

  private emitEvents() {
    if (!this.simTime) return;
    const eventsToEmit: { tripId: string; event: TripEvent }[] = [];
    const simMillis = this.simTime.getTime();

    // For each trip, emit events whose ts <= simTime and not yet emitted.
    // To keep state simple, we'll mark emitted events by adding "__emitted" flag.
    for (const t of this.data) {
      for (const e of t.events) {
        const eMillis = new Date(e.ts).getTime();
        // @ts-ignore
        if (eMillis <= simMillis && !(e as any).__emitted) {
          eventsToEmit.push({ tripId: t.tripId, event: e });
          // @ts-ignore
          (e as any).__emitted = true;
        }
      }
    }
    if (eventsToEmit.length > 0) {
      for (const s of this.subscribers) {
        s({ now: new Date(this.simTime), events: eventsToEmit });
      }
    }
  }
}
