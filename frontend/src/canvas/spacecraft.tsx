import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SpacecraftProps {
  scene: THREE.Scene | null; // Pass your vanilla Three.js scene object down
  trajectory: number[][];
  currentFrame: number;
}

export default function Spacecraft({ scene, trajectory, currentFrame }: SpacecraftProps) {
  // References to keep persistent track of imperial instances across frames
  const meshRef = useRef<THREE.Mesh | null>(null);
  const lineRef = useRef<THREE.Line | null>(null);

  // 1. Structural Setup: Initialize objects imperatively when the scene is ready
  useEffect(() => {
    if (!scene) return;

    // Create the Spacecraft Cone geometry
    const coneGeo = new THREE.ConeGeometry(120000, 400000, 4);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x005544,
      roughness: 0.2,
      metalness: 0.8,
    });
    const craftMesh = new THREE.Mesh(coneGeo, coneMat);
    meshRef.current = craftMesh;
    scene.add(craftMesh);

    // Create the Trajectory Ribbon path line strip
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff3366,
      transparent: true,
      opacity: 0.8,
    });
    const trailLine = new THREE.Line(lineGeo, lineMat);
    lineRef.current = trailLine;
    scene.add(trailLine);

    // Clean up meshes from memory if component unmounts
    return () => {
      scene.remove(craftMesh);
      scene.remove(trailLine);
      coneGeo.dispose();
      coneMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, [scene]);

  // 2. Trajectory Generation: Update path buffer coordinates on recalculation runs
  useEffect(() => {
    if (!trajectory || trajectory.length === 0 || !lineRef.current) return;

    const points = trajectory.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    if (lineRef.current.geometry) {
      lineRef.current.geometry.dispose();
    }
    lineRef.current.geometry = geometry;
  }, [trajectory]);

  // 3. Playback Frame Tickers: Translate vehicle model position and vector orientation
  useEffect(() => {
    if (!trajectory || trajectory.length === 0 || !meshRef.current) return;

    const frameData = trajectory[currentFrame];
    if (!frameData) return;

    const [x, y, z] = frameData;
    meshRef.current.position.set(x, y, z);

    // Dynamic track look-ahead targeting vector
    const nextFrame = trajectory[currentFrame + 1] || frameData;
    if (nextFrame) {
      const targetDir = new THREE.Vector3(nextFrame[0], nextFrame[1], nextFrame[2]);
      if (targetDir.distanceTo(meshRef.current.position) > 0.01) {
        meshRef.current.lookAt(targetDir);
        meshRef.current.rotateX(Math.PI / 2); // Correct cylinder top point offset orientation
      }
    }
  }, [trajectory, currentFrame]);

  // Vanilla rendering requires no JSX output trees
  return null;
}
