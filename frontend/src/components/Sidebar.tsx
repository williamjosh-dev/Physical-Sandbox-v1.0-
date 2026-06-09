import React, { useState } from 'react';

interface SidebarProps {
  onTriggerSimulation: (promptText: string) => Promise<void>;
  statusText: string;
}

export default function Sidebar({ onTriggerSimulation, statusText }: SidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    setIsProcessing(true);
    await onTriggerSimulation(inputValue);
    setIsProcessing(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 10,
      width: '320px',
      backgroundColor: 'rgba(11, 11, 26, 0.85)',
      backdropFilter: 'blur(8px)',
      border: '1px solid #00ffcc',
      borderRadius: '6px',
      padding: '20px',
      color: '#00ffcc',
      fontFamily: 'monospace',
      boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #00ffcc', paddingBottom: '5px' }}>
        🧠 AI SIMULATION PROMPT
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'MODULAR WORKSPACE', prompt: 'Simulate a modular assembly workspace with structural beams, arm actuators, and hovering drone modules.' },
          { label: 'ROCKET', prompt: 'Simulate rocket launch with 50000kg mass and 760000N thrust to reach 100km altitude.' },
          { label: 'ORBITAL', prompt: 'Simulate orbital insertion for a satellite with initial velocity 7800 m/s at 7000 km radius.' },
          { label: 'FIXED WING', prompt: 'Simulate a fixed-wing glider at 1000m altitude with 70m/s speed and gentle pitch control.' },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setInputValue(preset.prompt)}
            style={{
              flex: '1 1 45%',
              backgroundColor: '#021829',
              border: '1px solid #0ea5e9',
              color: '#94a3b8',
              padding: '8px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g., Modular workspace with beam assembly, actuator arms, and hovering drone modules..."
          style={{
            width: '100%',
            height: '100px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid #00ffcc',
            borderRadius: '4px',
            color: '#ffffff',
            padding: '8px',
            fontFamily: 'monospace',
            resize: 'none',
            boxSizing: 'border-box',
            marginBottom: '15px'
          }}
        />
        
        <button
          type="submit"
          disabled={isProcessing}
          style={{
            width: '100%',
            backgroundColor: isProcessing ? '#334155' : '#00ffcc',
            color: '#0b0b1a',
            border: 'none',
            padding: '10px',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace'
          }}
        >
          {isProcessing ? 'COMPUTING PHYSICS...' : 'RUN METRIC SIMULATION'}
        </button>
      </form>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#88aabb' }}>
        <strong>SYSTEM LOG:</strong>
        <div style={{ 
          marginTop: '5px', 
          padding: '8px', 
          backgroundColor: 'rgba(0,0,0,0.3)', 
          borderRadius: '4px',
          color: statusText.includes('CRASH') ? '#ff4d4d' : '#00ffcc'
        }}>
          {statusText}
        </div>
      </div>
    </div>
  );
}
