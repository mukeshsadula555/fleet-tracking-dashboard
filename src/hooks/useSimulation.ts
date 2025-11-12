import { useEffect, useRef, useState } from 'react';
import tripsStore from '../store';

export default function useSimulation(initialTimeMs: number) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const simRef = useRef<number>(initialTimeMs);
  const lastRealRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);
  // external update trigger - returns current sim time
  const tick = () => {
    const now = performance.now();
    const dt = now - lastRealRef.current;
    lastRealRef.current = now;
    if (playing) {
      simRef.current += dt * speed;
      tripsStore.processUpTo(simRef.current);
    }
  };

  useEffect(() => {
    function loop() {
      tick();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, speed]);

  return {
    getSimTimeMs: () => simRef.current,
    play: () => { lastRealRef.current = performance.now(); setPlaying(true); },
    pause: () => setPlaying(false),
    playing,
    setSpeed,
    speed,
    seekTo: (ms: number) => { simRef.current = ms; tripsStore.processUpTo(ms); }
  };
}
