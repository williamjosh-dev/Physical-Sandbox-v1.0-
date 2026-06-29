import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ModelViewer } from './modelviewer';
export const SceneCanvas = ({ currentModel }) => {
    return (_jsx("div", { className: "w-full h-full bg-slate-900 relative", children: _jsxs(Canvas, { camera: { position: [0, 2, 5], fov: 50 }, children: [_jsx("ambientLight", { intensity: 0.6 }), _jsx("directionalLight", { position: [10, 12, 8], intensity: 1.2, castShadow: true }), _jsx("pointLight", { position: [-5, 5, -5], intensity: 0.5, color: "#38bdf8" }), currentModel && _jsx(ModelViewer, { config: currentModel }), _jsx(Grid, { renderOrder: -1, position: [0, -0.01, 0], args: [10, 10], cellSize: 0.5, cellThickness: 0.5, cellColor: "#334155", sectionSize: 2, sectionThickness: 1, sectionColor: "#475569", fadeDistance: 30 }), _jsx(OrbitControls, { makeDefault: true, enableDamping: true, dampingFactor: 0.05 })] }) }));
};
