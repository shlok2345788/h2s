import { AnalysisRequest, AnalysisResult } from '../types';
import { env } from '../config/env';

// Node 18+ exposes fetch; use a loose type to avoid DOM lib dependency.
const fetchFn: any = (globalThis as unknown as { fetch?: any }).fetch;

export const callPythonInference = async (payload: AnalysisRequest): Promise<AnalysisResult | null> => {
  if (!env.pythonEndpoint || !fetchFn) {
    return null;
  }

  try {
    const res = await fetchFn(env.pythonEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Python service returned ${res.status}`);
    }

    const data = (await res.json()) as AnalysisResult;
    return data;
  } catch (error) {
    console.error('Python inference call failed:', error);
    return null;
  }
};
