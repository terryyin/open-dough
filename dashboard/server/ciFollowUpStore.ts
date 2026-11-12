// Receipt admission and spent allowances share one lock. Never prune this
// ledger with the bounded chart history or recover it empty.
import { z } from "zod";
import { priorBuildReferenceSchema } from "../src/ciPriorBuildReference.ts";
import { followUpRuleSchema } from "../src/ciFollowUpRule.ts";
import { keptBuildSchema } from "./landedCiObservation.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  leaveMachineJson,
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
  type StoreRead,
} from "./machineJsonStore.ts";
import type { LandingReference } from "./landedCiHistoryStore.ts";
import { launchLandingSchema } from "../src/launchLanding.ts";

export { followUpRule } from "../src/ciFollowUpRule.ts";
const jobSchema = z.object({
  databaseId: z.number().int().positive(),
  name: z.string().min(1),
  run_id: z.number(),
  head_sha: z.string(),
  started_at: z.string(),
  completed_at: z.string(),
  status: z.string(),
});
export const repeatRequestSchema = z.object({
  repository: z.string(),
  workflow: z.string(),
  workflowId: z.number(),
  original: keptBuildSchema,
  reference: priorBuildReferenceSchema,
  rule: followUpRuleSchema,
  originalJobs: z.array(jobSchema).min(1),
  requestedAt: z.string(),
  submission: z.object({
    kind: z.enum(["intent", "accepted", "refused", "uncertain"]),
    explanation: z.string().optional(),
  }),
  outcome: z.object({
    settled: z.boolean().optional(),
    observed: z
      .object({
        runId: z.number(),
        runAttempt: z.number(),
        revision: z.string(),
        workflowId: z.number(),
        status: z.string().optional(),
        conclusion: z.string().nullable().optional(),
        runUrl: z.string().optional(),
        startedAt: z.string().optional(),
        completedAt: z.string().optional(),
      })
      .optional(),
    kind: z.enum(["unverified", "progress", "slow", "recovered"]),
    explanation: z.string(),
    repeat: keptBuildSchema.optional(),
  }),
});
export type RepeatRequest = z.infer<typeof repeatRequestSchema>;
export type RepeatJob = z.infer<typeof jobSchema>;
const landingSchema = z.object({
  project: z.string(),
  revision: z.string(),
  target: z.string(),
  identity: z.string().optional(),
  receipts: z.array(z.string()),
  eligible: z.boolean(),
  capture: launchLandingSchema.optional(),
  assessment: z
    .object({
      original: keptBuildSchema,
      reference: priorBuildReferenceSchema,
      explanation: z.string(),
    })
    .optional(),
  request: repeatRequestSchema.optional(),
});
const schema = z.object({
  landings: z.record(z.string(), landingSchema),
});
export type FollowUpLedger = z.infer<typeof schema>;
export const followUpStore = (): MachineJsonStore<FollowUpLedger> => ({
  file: machineDashboardPath("ci-follow-up.json"),
  schema,
  empty: { landings: {} },
  unreadable: "preserve" as const,
  durable: true,
});
export const followUpKey = (
  project: string,
  landing: Pick<LandingReference, "target" | "revision">,
) => JSON.stringify([project, landing.target, landing.revision]);
export const readFollowUps = (): Promise<StoreRead<FollowUpLedger>> =>
  readMachineJson(followUpStore());
export const changeFollowUps = (
  change: (ledger: FollowUpLedger) => FollowUpLedger | typeof leaveMachineJson,
) => replaceMachineJson(followUpStore(), change);
