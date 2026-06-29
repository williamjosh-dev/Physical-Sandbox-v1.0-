import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
export const ModelViewer = ({ config }) => {
    const meshRef = useRef(null);
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
                return _jsx("sphereGeometry", { args: [1, 32, 32] });
            case 'cylinder':
                return _jsx("cylinderGeometry", { args: [0.8, 0.8, 2, 32] });
            case 'torus':
                return _jsx("torusGeometry", { args: [0.8, 0.3, 16, 100] });
            case 'box':
            default:
                return _jsx("boxGeometry", { args: [1, 1, 1] });
        }
    };
    return (_jsxs("mesh", { ref: meshRef, position: config.position, scale: config.scale, castShadow: true, receiveShadow: true, children: [renderGeometry(), _jsx("meshStandardMaterial", { color: config.color, wireframe: config.wireframe, roughness: 0.2, metalness: 0.1 })] }));
};
