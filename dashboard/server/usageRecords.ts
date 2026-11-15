// Dashboard-owned usage records. A response's native observation and its task
// association are what the readers produce and a writer passes
// (`UsageBatch`); the history keeps tasks, coverage gaps and each session's
// contribution (./usageContributions.ts), and no response.
import { z } from "zod";

const counter = z.number().int().nonnegative().nullable();
export const claudeStopReasonSchema = z.enum([
  "end_turn",
  "max_tokens",
  "stop_sequence",
  "tool_use",
  "pause_turn",
  "refusal",
  "model_context_window_exceeded",
]);
export const usageTokensSchema = z.object({
  uncachedInput: counter,
  cacheRead: counter,
  cacheWrite: counter,
  output: counter,
  reasoningOutput: counter,
  cacheWrite5m: counter,
  cacheWrite1h: counter,
});
export const usageSourceSchema = z.object({
  kind: z.enum(["native", "operational", "history", "git"]),
  file: z.string().min(1),
  line: z.number().int().positive().optional(),
  repository: z.string().optional(),
  revision: z.string().optional(),
});
export const usageSettingsSchema = z.object({
  model: z.string().optional(),
  effort: z.string().optional(),
  approvalPolicy: z.string().optional(),
  sandbox: z.string().optional(),
  // The service tier the host recorded as applied, such as Codex's
  // `default` or `fast` or Claude's speed `standard`; absent when none was
  // recorded.
  serviceTier: z.string().optional(),
});
const measurementSchema = z.object({
  nativeRowId: z.string().optional(),
  requestId: z.string().optional(),
  source: usageSourceSchema,
  settings: usageSettingsSchema,
  settingsSource: usageSourceSchema.optional(),
  agentId: z.string().optional(),
  turnId: z.string().optional(),
  rootTurnId: z.string().optional(),
  parentSessionId: z.string().optional(),
  at: z.iso.datetime().optional(),
  definition: z.enum(["codex-inclusive-input", "claude-disjoint-input"]),
  reported: z.record(z.string(), z.number().int().nonnegative()),
  tokens: usageTokensSchema,
  completion: z
    .object({
      stopReason: claudeStopReasonSchema
        .or(z.literal("unsupported"))
        .nullable(),
    })
    .optional(),
});
export const usageObservationSchema = z.object({
  id: z.string().min(1),
  host: z.enum(["codex", "claude"]),
  sessionId: z.string().min(1),
  responseId: z.string().min(1),
  agentId: z.string().optional(),
  turnId: z.string().optional(),
  rootTurnId: z.string().optional(),
  parentSessionId: z.string().optional(),
  at: z.iso.datetime().optional(),
  lastAt: z.iso.datetime().optional(),
  scope: z.literal("response"),
  settings: usageSettingsSchema,
  measurements: z.array(measurementSchema),
  tokens: usageTokensSchema,
  coverage: z.enum(["measured", "partial", "unavailable"]),
  gaps: z.array(z.string()),
});
export const usageTaskSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["launch", "recovered"]),
  project: z.string().min(1).nullable(),
  host: z.enum(["codex", "claude"]),
  sessionId: z.string().min(1),
  rootTurnId: z.string().optional(),
  nativeTurns: z.array(z.string()).optional(),
  workflow: z.string().nullable(),
  identity: z.string().nullable(),
  title: z.string().nullable(),
  launchedAt: z.iso.datetime().nullable(),
  origin: z.enum(["dashboard", "native", "unknown"]),
  launchReference: z.string().optional(),
  requested: usageSettingsSchema.extend({
    options: z.array(z.string()).optional(),
    policy: z
      .object({
        tracking: z.string().optional(),
        workspace: z.string().optional(),
        landing: z.string().optional(),
      })
      .optional(),
  }),
  assignmentEvidence: z
    .array(
      z.object({
        status: z.enum(["supported", "rejected"]),
        turnId: z.string(),
        source: usageSourceSchema,
        at: z.iso.datetime().optional(),
        reason: z.enum(["human-input", "injected-context"]),
      }),
    )
    .optional(),
  fieldSources: z.record(z.string(), z.array(usageSourceSchema)).optional(),
  fieldClaims: z
    .record(
      z.string(),
      z.array(
        z.object({
          value: z.union([
            z.string(),
            z.array(z.string()),
            z.record(z.string(), z.union([z.string(), z.boolean()]).optional()),
          ]),
          sources: z.array(usageSourceSchema),
        }),
      ),
    )
    .optional(),
  lastActivityAt: z.iso.datetime().optional(),
  outcome: z
    .object({
      kind: z.enum(["reported-complete", "reported-incomplete"]),
      attention: z.boolean().optional(),
      disposition: z.literal("returned-to-backlog").optional(),
      at: z.iso.datetime().optional(),
    })
    .nullable()
    .optional(),
  sources: z.array(usageSourceSchema),
  gaps: z.array(z.string()),
});
export const usageAssociationSchema = z.object({
  observationId: z.string(),
  taskId: z.string().nullable(),
  candidates: z.array(z.string()),
  sources: z.array(usageSourceSchema),
  gaps: z.array(z.string()),
});
export const usageGapSchema = z.object({
  code: z.string(),
  source: usageSourceSchema.optional(),
  taskId: z.string().optional(),
  sessionId: z.string().optional(),
  host: z.enum(["codex", "claude"]).optional(),
});
export type UsageTokens = z.infer<typeof usageTokensSchema>;
export type UsageSource = z.infer<typeof usageSourceSchema>;
export type UsageSettings = z.infer<typeof usageSettingsSchema>;
export type UsageObservation = z.infer<typeof usageObservationSchema>;
export type UsageMeasurement = UsageObservation["measurements"][number];
export type UsageTask = z.infer<typeof usageTaskSchema>;
export type UsageAssociation = z.infer<typeof usageAssociationSchema>;
export type UsageGap = z.infer<typeof usageGapSchema>;
export type UsageBatch = {
  tasks?: UsageTask[];
  observations?: UsageObservation[];
  associations?: UsageAssociation[];
  gaps?: UsageGap[];
};
// The four disjoint token categories a response's usage is summed in.
export const usageTokenCategories = [
  "uncachedInput",
  "cacheRead",
  "cacheWrite",
  "output",
] as const satisfies readonly (keyof UsageTokens)[];
export const emptyUsageTokens = (): UsageTokens => ({
  uncachedInput: null,
  cacheRead: null,
  cacheWrite: null,
  output: null,
  reasoningOutput: null,
  cacheWrite5m: null,
  cacheWrite1h: null,
});
export const responseKey = (
  host: string,
  sessionId: string,
  responseId: string,
): string => JSON.stringify([host, sessionId, responseId]);
