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
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g., Simulate rocket flight with 50000kg mass and 760000N thrust..."
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
