import { useEffect, useMemo, useRef, useState } from "react";
import { Simulator } from "./services/simulator";
import type { TripData, TripEvent } from "./types";
import ControlBar from "./components/ControlBar";
import MapView from "./components/MapView";
import FleetSummary from "./components/FleetSummary";
import EventLog from "./components/EventLog";

import "./App.css";

type Loaded = { trips: TripData[] };

export default function App() {
  const [data, setData] = useState<Loaded | null>(null);
  const simRef = useRef<Simulator | null>(null);
  const [simState, setSimState] = useState({ simulationTime: new Date(), playing: false, speed: 1 });
  const [latestPos, setLatestPos] = useState<Record<string, TripEvent>>({});
  const [log, setLog] = useState<{ ts: string; tripId: string; event: TripEvent }[]>([]);

  useEffect(() => {
    fetch("/data/trips.json")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        const sim = new Simulator();
        sim.loadData(json);
        simRef.current = sim;

        // subscribe to simulator events
        sim.subscribe(({ now, events }) => {
          setSimState((s) => ({ ...s, simulationTime: now }));
          // update latest positions and log entries
          setLatestPos((prev) => {
            const copy = { ...prev };
            for (const ev of events) {
              copy[ev.tripId] = ev.event;
            }
            return copy;
          });
          setLog((prev) => [
            ...prev,
            ...events.map((e) => ({ ts: new Date().toISOString(), tripId: e.tripId, event: e.event })),
          ]);
        });

        // update sim state regularly (for UI)
        const uiTick = setInterval(() => {
          if (simRef.current) {
            setSimState(simRef.current.getState());
          }
        }, 500);
        return () => clearInterval(uiTick);
      });
  }, []);

  const play = () => {
    if (!simRef.current) return;
    simRef.current.start();
    setSimState((s) => ({ ...s, playing: true }));
  };
  const pause = () => {
    simRef.current?.pause();
    setSimState((s) => ({ ...s, playing: false }));
  };
  const setSpeed = (n: number) => {
    simRef.current?.setSpeed(n);
    setSimState((s) => ({ ...s, speed: n }));
  };
  const seek = (ms: number) => {
    simRef.current?.seek(ms);
    // ensure UI updates
    setSimState((s) => ({ ...s, simulationTime: new Date(s.simulationTime.getTime() + ms) }));
  };

  const posList = useMemo(() => {
    return Object.entries(latestPos).map(([tripId, ev]) => ({
      lat: ev.lat,
      lng: ev.lng,
      label: tripId,
      info: `${ev.eventType || "position"} • ${ev.speed ?? ""}mph`,
    }));
  }, [latestPos]);

  const tripStatus = useMemo(() => {
    if (!data) return [];
    return data.trips.map((t) => {
      const evs = t.events;
      // compute progress based on emitted flags
      const total = evs.length;
      const emitted = evs.filter((e) => (e as any).__emitted).length;
      // derive status from last emitted event
      const lastEmitted = evs.slice().reverse().find((e) => (e as any).__emitted);
      const status = lastEmitted?.eventType || (emitted > 0 ? "active" : "pending");
      const pct = total === 0 ? 0 : (emitted / total) * 100;
      return { tripId: t.tripId, name: t.name, status, progressPct: pct };
    });
  }, [data, log, latestPos]);

  return (
    <div className="app">
      <header className="header">
        <h1>MapUp — Fleet Dashboard</h1>
        <div className="sim-loaded">Sim loaded: {data ? "true" : "false"}</div>
      </header>

      <div className="top-controls">
        <ControlBar
          simState={simState}
          onPlay={play}
          onPause={pause}
          onSetSpeed={setSpeed}
          onSeek={seek}
        />
      </div>

      <div className="layout">
        <div className="left">
          <div className="map-box">
            <MapView positions={posList} />
          </div>
          <FleetSummary items={tripStatus} />
        </div>

        <div className="right">
          <EventLog entries={log} />
        </div>
      </div>

      <footer className="footer">
        <small>Sample dashboard — replace /public/data/trips.json with your dataset</small>
      </footer>
    </div>
  );
}
