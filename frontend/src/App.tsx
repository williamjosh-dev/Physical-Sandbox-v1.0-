import React, { useCallback, useState } from 'react';
import Sidebar from './components/Sidebar';
import ControlPanel from './components/ControlPanel';
import Scene from './canvas/Scene';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const simulate = useSimulation();
  const [statusText, setStatusText] = useState('Awaiting Telemetry...');
  const [trajectory, setTrajectory] = useState<number[][]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTriggerSimulation = useCallback(
    async (promptText: string) => {
      setStatusText('Computing API Path...');
      const result = await simulate(promptText);

      setStatusText(result.message || 'Simulation complete');
      if (result.success) {
        setTrajectory(result.y || []);
        setCurrentFrame(0);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    },
    [simulate],
  );

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame);
  }, []);

  const handleFrameAdvance = useCallback((nextFrame: number) => {
    setCurrentFrame(nextFrame);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Scene
        trajectory={trajectory}
        currentFrame={currentFrame}
        isPlaying={isPlaying}
        onFrameAdvance={handleFrameAdvance}
      />
      <Sidebar onTriggerSimulation={handleTriggerSimulation} statusText={statusText} />
      <ControlPanel
        currentFrame={currentFrame}
        totalFrames={trajectory.length}
        onFrameChange={handleFrameChange}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </div>
  );
}
