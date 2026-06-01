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

  // New state variables to capture theory payloads from backend
  const [theoryTitle, setTheoryTitle] = useState('Aerospace Physics Lab');
  const [theoryConcept, setTheoryConcept] = useState('Enter a simulation prompt below to map physical trajectories, study state vectors, and view mathematical formulations.');
  const [equations, setEquations] = useState<string[]>(['\\vec{F} = m\\vec{a}']);

  const handleTriggerSimulation = useCallback(
    async (promptText: string) => {
      setStatusText('Computing API Path...');
      const result = await simulate(promptText);

      setStatusText(result.message || 'Simulation complete');
      if (result.success) {
        setTrajectory(result.y || []);
        setCurrentFrame(0);
        setIsPlaying(true);

        // Map theory fields dynamically if the backend returns them
        if (result.theory) {
          setTheoryTitle(result.theory.title || 'Simulation Run');
          setTheoryConcept(result.theory.core_concept || '');
          setEquations(result.theory.governing_equations || []);
        }
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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#020617', fontFamily: 'monospace' }}>
      
      {/* LEFT SIDE: Theory & Textbook Interface */}
      <div style={{ width: '380px', height: '100%', background: '#030712', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box', zIndex: 10, overflowY: 'auto' }}>
        <h1 style={{ color: '#22d3ee', fontSize: '1.4rem', margin: '0 0 10px 0', borderBottom: '1px solid #06b6d4', paddingBottom: '8px' }}>
          {theoryTitle}
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
          {theoryConcept}
        </p>

        <h3 style={{ color: '#38bdf8', fontSize: '1rem', margin: '0 0 8px 0' }}>Governing Mathematics</h3>
        <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '4px', color: '#38bdf8', fontSize: '1rem', overflowX: 'auto', marginBottom: '20px' }}>
          {equations.map((eq, i) => (
            <div key={i} style={{ padding: '4px 0' }}>{eq}</div>
          ))}
        </div>

        {/* Input prompt component inside our control column */}
        <div style={{ marginTop: 'auto' }}>
          <Sidebar onTriggerSimulation={handleTriggerSimulation} statusText={statusText} />
        </div>
      </div>

      {/* RIGHT SIDE: Production Live Canvas Area */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Scene
          trajectory={trajectory}
          currentFrame={currentFrame}
          isPlaying={isPlaying}
          onFrameAdvance={handleFrameAdvance}
        />
        
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 10 }}>
          <ControlPanel
            currentFrame={currentFrame}
            totalFrames={trajectory.length}
            onFrameChange={handleFrameChange}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </div>
      </div>

    </div>
  );
}
