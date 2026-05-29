import React from 'react';

interface ControlPanelProps {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function ControlPanel({ currentFrame, totalFrames, onFrameChange, isPlaying, setIsPlaying }: ControlPanelProps) {
  if (totalFrames <= 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      width: '600px',
      backgroundColor: 'rgba(11, 11, 26, 0.85)',
      backdropFilter: 'blur(8px)',
      border: '1px solid #00ffcc',
      borderRadius: '6px',
      padding: '15px',
      color: '#00ffcc',
      fontFamily: 'monospace',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          backgroundColor: '#00ffcc',
          color: '#0b0b1a',
          border: 'none',
          padding: '5px 12px',
          fontWeight: 'bold',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: 'monospace'
        }}
      >
        {isPlaying ? 'PAUSE' : 'PLAY'}
      </button>

      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>0s</span>
        <input
          type="range"
          min={0}
          max={totalFrames - 1}
          value={currentFrame}
          onChange={(e) => onFrameChange(parseInt(e.target.value))}
          style={{
            flexGrow: 1,
            accentColor: '#00ffcc',
            cursor: 'pointer'
          }}
        />
        <span>FRAME: {currentFrame}/{totalFrames}</span>
      </div>
    </div>
  );
}
