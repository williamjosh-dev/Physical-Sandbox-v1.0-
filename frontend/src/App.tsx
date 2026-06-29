import React, { useState, useCallback } from 'react';
import { AppHeader } from './components/ui/appheader';
import { Sidebar } from './components/ui/sidebar';
import { BlueprintScene } from './components/canvas/blueprintscene';
import { useSandbox } from './hooks/usellm';

export default function App() {
  const { scene, logs, isLoading, compile, reset } = useSandbox();

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="app-shell">
      <AppHeader onReset={handleReset} />

      <main className="workspace">
        <Sidebar logs={logs} onSubmit={compile} isLoading={isLoading} />

        <section className="viewport-panel">
          <div className="viewport-panel__toolbar">
            <span className="viewport-panel__label">Physics Sandbox · 3D Build & Test</span>
            <div className="viewport-panel__stats">
              <span className="stat-badge">
                parts <span className="stat-badge__value">{scene.blueprint.length || '—'}</span>
              </span>
              <span className="stat-badge">
                model <span className="stat-badge__value">{scene.modelType.toUpperCase()}</span>
              </span>
              <span className="stat-badge">
                status <span className="stat-badge__value">{isLoading ? 'BUILDING' : 'LIVE'}</span>
              </span>
            </div>
          </div>

          <div className="viewport-panel__canvas">
            <BlueprintScene
              models={scene.blueprint}
              trajectory={scene.trajectory}
              timeline={scene.timeline}
              modelType={scene.modelType}
              physicsPassed={scene.physicsPassed}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
