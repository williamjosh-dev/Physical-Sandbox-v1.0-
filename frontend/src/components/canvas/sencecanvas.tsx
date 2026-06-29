import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ModelViewer } from './modelviewer';
import { ModelConfig } from '../../types';

interface SceneCanvasProps {
  currentModel: ModelConfig | null;
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({ currentModel }) => {
  return (
    <div className="w-full h-full bg-slate-900 relative">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* Soft global ambient light */}
        <ambientLight intensity={0.6} />
        
        {/* Directional sunlight to cast shadows and highlights */}
        <directionalLight position={[10, 12, 8]} intensity={1.2} castShadow />
        
        {/* Point light to give an aesthetic glow */}
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#38bdf8" />

        {/* Dynamic Model Loader */}
        {currentModel && <ModelViewer config={currentModel} />}

        {/* Visual reference grid on the floor */}
        <Grid 
          renderOrder={-1} 
          position={[0, -0.01, 0]} 
          args={[10, 10]} 
          cellSize={0.5} 
          cellThickness={0.5} 
          cellColor="#334155" 
          sectionSize={2} 
          sectionThickness={1} 
          sectionColor="#475569" 
          fadeDistance={30} 
        />

        {/* Enables user to rotate/zoom around the model */}
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
};
