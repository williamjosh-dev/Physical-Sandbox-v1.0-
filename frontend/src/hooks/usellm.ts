import { useCallback, useState } from 'react';
import { compilePrompt } from '../services/api';
import { resultToScene } from '../utils/sceneScale';
import type { LogEntry, SandboxScene } from '../types';

let logCounter = 0;
function createLog(text: string, level: LogEntry['level'] = 'info'): LogEntry {
  return { id: `log-${++logCounter}`, text, level, timestamp: new Date() };
}

const EMPTY_SCENE: SandboxScene = {
  blueprint: [],
  trajectory: [],
  timeline: [],
  modelType: 'idle',
  physicsPassed: true,
  message: '',
};

export function useSandbox() {
  const [scene, setScene] = useState<SandboxScene>(EMPTY_SCENE);
  const [logs, setLogs] = useState<LogEntry[]>([
    createLog('engine --boot', 'system'),
    createLog('Physics sandbox ready. Describe a structure to build and test.', 'success'),
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const appendLog = useCallback((text: string, level: LogEntry['level'] = 'info') => {
    setLogs((prev) => [...prev, createLog(text, level)]);
  }, []);

  const compile = useCallback(async (prompt: string) => {
    setIsLoading(true);
    appendLog(`user prompt: "${prompt}"`, 'system');
    appendLog('parsing structure + running physics pipeline...', 'info');

    try {
      const result = await compilePrompt(prompt);
      const nextScene = resultToScene(result);

      setScene(nextScene);
      appendLog(`model type: ${result.modelType}`, 'info');
      appendLog(`assembled ${nextScene.blueprint.length} part(s)`, 'info');
      appendLog(
        result.message,
        result.physicsPassed ? 'success' : 'error',
      );
      appendLog(
        result.source === 'backend'
          ? 'validated via SciPy backend'
          : 'local preview mode (start backend for full LLM + SciPy loop)',
        result.source === 'backend' ? 'success' : 'warn',
      );
    } catch (err) {
      appendLog(`compile failed: ${err instanceof Error ? err.message : 'unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [appendLog]);

  const reset = useCallback(() => {
    setScene(EMPTY_SCENE);
    setLogs([
      createLog('engine --boot', 'system'),
      createLog('Physics sandbox ready. Describe a structure to build and test.', 'success'),
      createLog('runtime reset complete', 'warn'),
    ]);
  }, []);

  return { scene, logs, isLoading, compile, reset, appendLog };
}
