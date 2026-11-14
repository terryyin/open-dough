// Dashboard-owned request evidence. Native observations and task associations
// are separate so collector/import overlap cannot charge one response twice.
import { z } from "zod";

const counter = z.number().int().nonnegative().nullable();
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
});
const measurementSchema = z.object({
  source: usageSourceSchema,
  settings: usageSettingsSchema,
  settingsSource: usageSourceSchema.optional(),
  turnId: z.string().optional(),
  rootTurnId: z.string().optional(),
  parentSessionId: z.string().optional(),
  at: z.iso.datetime().optional(),
  definition: z.enum(["codex-inclusive-input", "claude-disjoint-input"]),
  reported: z.record(z.string(), z.number().int().nonnegative()),
  tokens: usageTokensSchema,
});
export const usageObservationSchema = z.object({
  id: z.string().min(1),
  host: z.enum(["codex", "claude"]),
  sessionId: z.string().min(1),
  responseId: z.string().min(1),
  turnId: z.string().optional(),
  rootTurnId: z.string().optional(),
  parentSessionId: z.string().optional(),
  at: z.iso.datetime().optional(),
  scope: z.literal("response"),
  settings: usageSettingsSchema,
  measurements: z.array(measurementSchema),
  tokens: usageTokensSchema,
  coverage: z.enum(["measured", "partial", "unavailable"]),
  gaps: z.array(z.string()),
});
export const usageTaskSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("launch"),
  project: z.string().min(1),
  host: z.enum(["codex", "claude"]),
  sessionId: z.string().min(1),
  rootTurnId: z.string().optional(),
  workflow: z.string(),
  identity: z.string().nullable(),
  title: z.string(),
  launchedAt: z.iso.datetime(),
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
export const usageHistorySchema = z.object({
  version: z.literal(1),
  tasks: z.record(z.string(), usageTaskSchema),
  observations: z.record(z.string(), usageObservationSchema),
  associations: z.record(z.string(), usageAssociationSchema),
  gaps: z.array(usageGapSchema),
});
export type UsageTokens = z.infer<typeof usageTokensSchema>;
export type UsageSource = z.infer<typeof usageSourceSchema>;
export type UsageSettings = z.infer<typeof usageSettingsSchema>;
export type UsageObservation = z.infer<typeof usageObservationSchema>;
export type UsageTask = z.infer<typeof usageTaskSchema>;
export type UsageAssociation = z.infer<typeof usageAssociationSchema>;
export type UsageGap = z.infer<typeof usageGapSchema>;
export type UsageHistory = z.infer<typeof usageHistorySchema>;
export type UsageBatch = {
  tasks?: UsageTask[];
  observations?: UsageObservation[];
  associations?: UsageAssociation[];
  gaps?: UsageGap[];
};
export const emptyUsageTokens = (): UsageTokens => ({
  uncachedInput: null,
  cacheRead: null,
  cacheWrite: null,
  output: null,
  reasoningOutput: null,
  cacheWrite5m: null,
  cacheWrite1h: null,
});
export const emptyUsageHistory = (): UsageHistory => ({
  version: 1,
  tasks: {},
  observations: {},
  associations: {},
  gaps: [],
});
export const responseKey = (
  host: string,
  sessionId: string,
  responseId: string,
): string => JSON.stringify([host, sessionId, responseId]);
