import React, { useState } from 'react';
import './app.css';

interface SimulationLog {
  id: string;
  timestamp: string;
  command: string;
  response: string;
  status: 'running' | 'success' | 'ready';
}

export default function App(): React.JSX.Element {
  const [prompt, setPrompt] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [logs, setLogs] = useState<SimulationLog[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      command: 'engine --boot',
      response: '4D Sandbox Core online. WebGL runtime environment mapping ready.',
      status: 'ready'
    }
  ]);

  const handleExecute = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const currentCmd = prompt;
    const newId = crypto.randomUUID();
    
    setLogs(prev => [{
      id: newId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      command: currentCmd,
      response: 'LLM parsing engine active: Generating custom 3D modules...',
      status: 'running'
    }, ...prev]);

    setPrompt('');

    // Simulated latency of the module generation script
    setTimeout(() => {
      setLogs(prev => prev.map(log => 
        log.id === newId 
          ? { ...log, response: `[SUCCESS] 3D module script generated. Injected to WebGL viewport context successfully.`, status: 'success' }
          : log
      ));
    }, 1500);
  };

  return (
    <div className="terminal-shell">
      {/* Upper Navigation Banner */}
      <header className="nav-banner">
        <div className="nav-brand">
          <span className="brand-dot"></span>
          4D Sandbox Engine // v1.0
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => window.location.reload()}>Reset Runtime</button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="main-viewport">
        <div className="hero-section">
          <h1 className="hero-headline">4D Sandbox Platform</h1>
          <p className="hero-lead">Prompt your LLM engine. Dynamically render isolated 3D simulation modules directly to the physical simulation stack wrapper below.</p>
        </div>

        {/* Input Terminal Block */}
        <div className={`input-console-box ${isFocused ? 'focused' : ''}`}>
          <form onSubmit={handleExecute} className="console-form">
            <span className="console-prefix">~$</span>
            <input 
              type="text" 
              className="console-input"
              value={prompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., generate a revolving solar orbit layout with adjustable velocity hooks..."
            />
            <button type="submit" className="console-submit-btn">Compile</button>
          </form>
        </div>

        {/* Dynamic Text Logs Output Stream */}
        <section className="terminal-feed-wrapper">
          <div className="feed-header">
            <span>Runtime Execution Stream</span>
            <span className="pulse-indicator"></span>
          </div>
          <div className="feed-body">
            {logs.map(log => (
              <div key={log.id} className={`log-block status-${log.status}`}>
                <div className="log-line-cmd">
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className="log-symbol">❯</span>
                  <span className="log-cmd-text">{log.command}</span>
                </div>
                <div className="log-line-res">
                  <span className="log-reply-arrow">↳</span>
                  <span className="log-res-text">{log.response}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hardware-Isolated 3D Sandbox Target Context Slot */}
        <section className="sandbox-canvas-viewport" id="sandbox-runtime-target">
          <div className="sandbox-placeholder-text">
            [ 4D Viewport Context: Awaiting Dynamic Code Injection ]
          </div>
        </section>
      </main>
    </div>
  );
}
