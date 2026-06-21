import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { ModelConfig } from '../../types';

interface ModelViewerProps {
  config: ModelConfig;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ config }) => {
  const meshRef = useRef<Mesh>(null);

  // Subtle rotational animation loop to make the scene feel alive
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  // Simple factory engine map mapping strings to core ThreeJS shapes
  const renderGeometry = () => {
    switch (config.type) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.8, 0.8, 2, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.8, 0.3, 16, 100]} />;
      case 'box':
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh 
      ref={meshRef} 
      position={config.position} 
      scale={config.scale}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      <meshStandardMaterial 
        color={config.color} 
        wireframe={config.wireframe} 
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
};
