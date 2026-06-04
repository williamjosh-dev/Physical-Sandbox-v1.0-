import { useState } from 'react';
import Scene from './Scene'; // Adjust path if needed

export default function PhysicsCanvas() {
  // 1. Declare the state here
  const [trajectory, setTrajectory] = useState<number[][]>([]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const runSimulation = async (userPrompt: string) => {
    const res = await fetch('http://localhost:4173/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });
    
    const data = await res.json();
    
    const formattedTrajectory = data.y.map((stateRow: number[]) => {
      if (data.model_type === 'rocket') {
        const rEarth = 6371000;
        // stateRow[0] is the altitude from your SciPy state vector
        return [0, rEarth + stateRow[0], 0]; 
      } else if (data.model_type === 'orbital') {
        // stateRow[0] and stateRow[1] are your X and Y position coordinates
        return [stateRow[0], stateRow[1], 0];
      }
      return;
    });

    // 2. Update state here
    setTrajectory(formattedTrajectory);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3. Pass it down to your Scene component as a prop */}
      <Scene 
        trajectory={trajectory} 
        currentFrame={currentFrame} 
        isPlaying={isPlaying} 
        onFrameAdvance={(nextFrame) => setCurrentFrame(nextFrame)}
      />
    </div>
  );
}
