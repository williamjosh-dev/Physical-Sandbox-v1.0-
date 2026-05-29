import { useCallback } from 'react';
const BACKEND_URL = '/simulate';
async function fetchSimulationPayload(prompt) {
    const payload = { prompt };
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
        const data = (await response.json());
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
            t: Array.isArray(data.t) ? data.t.map(Number).filter((value) => !Number.isNaN(value)) : [],
            y: Array.isArray(data.y)
                ? data.y.map((row) => (Array.isArray(row) ? row.map(Number).filter((value) => !Number.isNaN(value)) : []))
                : [],
            error: data.error,
        };
    }
    catch (error) {
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
    return useCallback(async (prompt) => {
        return fetchSimulationPayload(prompt);
    }, []);
}
