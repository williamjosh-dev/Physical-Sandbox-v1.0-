import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import Scene from './Scene'; // Adjust path if needed
export default function PhysicsCanvas() {
    // 1. Declare the state here
    const [trajectory, setTrajectory] = useState([]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const runSimulation = async (userPrompt) => {
        const res = await fetch('http://localhost:4173/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userPrompt })
        });
        const data = await res.json();
        const formattedTrajectory = data.y.map((stateRow) => {
            if (data.model_type === 'rocket') {
                const rEarth = 6371000;
                // stateRow[0] is the altitude from your SciPy state vector
                return [0, rEarth + stateRow[0], 0];
            }
            else if (data.model_type === 'orbital') {
                // stateRow[0] and stateRow[1] are your X and Y position coordinates
                return [stateRow[0], stateRow[1], 0];
            }
            return;
        });
        // 2. Update state here
        setTrajectory(formattedTrajectory);
    };
    return (_jsx("div", { style: { width: '100%', height: '100%', position: 'relative' }, children: _jsx(Scene, { trajectory: trajectory, currentFrame: currentFrame, isPlaying: isPlaying, onFrameAdvance: (nextFrame) => setCurrentFrame(nextFrame) }) }));
}
