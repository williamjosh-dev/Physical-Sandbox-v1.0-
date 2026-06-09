import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import Sidebar from './components/Sidebar';
import ControlPanel from './components/ControlPanel';
import Scene from './canvas/Scene';
import { useSimulation } from './hooks/useSimulation';
export default function App() {
    const simulate = useSimulation();
    const [statusText, setStatusText] = useState('Awaiting Telemetry...');
    const [trajectory, setTrajectory] = useState([]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    // New state variables to capture theory payloads from backend
    const [theoryTitle, setTheoryTitle] = useState('Aerospace Physics Lab');
    const [theoryConcept, setTheoryConcept] = useState('Enter a simulation prompt below to map physical trajectories, study state vectors, and view mathematical formulations.');
    const [equations, setEquations] = useState(['\\vec{F} = m\\vec{a}']);
    const [modelType, setModelType] = useState('generic');
    const [labels, setLabels] = useState([]);
    const [blueprint, setBlueprint] = useState([]);
    const handleTriggerSimulation = useCallback(async (promptText) => {
        setStatusText('Computing API Path...');
        setBlueprint([]);
        const result = await simulate(promptText);
        setStatusText(result.message || 'Simulation complete');
        if (result.success) {
            setTrajectory(result.y || []);
            setCurrentFrame(0);
            setIsPlaying(true);
            setBlueprint(result.blueprint || []);
            setModelType(result.model_type || 'generic');
            setLabels(result.labels || []);
            // Map theory fields dynamically if the backend returns them
            if (result.theory) {
                setTheoryTitle(result.theory.title || 'Simulation Run');
                setTheoryConcept(result.theory.core_concept || '');
                setEquations(result.theory.governing_equations || []);
            }
        }
        else {
            setIsPlaying(false);
        }
    }, [simulate]);
    const handleFrameChange = useCallback((frame) => {
        setCurrentFrame(frame);
    }, []);
    const handleFrameAdvance = useCallback((nextFrame) => {
        setCurrentFrame(nextFrame);
    }, []);
    return (_jsxs("div", { style: { width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#020617', fontFamily: 'monospace' }, children: [_jsxs("div", { style: { width: '420px', height: '100%', background: '#030712', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box', zIndex: 10, overflowY: 'auto' }, children: [_jsxs("div", { children: [_jsx("h1", { style: { color: '#22d3ee', fontSize: '1.4rem', margin: '0 0 10px 0', borderBottom: '1px solid #06b6d4', paddingBottom: '8px' }, children: theoryTitle }), _jsxs("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }, children: [_jsxs("span", { style: { color: '#38bdf8', fontSize: '0.85rem', background: '#07101f', padding: '6px 10px', borderRadius: '999px', border: '1px solid #0ea5e9' }, children: ["MODEL: ", modelType.toUpperCase()] }), labels.length > 0 && (_jsxs("span", { style: { color: '#94a3b8', fontSize: '0.85rem', background: '#07101f', padding: '6px 10px', borderRadius: '999px', border: '1px solid #334155' }, children: ["STATES: ", labels.join(', ')] }))] })] }), _jsx("p", { style: { color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }, children: theoryConcept }), _jsx("h3", { style: { color: '#38bdf8', fontSize: '1rem', margin: '0 0 8px 0' }, children: "Governing Mathematics" }), _jsx("div", { style: { background: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '4px', color: '#38bdf8', fontSize: '1rem', overflowX: 'auto', marginBottom: '20px' }, children: equations.map((eq, i) => (_jsx("div", { style: { padding: '4px 0' }, children: eq }, i))) }), _jsx("h3", { style: { color: '#38bdf8', fontSize: '1rem', margin: '0 0 8px 0' }, children: "Modular Blueprint" }), _jsx("div", { style: { background: '#02111f', border: '1px solid #334155', borderRadius: '4px', padding: '12px', color: '#cbd5e1', marginBottom: '20px' }, children: blueprint.length > 0 ? (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: '10px', color: '#e2e8f0' }, children: ["Blueprint Parts: ", blueprint.length] }), blueprint.map((part, index) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', padding: '8px 0', borderBottom: index < blueprint.length - 1 ? '1px solid #0f172a' : 'none' }, children: [_jsxs("div", { children: [_jsx("strong", { style: { color: '#38bdf8' }, children: part.shape }), _jsxs("div", { style: { color: '#94a3b8', fontSize: '0.85rem' }, children: ["scale: [", part.scale.map((n) => n.toFixed(0)).join(', '), "], position: [", part.position.map((n) => n.toFixed(0)).join(', '), "]"] })] }), _jsx("div", { style: { width: '28px', height: '28px', borderRadius: '4px', backgroundColor: part.color.replace(/^0x/, '#'), border: '1px solid #334155' } })] }, index)))] })) : (_jsx("div", { style: { color: '#94a3b8', fontSize: '0.9rem' }, children: "No generated blueprint yet. Run a prompt to reveal the modular assembly." })) }), _jsx("div", { style: { marginTop: 'auto' }, children: _jsx(Sidebar, { onTriggerSimulation: handleTriggerSimulation, statusText: statusText }) })] }), _jsxs("div", { style: { flex: 1, height: '100%', position: 'relative' }, children: [_jsx(Scene, { trajectory: trajectory, currentFrame: currentFrame, isPlaying: isPlaying, blueprint: blueprint, onFrameAdvance: handleFrameAdvance }), _jsx("div", { style: { position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 10 }, children: _jsx(ControlPanel, { currentFrame: currentFrame, totalFrames: trajectory.length, onFrameChange: handleFrameChange, isPlaying: isPlaying, setIsPlaying: setIsPlaying }) })] })] }));
}
