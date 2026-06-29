import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { BlueprintModel } from './blueprintmodel';
import { ModelConfig } from '../../types';

interface AnimatedAssemblyProps {
  models: ModelConfig[];
  trajectory: [number, number, number][];
  playing: boolean;
}

function AnimatedAssembly({ models, trajectory, playing }: AnimatedAssemblyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || trajectory.length === 0 || !playing) return;

    progressRef.current += delta * 0.4;
    const t = progressRef.current % 1;
    const idx = Math.min(
      Math.floor(t * (trajectory.length - 1)),
      trajectory.length - 1,
    );
    const [x, y, z] = trajectory[idx];
    groupRef.current.position.set(x, y, z);
  });

  return (
    <group ref={groupRef}>
      {models.map((model) => (
        <BlueprintModel key={model.id} config={model} />
      ))}
    </group>
  );
}

interface BlueprintSceneProps {
  models: ModelConfig[];
  trajectory: [number, number, number][];
  timeline: number[];
  modelType: string;
  physicsPassed: boolean;
}

export const BlueprintScene: React.FC<BlueprintSceneProps> = ({
  models,
  trajectory,
  timeline,
  modelType,
  physicsPassed,
}) => {
  const hasScene = models.length > 0;
  const playing = trajectory.length > 1;

  return (
    <div className="blueprint-scene">
      <Canvas
        shadows
        camera={{ position: [4, 3, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#050506']} />
        <fog attach="fog" args={['#050506', 8, 20]} />

        <ambientLight intensity={0.45} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 3, -3]} intensity={0.35} color="#3b82f6" />

        <Grid
          renderOrder={-1}
          position={[0, 0, 0]}
          args={[12, 12]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#1a1a22"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#2a2a35"
          fadeDistance={18}
          infiniteGrid
        />

        {hasScene ? (
          <AnimatedAssembly
            models={models}
            trajectory={trajectory}
            playing={playing}
          />
        ) : (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        )}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={2}
          maxDistance={14}
        />
      </Canvas>

      {!hasScene && (
        <div className="blueprint-scene__empty">
          <p>Describe a physical structure to build</p>
          <span>e.g. "red box", "rocket launch", "bridge with pillars", "pendulum"</span>
        </div>
      )}

      {hasScene && (
        <div className="sandbox-canvas__overlay">
          <span className="overlay-chip">{modelType}</span>
          <span className="overlay-chip">{models.length} parts</span>
          <span className={`overlay-chip overlay-chip--${physicsPassed ? 'ok' : 'fail'}`}>
            {physicsPassed ? 'PHYSICS OK' : 'PHYSICS FAIL'}
          </span>
          {playing && <span className="overlay-chip">SIM PLAYBACK</span>}
        </div>
      )}
    </div>
  );
};
