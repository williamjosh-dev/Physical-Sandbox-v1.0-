import React, { useState, useCallback } from 'react';
import { AppHeader } from './components/ui/appheader';
import { Sidebar } from './components/ui/sidebar';
import { SandboxCanvas } from './components/sandboxcanvas';
import { LogEntry } from './types';

const BOOT_LOGS: LogEntry[] = [
  { id: 'boot-1', text: 'engine --boot', level: 'system', timestamp: new Date() },
  { id: 'boot-2', text: '4D Sandbox Core online. WebGL runtime environment mapping ready.', level: 'success', timestamp: new Date() },
];

let logCounter = 0;
function createLog(text: string, level: LogEntry['level'] = 'info'): LogEntry {
  return { id: `log-${++logCounter}`, text, level, timestamp: new Date() };
}

export default function App() {
  const [shaderFormula, setShaderFormula] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>(BOOT_LOGS);
  const [isLoading, setIsLoading] = useState(false);

  const appendLog = useCallback((text: string, level: LogEntry['level'] = 'info') => {
    setLogs((prev) => [...prev, createLog(text, level)]);
  }, []);

  const handleCompile = useCallback(async (promptText: string) => {
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

  return (
    <div className="app-shell">
      <AppHeader onReset={handleReset} />

      <main className="workspace">
        <Sidebar logs={logs} onSubmit={handleCompile} isLoading={isLoading} />

        <section className="viewport-panel">
          <div className="viewport-panel__toolbar">
            <span className="viewport-panel__label">4D Viewport · Active Render Target</span>
            <div className="viewport-panel__stats">
              <span className="stat-badge">
                nodes <span className="stat-badge__value">16,384</span>
              </span>
              <span className="stat-badge">
                grid <span className="stat-badge__value">128²</span>
              </span>
              <span className="stat-badge">
                status <span className="stat-badge__value">{isLoading ? 'COMPILING' : 'LIVE'}</span>
              </span>
            </div>
          </div>

          <div className="viewport-panel__canvas">
            <SandboxCanvas customShaderFormula={shaderFormula} />
            <div className="sandbox-canvas__overlay">
              <span className="overlay-chip">WebGL · GPGPU</span>
              {shaderFormula && <span className="overlay-chip">Custom Shader</span>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
