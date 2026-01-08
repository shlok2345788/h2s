# Model & Request Flow

This document explains how a question is analyzed end-to-end across the frontend, Node/Express API, and the Python ML service.

## High-level flow
- Frontend calls POST `/analyze-question` via the helper in [frontend/src/api/analyzer.ts](frontend/src/api/analyzer.ts), passing `question`, `subject`, and `type`, plus `x-api-key` when present.
- Express wires the route in [backend/src/index.ts](backend/src/index.ts) and delegates to the analyzer router in [backend/src/controllers/analyze.controller.ts](backend/src/controllers/analyze.controller.ts) after API key auth and rate limiting.
- The service logic in [backend/src/services/analyze.service.ts](backend/src/services/analyze.service.ts) cleans the input and orchestrates three signal sources in parallel: Google Cloud Natural Language (syntax/keywords), the Python inference service, and (optionally) a Vertex AI endpoint. It also logs the request metadata to the in-memory store/placeholder Firestore client.
- A deterministic heuristic remains as the final safety net if any external model is unavailable.

## Backend pipeline
- **Validation & auth**: The request body is validated in [backend/src/schemas/analyze.schema.ts](backend/src/schemas/analyze.schema.ts), and API keys are enforced in middleware (`apiKeyAuth`, `rateLimit`).
- **Orchestration**: [backend/src/services/analyze.service.ts](backend/src/services/analyze.service.ts)
  - Normalizes whitespace on the prompt.
  - Runs `analyzeWithGcpNl` and `callPythonInference` concurrently; the Python result is preferred, otherwise falls back to the built-in heuristic scorer (difficulty + quality + flags + keywords).
  - If GCP NL is available ([backend/src/clients/gcpNl.client.ts](backend/src/clients/gcpNl.client.ts)), augments flags (passive voice, multiple clauses) and merges extracted keywords.
  - Calls Vertex AI if configured ([backend/src/clients/vertexAi.client.ts](backend/src/clients/vertexAi.client.ts)) to override difficulty/quality/explanation when a deployed model responds.
  - Writes a lightweight analysis log via [backend/src/clients/firestore.client.ts](backend/src/clients/firestore.client.ts) (currently in-memory).
- **Heuristic scoring** (same file) estimates difficulty from technical tokens/length, quality from clarity/length, and flags ambiguity/over-breadth or vagueness.
- **Type contracts**: Response shape lives in [backend/src/types/index.ts](backend/src/types/index.ts) as `AnalysisResult` (`difficulty`, `qualityScore`, `flags`, `explanation`, `suggestedFix`, optional `keywords`, `shapTokens`).

## Python ML service (ml_service)
- Entry point: [ml_service/inference.py](ml_service/inference.py). `QuestionAnalyzerService.analyze` loads trained models once, extracts features, runs predictions, detects flags, and assembles a rich response (difficulty + confidence, quality score/grade + confidence, readability, flags with titles/suggestions, top feature importance, suggested improvements, overall confidence, model_version).
- Features: [ml_service/features.py](ml_service/features.py) extracts linguistic stats (word/sentence counts, passive ratio), readability metrics (Flesch, FK grade, Gunning Fog, SMOG), Bloom verb levels, SBERT embeddings, and semantic entropy.
- Flagging: [ml_service/flags.py](ml_service/flags.py) combines rule-based checks (length, pronouns, missing context, vague quantifiers, multiple question marks, absent verbs) with ML-side signals (low confidence, high entropy, high cognitive demand without support) and maps them to user-facing titles/suggestions.
- Models: [ml_service/models.py](ml_service/models.py) trains an XGBoost/RandomForest classifier for difficulty and a RandomForest regressor for quality. It saves artifacts under `ml_service/models/` and supports SHAP-based explanation. Training expects `training_data.csv` with `question,difficulty,quality_score` and builds PCA-reduced embedding features.

## Response assembly and fallbacks
- Primary result comes from the Python service via [backend/src/clients/pythonInference.client.ts](backend/src/clients/pythonInference.client.ts); if the service is unreachable or returns an error, the Node heuristic is used.
- GCP NL signals are additive only (extra flags/keywords). Vertex AI can overwrite `difficulty`, `qualityScore`, and `explanation` if configured. If neither GCP nor Vertex credentials exist, the pipeline still returns a heuristic or Python result.

## Request/response contract
- **Request**: `{ question: string; subject: string; type: 'MCQ' | 'Theory' }` validated in [backend/src/schemas/analyze.schema.ts](backend/src/schemas/analyze.schema.ts).
- **Response**: `{ result: AnalysisResult }` where `AnalysisResult` includes at minimum `difficulty`, `qualityScore`, `flags`, `explanation`, `suggestedFix`, and echoes `question` plus optional `keywords`/`shapTokens`. When the Python service is active, the response is richer (confidence, readability, feature importance, structured flags).

## Configuration knobs
- Environment values are read in [backend/src/config/env.ts](backend/src/config/env.ts): `PYTHON_INFERENCE_URL`, `VERTEX_ENDPOINT_ID`/`GCP_PROJECT_ID`/`GCP_LOCATION` for Vertex, `GOOGLE_APPLICATION_CREDENTIALS` for GCP NL, `RATE_LIMIT_PER_MIN`, `USE_IN_MEMORY_DB`, etc.
- The Python service must run separately (e.g., `uvicorn app:app` or Flask, depending on deployment) and expose `PYTHON_INFERENCE_URL` to the Node API.

## How to extend
- Swap or improve heuristics in [backend/src/services/analyze.service.ts](backend/src/services/analyze.service.ts) without touching the external model paths.
- Add new flags or feature logic in [ml_service/flags.py](ml_service/flags.py) or [ml_service/features.py](ml_service/features.py); retrain via [ml_service/models.py](ml_service/models.py) to propagate learned behavior.
- Expose more metadata from the Python response through the TypeScript types in [backend/src/types/index.ts](backend/src/types/index.ts) and surface them in the frontend UI.
