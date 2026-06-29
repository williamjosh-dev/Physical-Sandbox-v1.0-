import type { BlueprintItem, SimulationResult } from '../types';
import { mapTrajectoryForScene } from '../utils/sceneScale';
import { simulateLocally } from '../utils/blueprintBuilder';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface ApiBlueprintItem {
  shape: string;
  scale: number[];
  position: number[];
  color: string;
}

interface ApiSimulationResponse {
  success: boolean;
  physics_passed: boolean;
  message: string;
  model_type: string;
  t: number[];
  y: number[][];
  parameters: Record<string, number>;
  blueprint?: ApiBlueprintItem[] | null;
}

function toBlueprintItem(raw: ApiBlueprintItem): BlueprintItem {
  return {
    shape: raw.shape,
    scale: [raw.scale[0] ?? 1, raw.scale[1] ?? 1, raw.scale[2] ?? 1],
    position: [raw.position[0] ?? 0, raw.position[1] ?? 0, raw.position[2] ?? 0],
    color: raw.color,
  };
}

function mapApiResponse(data: ApiSimulationResponse): SimulationResult {
  const blueprint = (data.blueprint ?? []).map(toBlueprintItem);
  const trajectory = mapTrajectoryForScene(data.model_type, data.y);

  return {
    success: data.success,
    physicsPassed: data.physics_passed,
    message: data.message,
    modelType: data.model_type,
    blueprint,
    trajectory,
    timeline: data.t,
    parameters: data.parameters ?? {},
    source: 'backend',
  };
}

export async function compilePrompt(prompt: string): Promise<SimulationResult> {
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data: ApiSimulationResponse = await res.json();

    if (!data.blueprint?.length) {
      const local = simulateLocally(prompt);
      return {
        ...local,
        message: `${data.message} | Using local structure builder for visuals.`,
      };
    }

    return mapApiResponse(data);
  } catch {
    return simulateLocally(prompt);
  }
}
