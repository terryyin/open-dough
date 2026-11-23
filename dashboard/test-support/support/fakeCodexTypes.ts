// Native protocol fixture controls shared by launch, recovery and observation journeys.
import type { WebSocket } from "ws";

export type FakeCodexObservation = {
  status: { type: string; activeFlags?: readonly string[] };
  turns: { id: string; status: string; items?: unknown[] }[];
  metadataError?: unknown;
  historyError?: unknown;
  holdRead?: boolean;
};

export type CodexCall = { method: string; params: Record<string, unknown> };
export type FakeCodex = {
  models: Array<{
    model: string;
    displayName: string;
    description: string;
    supportedReasoningEfforts: Array<{
      reasoningEffort: string;
      description: string;
    }>;
  }>;
  modelPageSize: number;
  catalogError?: unknown;
  configError?: unknown;
  holdCatalog: boolean;
  effectiveModel?: string;
  effectiveEffort?: string;
  configuredModel?: string | null;
  configuredModels?: Record<string, string>;
  readonly binDir: string;
  readonly env: Record<string, string>;
  readonly calls: CodexCall[];
  readonly sockets: Set<WebSocket>;
  readonly observations: Map<string, FakeCodexObservation>;
  readonly names: Map<string, string>;
  renameError?: unknown;
  interruptError?: unknown;
  beforeInterrupt?: (threadId: string, turnId: string) => void;
  releaseReads(): void;
  threadId: string;
  hold: boolean;
  holdCreation: boolean;
  refuseCreation: boolean;
  creationError: unknown;
  refuseInput: boolean;
  loseCreation: boolean;
  failRead: boolean;
  readError: boolean;
  blankHistoryError?: unknown;
  beforeRead?: (includeTurns: boolean) => void;
  completeOnResume: boolean;
  resumeStatus?: string;
  history: { id: string; status?: string; items: unknown[] }[];
  cwd: string;
  afterCreation?: () => void;
  afterAcceptance: "continue" | "complete" | "disconnect";
  beforeInput?: () => void;
  release(): void;
  failConnection(): void;
  close(): Promise<void>;
};
