import type { BlueprintItem, ModelConfig, ShapeType, SimulationResult } from '../types';

function parseHexColor(raw: string): string {
  if (raw.startsWith('#')) return raw;
  if (raw.startsWith('0x') || raw.startsWith('0X')) {
    return `#${raw.slice(2)}`;
  }
  return raw;
}

function toShapeType(shape: string): ShapeType {
  const s = shape.toLowerCase();
  if (s === 'sphere' || s === 'cylinder' || s === 'torus' || s === 'cone' || s === 'box') {
    return s;
  }
  return 'box';
}

/** Backend blueprints use aerospace-scale numbers — normalize to sandbox units */
export function normalizeBlueprintItems(items: BlueprintItem[]): ModelConfig[] {
  if (items.length === 0) return [];

  const maxScale = Math.max(
    ...items.flatMap((i) => i.scale.map(Math.abs)),
    ...items.flatMap((i) => i.position.map(Math.abs)),
    1,
  );

  const needsNormalize = maxScale > 50;
  const factor = needsNormalize ? 3 / maxScale : 1;

  return items.map((item, idx) => ({
    id: `part-${idx}`,
    type: toShapeType(String(item.shape)),
    position: [
      item.position[0] * factor,
      item.position[1] * factor,
      item.position[2] * factor,
    ] as [number, number, number],
    scale: [
      item.scale[0] * factor,
      item.scale[1] * factor,
      item.scale[2] * factor,
    ] as [number, number, number],
    color: parseHexColor(item.color),
    wireframe: item.wireframe ?? false,
    rotation: item.rotation ? [item.rotation[0], item.rotation[1], item.rotation[2]] : undefined,
  }));
}

export function mapTrajectoryForScene(
  modelType: string,
  rawY: number[][],
): [number, number, number][] {
  if (!rawY.length) return [];

  const scale = (v: number, ref: number) => {
    if (Math.abs(v) > ref * 10) return v / ref;
    return v;
  };

  return rawY.map((frame) => {
    if (modelType === 'rocket') {
      const alt = frame[0] ?? 0;
      return [0, scale(alt, 100000), 0] as [number, number, number];
    }
    if (modelType === 'orbital') {
      const x = frame[0] ?? 0;
      const y = frame[1] ?? 0;
      return [scale(x, 1e6), scale(y, 1e6), 0] as [number, number, number];
    }
    if (modelType === 'fixed-wing' || modelType === 'modular' || modelType === 'point-mass') {
      const x = frame[0] ?? 0;
      const y = frame[1] ?? 0;
      const z = frame[2] ?? 0;
      const ref = Math.max(Math.abs(x), Math.abs(y), Math.abs(z), 1);
      if (ref > 100) {
        return [scale(x, ref), scale(y, ref), scale(z, ref)] as [number, number, number];
      }
      return [x, y, z] as [number, number, number];
    }
    return [
      frame[0] ?? 0,
      frame[1] ?? 0,
      frame[2] ?? 0,
    ] as [number, number, number];
  });
}

export function resultToScene(result: SimulationResult): {
  blueprint: ModelConfig[];
  trajectory: [number, number, number][];
  timeline: number[];
  modelType: string;
  physicsPassed: boolean;
  message: string;
} {
  return {
    blueprint: normalizeBlueprintItems(result.blueprint),
    trajectory: result.trajectory,
    timeline: result.timeline,
    modelType: result.modelType,
    physicsPassed: result.physicsPassed,
    message: result.message,
  };
}
