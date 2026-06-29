import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { AppHeader } from './components/ui/appheader';
import { Sidebar } from './components/ui/sidebar';
import { SandboxCanvas } from './components/sandboxcanvas';
const BOOT_LOGS = [
    { id: 'boot-1', text: 'engine --boot', level: 'system', timestamp: new Date() },
    { id: 'boot-2', text: '4D Sandbox Core online. WebGL runtime environment mapping ready.', level: 'success', timestamp: new Date() },
];
let logCounter = 0;
function createLog(text, level = 'info') {
    return { id: `log-${++logCounter}`, text, level, timestamp: new Date() };
}
export default function App() {
    const [shaderFormula, setShaderFormula] = useState('');
    const [logs, setLogs] = useState(BOOT_LOGS);
    const [isLoading, setIsLoading] = useState(false);
    const appendLog = useCallback((text, level = 'info') => {
        setLogs((prev) => [...prev, createLog(text, level)]);
    }, []);
    const handleCompile = useCallback(async (promptText) => {
        setIsLoading(true);
        appendLog(`processing prompt: "${promptText}"`, 'system');
        appendLog('compiling GPGPU fragment math units...', 'info');
        // Placeholder until LLM API is wired — simulates async compile
        await new Promise((r) => setTimeout(r, 600));
        const customMath = `pos.y = sin(pos.x * 5.0 + uTime) * cos(pos.z * 5.0) * 0.7;`;
        setShaderFormula(customMath);
        appendLog('shader compiled successfully — 16,384 nodes active', 'success');
        setIsLoading(false);
    }, [appendLog]);
    const handleReset = useCallback(() => {
        setShaderFormula('');
        setLogs(BOOT_LOGS.map((l) => ({ ...l, timestamp: new Date() })));
        appendLog('runtime reset complete', 'warn');
    }, [appendLog]);
    return (_jsxs("div", { className: "app-shell", children: [_jsx(AppHeader, { onReset: handleReset }), _jsxs("main", { className: "workspace", children: [_jsx(Sidebar, { logs: logs, onSubmit: handleCompile, isLoading: isLoading }), _jsxs("section", { className: "viewport-panel", children: [_jsxs("div", { className: "viewport-panel__toolbar", children: [_jsx("span", { className: "viewport-panel__label", children: "4D Viewport \u00B7 Active Render Target" }), _jsxs("div", { className: "viewport-panel__stats", children: [_jsxs("span", { className: "stat-badge", children: ["nodes ", _jsx("span", { className: "stat-badge__value", children: "16,384" })] }), _jsxs("span", { className: "stat-badge", children: ["grid ", _jsx("span", { className: "stat-badge__value", children: "128\u00B2" })] }), _jsxs("span", { className: "stat-badge", children: ["status ", _jsx("span", { className: "stat-badge__value", children: isLoading ? 'COMPILING' : 'LIVE' })] })] })] }), _jsxs("div", { className: "viewport-panel__canvas", children: [_jsx(SandboxCanvas, { customShaderFormula: shaderFormula }), _jsxs("div", { className: "sandbox-canvas__overlay", children: [_jsx("span", { className: "overlay-chip", children: "WebGL \u00B7 GPGPU" }), shaderFormula && _jsx("span", { className: "overlay-chip", children: "Custom Shader" })] })] })] })] })] }));
}
