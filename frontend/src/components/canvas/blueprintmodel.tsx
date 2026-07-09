import React from 'react';
import { ModelConfig } from '../../types';

interface BlueprintModelProps {
  config: ModelConfig;
}

export const BlueprintModel: React.FC<BlueprintModelProps> = ({ config }) => {
  const [sx, sy, sz] = config.scale;
  const rotation = (config as any).rotation || [0, 0, 0];
  const wireframe = (config as any).wireframe || false;

  const geometry = () => {
    switch (config.type) {
      case 'sphere':
        return <sphereGeometry args={[Math.max(sx, sy, sz), 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[sx, sy, sz, 32]} />;
      case 'torus':
        return <torusGeometry args={[sx * 0.6, sx * 0.2, 16, 48]} />;
      case 'cone':
        return <coneGeometry args={[sx, sy, 32]} />;
      case 'box':
      default:
        return <boxGeometry args={[sx, sy, sz]} />;
    }
  };

  return (
    <mesh
      position={config.position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      {geometry()}
      <meshStandardMaterial
        color={config.color}
        wireframe={wireframe}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  );
};
