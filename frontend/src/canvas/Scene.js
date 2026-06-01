import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export default function Scene({ trajectory, currentFrame, isPlaying, onFrameAdvance }) {
    const containerRef = useRef(null);
    const spacecraftRef = useRef(null);
    const cameraRef = useRef(null);
    const trajectoryLineRef = useRef(null);
    const frameRef = useRef(currentFrame);
    const trajectoryRef = useRef(trajectory);
    const playingRef = useRef(isPlaying);
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
        if (!container) {
            return;
        }
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x020814, 1);
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 4e10);
        camera.position.set(0, 0, 15000000);
        cameraRef.current = camera;
        scene.add(camera);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        const ambientLight = new THREE.AmbientLight(0x00ffcc, 0.8);
        scene.add(ambientLight);
        const earthGeometry = new THREE.SphereGeometry(6371000, 64, 64);
        const earthMaterial = new THREE.MeshBasicMaterial({
            color: 0x003366,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);
        const spacecraftGeometry = new THREE.SphereGeometry(150000, 32, 32);
        const spacecraftMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffcc,
            emissive: 0x00ffcc,
            emissiveIntensity: 1.5,
        });
        const spacecraftMesh = new THREE.Mesh(spacecraftGeometry, spacecraftMaterial);
        spacecraftMesh.position.set(0, 0, 0);
        spacecraftRef.current = spacecraftMesh;
        scene.add(spacecraftMesh);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.4
        });
        const lineGeometry = new THREE.BufferGeometry();
        const trajectoryLine = new THREE.Line(lineGeometry, lineMaterial);
        trajectoryLineRef.current = trajectoryLine;
        scene.add(trajectoryLine);
        let frameId = 0;
        const animate = () => {
            earthMesh.rotation.y += 0.0001;
            const frames = trajectoryRef.current;
            const frameIndex = frames.length ? Math.min(frameRef.current, frames.length - 1) : 0;
            if (frames.length && spacecraftRef.current) {
                const stepData = frames[frameIndex] ?? [];
                if (Array.isArray(stepData) && stepData.length >= 2) {
                    const x = Number(stepData[0]) || 0;
                    const y = Number(stepData[1]) || 0;
                    spacecraftRef.current.position.set(x, y, 0);
                }
            }
            controls.update();
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();
        const resizeHandler = () => {
            if (!container || !cameraRef.current) {
                return;
            }
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
    useEffect(() => {
        if (!spacecraftRef.current || !trajectory.length)
            return;
        // Update Spacecraft Position
        const stepData = trajectory[Math.min(currentFrame, trajectory.length - 1)] ?? [];
        if (Array.isArray(stepData) && stepData.length >= 2) {
            const x = Number(stepData[0]) || 0;
            const y = Number(stepData[1]) || 0;
            spacecraftRef.current.position.set(x, y, 0);
        }
        // Update Trajectory Line Path
        if (trajectoryLineRef.current) {
            const points = trajectory.map(step => new THREE.Vector3(Number(step[0]) || 0, Number(step[1]) || 0, 0));
            trajectoryLineRef.current.geometry.setFromPoints(points);
        }
    }, [currentFrame, trajectory]);
    return _jsx("div", { ref: containerRef, style: { width: '100%', height: '100%', position: 'absolute', inset: 0 } });
}
