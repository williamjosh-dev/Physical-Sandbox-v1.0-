import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BlueprintItem {
  shape: 'cone' | 'cylinder' | 'box' | 'sphere';
  scale: [number, number, number];
  position: [number, number, number];
  color: string;
}

interface SpacecraftProps {
  scene: THREE.Scene | null;
  trajectory: number[][];
  currentFrame: number;
  blueprint?: BlueprintItem[]; // 🌟 New dynamic mesh property from LLM
}

export default function Spacecraft({ scene, trajectory, currentFrame, blueprint }: SpacecraftProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const lineRef = useRef<THREE.Line | null>(null);

  // 1. Core Lifecycle Setup
  useEffect(() => {
    if (!scene) return;

    // Create a persistent root group container for custom dynamic parts
    const craftGroup = new THREE.Group();
    groupRef.current = craftGroup;
    scene.add(craftGroup);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.8 });
    const trailLine = new THREE.Line(lineGeo, lineMat);
    lineRef.current = trailLine;
    scene.add(trailLine);

    return () => {
      scene.remove(craftGroup);
      scene.remove(trailLine);
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, [scene]);

  // 2. 🧠 THE MAGIC: Dynamic Procedural Generation Assembly Loop
  useEffect(() => {
    if (!groupRef.current) return;

    // Clear out any old shapes from previous prompt iterations
    while (groupRef.current.children.length > 0) {
      const obj = groupRef.current.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else if (obj.material) obj.material.dispose();
      groupRef.current.remove(obj);
    }

    // Default structural fallback shape if the LLM blueprint array is missing
    const activeBlueprint = blueprint && blueprint.length > 0 ? blueprint : [
      { shape: 'cone', scale: [50000, 150000, 32], position: [0, 0, 0], color: '0x00ffcc' }
    ];

    // Loop through the LLM generated parts dictionary array
    activeBlueprint.forEach((part) => {
      let geo: THREE.BufferGeometry;

      // Dynamically allocate geometries based on LLM text token generation decisions
      if (part.shape === 'cylinder') geo = new THREE.CylinderGeometry(part.scale[0], part.scale[0], part.scale[1], 16);
      else if (part.shape === 'box') geo = new THREE.BoxGeometry(...part.scale);
      else if (part.shape === 'sphere') geo = new THREE.SphereGeometry(part.scale[0], 16, 16);
      else geo = new THREE.ConeGeometry(part.scale[0], part.scale[1], part.scale[2]);

      const mat = new THREE.MeshStandardMaterial({
        color: parseInt(part.color),
        roughness: 0.3,
        metalness: 0.7,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...part.position);
      
      // Append the modular part inside our tracking engine workspace group
      groupRef.current?.add(mesh);
    });
  }, [blueprint]);

  // 3. Render Playback Tickers (Transforms the entire compound group together)
  useEffect(() => {
    if (!trajectory || trajectory.length === 0 || !groupRef.current) return;

    const frameData = trajectory[currentFrame];
    if (!frameData) return;

    const [x, y, z] = frameData;
    groupRef.current.position.set(x, y, z);

    const nextFrame = trajectory[currentFrame + 1] || frameData;
    if (nextFrame) {
      const targetDir = new THREE.Vector3(nextFrame[0], nextFrame[1], nextFrame[2]);
      if (targetDir.distanceTo(groupRef.current.position) > 0.01) {
        groupRef.current.lookAt(targetDir);
        groupRef.current.rotateX(Math.PI / 2);
      }
    }
  }, [trajectory, currentFrame]);

  // 4. Update Path Ribbon Trails
  useEffect(() => {
    if (!trajectory || trajectory.length === 0 || !lineRef.current) return;
    const points = trajectory.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    if (lineRef.current.geometry) lineRef.current.geometry.dispose();
    lineRef.current.geometry = geometry;
  }, [trajectory]);

  return null;
}
