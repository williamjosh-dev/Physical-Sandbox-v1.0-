import { useCallback } from 'react';

const BACKEND_URL = '/api/simulate';

export interface TheoryPayload {
  title: string;
  core_concept: string;
  governing_equations: string[];
}

export interface BlueprintItem {
  shape: 'cone' | 'cylinder' | 'box' | 'sphere';
  scale: number[];
  position: number[];
  color: string;
}

export interface SimulationResponse {
  success: boolean;
  message: string;
  model_type?: string;
  labels?: string[];
  t: number[];
  y: number[][];
  theory?: TheoryPayload; // Matches 'result.theory' in App.tsx
  blueprint?: BlueprintItem[];
  error?: string;
}

interface SimulationRequestPayload {
  prompt: string;
}

async function fetchSimulationPayload(prompt: string): Promise<SimulationResponse> {
  const payload: SimulationRequestPayload = { prompt };

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const serverText = await response.text().catch(() => 'Unable to parse error payload');
      return {
        success: false,
        message: `Server error ${response.status}`,
        t: [],
        y: [],
        error: serverText || response.statusText || 'Unknown server error',
      };
    }

    const data = (await response.json()) as Partial<SimulationResponse> | null;
    if (!data || typeof data.success !== 'boolean' || typeof data.message !== 'string') {
      return {
        success: false,
        message: 'Invalid backend response',
        t: [],
        y: [],
        error: 'Response did not match expected SimulationResponse shape',
      };
    }

    return {
      success: data.success,
      message: data.message,
      model_type: typeof data.model_type === 'string' ? data.model_type : undefined,
      labels: Array.isArray(data.labels) ? data.labels.map(String) : undefined,
      t: Array.isArray(data.t) ? data.t.map(Number).filter((value) => !Number.isNaN(value)) : [],
      y: Array.isArray(data.y)
        ? data.y.map((row) => (Array.isArray(row) ? row.map(Number).filter((value) => !Number.isNaN(value)) : []))
        : [],
      theory: data.theory ? {
        title: String(data.theory.title || ''),
        core_concept: String(data.theory.core_concept || ''),
        governing_equations: Array.isArray(data.theory.governing_equations) ? data.theory.governing_equations.map(String) : []
      } : undefined,
      blueprint: Array.isArray(data.blueprint)
        ? data.blueprint.map((item) => ({
            shape: String(item.shape) as 'cone' | 'cylinder' | 'box' | 'sphere',
            scale: Array.isArray(item.scale) ? item.scale.map(Number).filter((value) => !Number.isNaN(value)) : [],
            position: Array.isArray(item.position) ? item.position.map(Number).filter((value) => !Number.isNaN(value)) : [],
            color: String(item.color || '0xffffff'),
          }))
        : undefined,
      error: data.error,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Network request failed',
      t: [],
      y: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function useSimulation() {
  return useCallback(async (prompt: string) => {
    return fetchSimulationPayload(prompt);
  }, []);
}
