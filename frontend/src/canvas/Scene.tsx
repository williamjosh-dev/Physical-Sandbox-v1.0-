import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Spacecraft from './spacecraft';

interface SceneProps {
  trajectory: number[][];
  currentFrame: number;
  isPlaying: boolean;
  onFrameAdvance?: (nextFrame: number) => void;
}

export default function Scene({ trajectory, currentFrame, isPlaying, onFrameAdvance }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const trajectoryRef = useRef(trajectory);
  const playingRef = useRef(isPlaying);
  const frameRef = useRef(currentFrame);

  // 🌟 FIX: Lifted state to the top-level of the component so the entire file can see it
  const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);

  useEffect(() => {
    frameRef.current = currentFrame;
  }, [currentFrame]);

  useEffect(() => {
    trajectoryRef.current = trajectory;
  }, [trajectory]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Enable logarithmic depth buffer to handle large scale variations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      logarithmicDepthBuffer: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x020814, 1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    setThreeScene(scene); // 🌟 Sets our top-level state perfectly

    // 2. Optimized Near plane to 1000 to drastically improve depth buffer precision
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1000, 4e10);
    camera.position.set(1e7, 5e6, 1e7); 
    cameraRef.current = camera;
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5); 
    sunLight.position.set(1e7, 5e6, 1e7); 
    scene.add(sunLight);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/texture/2k_earth_daymap.jpg');
    const earthElevationTexture = textureLoader.load('/texture/earth_elevation.jpg');
    const cloudTexture = textureLoader.load('/texture/cloud-types.jpg');
    
    const earthGeometry = new THREE.SphereGeometry(6371000, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      bumpMap: earthElevationTexture,
      bumpScale: 50000,
      roughness: 0.8,
      metalness: 0.2,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    
    // Cloud layer: Kept at 6,386,000 radius
    const cloudGeometry = new THREE.SphereGeometry(6386000, 64, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      alphaMap: cloudTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false, 
      blending: THREE.NormalBlending 
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    let frameId = 0;
    const animate = () => {
      cloudMesh.rotation.y += 0.00025; 
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const resizeHandler = () => {
      if (!container || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', resizeHandler);

    const ticker = window.setInterval(() => {
      if (playingRef.current && trajectoryRef.current.length) {
        const nextFrame = frameRef.current + 1 >= trajectoryRef.current.length ? 0 : frameRef.current + 1;
        onFrameAdvance?.(nextFrame);
      }
    }, 1000 / 15);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(frameId);
      window.clearInterval(ticker);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onFrameAdvance]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      {/* 🌟 Now threeScene is perfectly readable down here! */}
      <Spacecraft scene={threeScene} trajectory={trajectory} currentFrame={currentFrame} />
    </div>
  );
}
