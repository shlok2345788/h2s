import { PredictionServiceClient, EndpointServiceClient } from '@google-cloud/aiplatform';
import { AnalysisRequest, Difficulty } from '../types';

export interface VertexPrediction {
  difficulty?: Difficulty;
  qualityScore?: number;
  explanation?: string;
  confidence?: number;
  modelVersion?: string;
}

export interface ModelMetadata {
  endpointId: string;
  modelId: string;
  version: string;
  deployed: boolean;
}

// Initialize Vertex AI clients
let predictionClient: PredictionServiceClient | null = null;
let endpointClient: EndpointServiceClient | null = null;

const PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const LOCATION = process.env.GCP_LOCATION || 'us-central1';
const ENDPOINT_ID = process.env.VERTEX_ENDPOINT_ID || '';

const getPredictionClient = () => {
  if (!predictionClient && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    predictionClient = new PredictionServiceClient({
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
    });
  }
  return predictionClient;
};

const getEndpointClient = () => {
  if (!endpointClient && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    endpointClient = new EndpointServiceClient({
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
    });
  }
  return endpointClient;
};

export const callVertexModel = async (payload: AnalysisRequest): Promise<VertexPrediction> => {
  const client = getPredictionClient();
  
  // Fallback to empty prediction if no credentials
  if (!client || !PROJECT_ID || !ENDPOINT_ID) {
    console.warn('Vertex AI not configured, using fallback');
    return {};
  }

  try {
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;
    
    // Prepare instance for prediction
    const instance = {
      question: payload.question,
      subject: payload.subject,
      bloom_level: payload.bloom_level,
    };

    const instanceValue = { structValue: { fields: instance } };
    const instances = [instanceValue];

    const [response] = await client.predict({
      endpoint,
      instances,
    });

    if (response.predictions && response.predictions.length > 0) {
      const prediction = response.predictions[0];
      
      return {
        difficulty: prediction.structValue?.fields?.difficulty?.stringValue as Difficulty,
        qualityScore: prediction.structValue?.fields?.quality_score?.numberValue,
        confidence: prediction.structValue?.fields?.confidence?.numberValue,
        explanation: prediction.structValue?.fields?.explanation?.stringValue,
        modelVersion: response.model || 'v1',
      };
    }

    return {};
  } catch (error) {
    console.error('Vertex AI prediction error:', error);
    return {};
  }
};

// Get model deployment status
export const getModelStatus = async (): Promise<ModelMetadata | null> => {
  const client = getEndpointClient();
  
  if (!client || !PROJECT_ID || !ENDPOINT_ID) {
    return null;
  }

  try {
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;
    const [response] = await client.getEndpoint({ name: endpoint });

    return {
      endpointId: ENDPOINT_ID,
      modelId: response.deployedModels?.[0]?.model || 'unknown',
      version: response.deployedModels?.[0]?.id || 'v1',
      deployed: (response.deployedModels?.length || 0) > 0,
    };
  } catch (error) {
    console.error('Error fetching model status:', error);
    return null;
  }
};

// List available endpoints
export const listEndpoints = async (): Promise<string[]> => {
  const client = getEndpointClient();
  
  if (!client || !PROJECT_ID) {
    return [];
  }

  try {
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
    const [endpoints] = await client.listEndpoints({ parent });

    return endpoints.map(ep => ep.displayName || 'unnamed');
  } catch (error) {
    console.error('Error listing endpoints:', error);
    return [];
  }
};
