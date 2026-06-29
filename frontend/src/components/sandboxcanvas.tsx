import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GPGPUSimulator, generateCustomShader, DEFAULT_POSITION_SHADER } from './GPGPUfragments';

interface SandboxCanvasProps {
  customShaderFormula?: string;
}

export const SandboxCanvas: React.FC<SandboxCanvasProps> = ({ customShaderFormula }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<GPGPUSimulator | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 450;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const SIM_SIZE = 128;
    const initialShader = customShaderFormula
      ? generateCustomShader(customShaderFormula)
      : DEFAULT_POSITION_SHADER;

    const simulator = new GPGPUSimulator(renderer, SIM_SIZE, initialShader);
    simulatorRef.current = simulator;

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPositionTexture: { value: null },
      },
      vertexShader: `
        uniform sampler2D uPositionTexture;
        void main() {
          vec4 gpgpuPos = texture2D(uPositionTexture, uv);
          vec4 mvPosition = modelViewMatrix * vec4(gpgpuPos.xyz, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = 3.0;
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.0, 0.9, 0.4, 1.0);
        }
      `,
      transparent: true,
    });
    materialRef.current = renderMaterial;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(SIM_SIZE * SIM_SIZE * 3);
    const uvs = new Float32Array(SIM_SIZE * SIM_SIZE * 2);

    let pIdx = 0;
    let uIdx = 0;
    for (let i = 0; i < SIM_SIZE; i++) {
      for (let j = 0; j < SIM_SIZE; j++) {
        positions[pIdx++] = 0;
        positions[pIdx++] = 0;
        positions[pIdx++] = 0;
        uvs[uIdx++] = i / SIM_SIZE;
        uvs[uIdx++] = j / SIM_SIZE;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const particleCloud = new THREE.Points(geometry, renderMaterial);
    scene.add(particleCloud);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const tick = () => {
      const elapsed = clock.getElapsedTime();

      if (simulatorRef.current && materialRef.current) {
        const computedTextureFrame = simulatorRef.current.update(elapsed, 1.5);
        materialRef.current.uniforms['uPositionTexture'].value = computedTextureFrame;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !rendererRef.current || !cameraRef.current) return;
      const { width: w, height: h } = entry.contentRect;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      renderMaterial.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [customShaderFormula]);

  return <div ref={mountRef} className="sandbox-canvas" />;
};
