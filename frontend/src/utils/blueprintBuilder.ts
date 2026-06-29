import type { BlueprintItem, SimulationResult } from '../types';

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  white: '#f8fafc',
  gray: '#64748b',
  grey: '#64748b',
  black: '#1e293b',
  cyan: '#22d3ee',
  pink: '#ec4899',
};

function normalizePrompt(prompt: string): string {
  return prompt.trim().replace(/–/g, '-').toLowerCase();
}

function parseColor(prompt: string, fallback = '#60a5fa'): string {
  const n = normalizePrompt(prompt);
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (n.includes(name)) return hex;
  }
  const hexMatch = n.match(/#([0-9a-f]{3,8})/i);
  if (hexMatch) return `#${hexMatch[1]}`;
  const oxMatch = n.match(/0x([0-9a-f]{3,8})/i);
  if (oxMatch) return `#${oxMatch[1]}`;
  return fallback;
}

function item(
  shape: BlueprintItem['shape'],
  scale: [number, number, number],
  position: [number, number, number],
  color: string,
): BlueprintItem {
  return { shape, scale, position, color };
}

export function buildBlueprintFromPrompt(prompt: string): BlueprintItem[] {
  const n = normalizePrompt(prompt);
  const color = parseColor(prompt);

  if (/\b(box|cube|block|crate)\b/.test(n) && !/\b(bridge|tower|house|rocket)\b/.test(n)) {
    const size = n.includes('large') || n.includes('big') ? 1.4 : n.includes('small') ? 0.5 : 1;
    return [item('box', [size, size, size], [0, size / 2, 0], color)];
  }
  if (/\b(sphere|ball|orb|planet)\b/.test(n)) {
    const r = n.includes('large') ? 1.2 : n.includes('small') ? 0.4 : 0.75;
    return [item('sphere', [r, r, r], [0, r, 0], color)];
  }
  if (/\b(cylinder|pillar|column|pipe|rod)\b/.test(n)) {
    return [item('cylinder', [0.5, 1.5, 0.5], [0, 0.75, 0], color)];
  }
  if (/\b(torus|ring|donut)\b/.test(n)) {
    return [item('torus', [0.8, 0.8, 0.8], [0, 0.8, 0], color)];
  }
  if (/\b(cone|pyramid)\b/.test(n)) {
    return [item('cone', [0.8, 1.2, 0.8], [0, 0.6, 0], color)];
  }

  if (/\b(rocket|launch|booster)\b/.test(n)) {
    return [
      item('cone', [0.5, 0.6, 0.5], [0, 2.1, 0], '#22c55e'),
      item('cylinder', [0.45, 1.4, 0.45], [0, 1.2, 0], '#0ea5e9'),
      item('box', [0.5, 0.4, 0.5], [0, 0.2, 0], '#334155'),
    ];
  }
  if (/\b(orbital|orbit|satellite|spacecraft)\b/.test(n)) {
    return [
      item('sphere', [0.35, 0.35, 0.35], [0, 1, 0], '#fbbf24'),
      item('cylinder', [0.08, 1.2, 0.08], [0, 1, 0], '#94a3b8'),
      item('box', [0.6, 0.05, 0.3], [0, 1, 0], '#64748b'),
    ];
  }
  if (/\b(aircraft|airplane|plane|fixed[- ]wing)\b/.test(n)) {
    return [
      item('box', [1.6, 0.15, 0.3], [0, 0.5, 0], '#38bdf8'),
      item('box', [0.8, 0.03, 0.6], [0, 0.5, 0], '#0ea5e9'),
      item('box', [0.3, 0.05, 0.15], [0.7, 0.55, 0], '#0284c7'),
    ];
  }
  if (/\b(drone|quad|rotor|uav)\b/.test(n)) {
    return [
      item('box', [0.6, 0.08, 0.6], [0, 0.8, 0], '#34d399'),
      item('cylinder', [0.12, 0.02, 0.12], [0.35, 0.85, 0.35], '#f59e0b'),
      item('cylinder', [0.12, 0.02, 0.12], [-0.35, 0.85, 0.35], '#f59e0b'),
      item('cylinder', [0.12, 0.02, 0.12], [0.35, 0.85, -0.35], '#f59e0b'),
      item('cylinder', [0.12, 0.02, 0.12], [-0.35, 0.85, -0.35], '#f59e0b'),
    ];
  }

  if (/\b(tower|stack|stacked)\b/.test(n)) {
    return [
      item('box', [0.8, 0.3, 0.8], [0, 0.15, 0], color),
      item('box', [0.65, 0.3, 0.65], [0, 0.45, 0], color),
      item('box', [0.5, 0.3, 0.5], [0, 0.75, 0], color),
      item('cone', [0.4, 0.35, 0.4], [0, 1.08, 0], '#f97316'),
    ];
  }
  if (/\b(bridge|beam|truss)\b/.test(n)) {
    return [
      item('box', [3, 0.12, 0.4], [0, 0.8, 0], color),
      item('cylinder', [0.08, 0.8, 0.08], [-1.2, 0.4, 0], '#64748b'),
      item('cylinder', [0.08, 0.8, 0.08], [1.2, 0.4, 0], '#64748b'),
      item('box', [0.3, 0.12, 0.3], [-1.2, 0.06, 0], '#475569'),
      item('box', [0.3, 0.12, 0.3], [1.2, 0.06, 0], '#475569'),
    ];
  }
  if (/\b(ramp|incline|slope)\b/.test(n)) {
    return [
      item('box', [2, 0.1, 1], [0, 0.05, 0], '#64748b'),
      item('box', [1.4, 0.08, 0.8], [0, 0.25, 0], color),
    ];
  }
  if (/\b(wall|barrier|platform|floor|base)\b/.test(n)) {
    return [item('box', [2, 0.15, 2], [0, 0.075, 0], color)];
  }
  if (/\b(pendulum|swing)\b/.test(n)) {
    return [
      item('box', [0.6, 0.08, 0.08], [0, 2, 0], '#64748b'),
      item('cylinder', [0.02, 1.2, 0.02], [0, 1.4, 0], '#94a3b8'),
      item('sphere', [0.2, 0.2, 0.2], [0, 0.6, 0], color),
    ];
  }
  if (/\b(domino|dominoes)\b/.test(n)) {
    return Array.from({ length: 5 }, (_, i) =>
      item('box', [0.08, 0.4, 0.2], [i * 0.25 - 0.5, 0.2, 0], color),
    );
  }
  if (/\b(crane|assembly|workspace|module|structure|vehicle|robot)\b/.test(n)) {
    return [
      item('box', [1.2, 0.2, 0.6], [0, 0.1, 0], '#64748b'),
      item('cylinder', [0.06, 1.2, 0.06], [0.6, 0.7, 0], '#f97316'),
      item('box', [0.5, 0.08, 0.08], [0.6, 1.3, 0], color),
      item('cone', [0.2, 0.3, 0.2], [-0.5, 0.35, 0], '#22d3ee'),
    ];
  }

  if (/\b(and|with|plus)\b/.test(n)) {
    const parts: BlueprintItem[] = [];
    if (/\b(box|cube)\b/.test(n)) parts.push(item('box', [0.7, 0.7, 0.7], [-0.6, 0.35, 0], parseColor(prompt, '#3b82f6')));
    if (/\b(sphere|ball)\b/.test(n)) parts.push(item('sphere', [0.4, 0.4, 0.4], [0.6, 0.4, 0], parseColor(prompt, '#ef4444')));
    if (/\b(cylinder)\b/.test(n)) parts.push(item('cylinder', [0.3, 0.8, 0.3], [0, 0.4, 0.6], parseColor(prompt, '#22c55e')));
    if (parts.length > 0) return parts;
  }

  return [
    item('box', [0.8, 0.4, 0.8], [0, 0.2, 0], '#334155'),
    item('sphere', [0.35, 0.35, 0.35], [0, 0.75, 0], color),
  ];
}

