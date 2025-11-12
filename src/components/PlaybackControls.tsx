import React, { useState } from 'react';

type Props = {
  sim: any;
  onSpeedChange?: (n: number) => void;
};

const PlaybackControls: React.FC<Props> = ({ sim, onSpeedChange }) => {
  const [localSpeed, setLocalSpeed] = useState(sim.speed || 1);
  return (
    <div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <button onClick={() => sim.play()}>Play</button>
        <button onClick={() => sim.pause()}>Pause</button>
        <label className="small">Speed</label>
        <select value={localSpeed} onChange={e => { const v = Number(e.target.value); setLocalSpeed(v); sim.setSpeed?.(v); onSpeedChange?.(v); }}>
          <option value={1}>1x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
        </select>
        <button onClick={() => sim.seekTo(sim.getSimTimeMs() - 60_000)}>◀ 1m</button>
        <button onClick={() => sim.seekTo(sim.getSimTimeMs() + 60_000)}>1m ▶</button>
      </div>
      <div className="small">Simulation time: {new Date(sim.getSimTimeMs()).toISOString()}</div>
    </div>
  );
};

export default PlaybackControls;
