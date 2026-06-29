export interface Message {
  id: string;
  sender: 'user' | 'llm';
  text: string;
}

export type ShapeType = 'box' | 'sphere' | 'cylinder' | 'torus' | 'cone';

export interface BlueprintItem {
  shape: ShapeType | string;
  scale: [number, number, number];
  position: [number, number, number];
  color: string;
}

export interface ModelConfig {
  id: string;
  type: ShapeType;
  position: [number, number, number];
  color: string;
  scale: [number, number, number];
  wireframe: boolean;
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'system';

export interface LogEntry {
  id: string;
  text: string;
  level: LogLevel;
  timestamp: Date;
}

export interface SimulationResult {
  success: boolean;
  physicsPassed: boolean;
  message: string;
  modelType: string;
  blueprint: BlueprintItem[];
  trajectory: [number, number, number][];
  timeline: number[];
  parameters: Record<string, number>;
  source: 'backend' | 'local';
}

export interface SandboxScene {
  blueprint: ModelConfig[];
  trajectory: [number, number, number][];
  timeline: number[];
  modelType: string;
  physicsPassed: boolean;
  message: string;
}