export function parseModelType(prompt: string): string {
  const n = normalizePrompt(prompt);
  if (/\b(rocket|launch)\b/.test(n)) return 'rocket';
  if (/\b(orbital|orbit|satellite)\b/.test(n)) return 'orbital';
  if (/\b(aircraft|plane|airplane)\b/.test(n)) return 'fixed-wing';
  if (/\b(drone|quad|module|structure|bridge|tower|crane)\b/.test(n)) return 'modular';
  if (/\b(box|sphere|cube|ball|pendulum|domino|ramp|wall)\b/.test(n)) return 'modular';
  return 'point-mass';
}

export function simulateLocally(prompt: string): SimulationResult {
  const blueprint = buildBlueprintFromPrompt(prompt);
  const modelType = parseModelType(prompt);
  const n = normalizePrompt(prompt);
  const steps = 120;
  const timeline = Array.from({ length: steps }, (_, i) => i * 0.1);
  const trajectory: [number, number, number][] = [];

  const mass = 10;
  const g = 9.81;
  let x = 0, y = 2, z = 0;
  let vx = n.includes('push') || n.includes('launch') ? 3 : 0;
  let vy = n.includes('drop') || n.includes('fall') ? 0 : 0.5;
  let vz = 0;

  for (let i = 0; i < steps; i++) {
    trajectory.push([x, y, z]);
    vy -= g * 0.01;
    x += vx * 0.01;
    y += vy * 0.01;
    z += vz * 0.01;
    if (y < 0.2) {
      y = 0.2;
      vy *= -0.35;
      vx *= 0.85;
    }
  }

  return {
    success: true,
    physicsPassed: y >= 0,
    message: `LOCAL_PREVIEW: Built ${blueprint.length} part(s) as "${modelType}" — connect backend for full SciPy validation.`,
    modelType,
    blueprint,
    trajectory,
    timeline,
    parameters: { mass, gravity: g },
    source: 'local',
  };
}
