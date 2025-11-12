

type Props = {
  simState: { simulationTime: Date; playing: boolean; speed: number };
  onPlay: () => void;
  onPause: () => void;
  onSetSpeed: (n: number) => void;
  onSeek: (ms: number) => void;
};

export default function ControlBar({ simState, onPlay, onPause, onSetSpeed, onSeek }: Props) {
  const { simulationTime, playing, speed } = simState;

  return (
    <div className="controls">
      <div className="controls-row">
        <button onClick={onPlay} disabled={playing}>Play</button>
        <button onClick={onPause} disabled={!playing}>Pause</button>

        <label>
          Speed
          <select
            value={String(speed)}
            onChange={(e) => onSetSpeed(Number(e.target.value))}
          >
            <option value="1">1x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
          </select>
        </label>

        <button onClick={() => onSeek(-60 * 1000)}>◀ 1m</button>
        <button onClick={() => onSeek(60 * 1000)}>1m ▶</button>

        <div className="sim-time">Simulation time: {simulationTime.toISOString()}</div>
      </div>
    </div>
  );
}
