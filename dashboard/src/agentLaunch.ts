// An agent launch: the developer asks the local launch boundary
// (`../server/agentLaunchPlugin.ts`) to start an agent host on one published
// work item, for one activity. It requests an agent assignment -- the
// published fact Taken and Preparing already derive from -- and origin still
// decides every story fact; a launch record is only this machine's evidence
// that a host session was started. Request, host session, result, and record
// are spelled once here, with the endpoint and its limits, and no Node import,
// so the browser and the server read the same shapes. Host and activity
// values are the shared profile vocabulary.

import { z } from "zod";
import type { PublishedWork } from "./publishedWork.ts";
import {
  agentActivities,
  agentHosts,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const agentLaunchEndpoint = "/__agent-launch";

// A work item's identity and title each fit on one line of this length; a
// developer instruction may span lines up to its own bound.
export const launchTextLimit = 200;
export const launchInstructionLimit = 4_000;

const oneLine = z
  .string()
  .min(1)
  .max(launchTextLimit)
  .regex(/^[^\r\n]*$/);

export const agentLaunchRequestSchema = z.object({
  source: z.string().min(1).max(launchTextLimit),
  identity: oneLine,
  title: oneLine,
  activity: z.enum(agentActivities),
  host: z.enum(agentHosts),
  instruction: z.string().max(launchInstructionLimit).optional(),
});

export type AgentLaunchRequest = z.infer<typeof agentLaunchRequestSchema>;

// The session a host started, as the host itself lists it: `shortId` is what
// the host's own commands (`claude attach <shortId>`) take.
export const hostSessionSchema = z.object({
  host: z.enum(agentHosts),
  sessionId: z.string().min(1),
  shortId: z.string().min(1),
  name: z.string(),
});

export type HostSession = z.infer<typeof hostSessionSchema>;

// A confirmed launch, kept only by the running server.
export const launchRecordSchema = z.object({
  request: agentLaunchRequestSchema,
  session: hostSessionSchema,
  launchedAt: z.iso.datetime(),
});

export type LaunchRecord = z.infer<typeof launchRecordSchema>;

// The latest record of one work item among a project's records, oldest first.
export function latestRecordOf(
  records: readonly LaunchRecord[],
  identity: string,
): LaunchRecord | undefined {
  return records.findLast((record) => record.request.identity === identity);
}

// Whether a launch still awaits publication in this snapshot: origin has not
// yet published the assignment its activity asks for, and the work item is
// still queued. An execution launch settles once its work item is Taken or
// gone from the backlog; a published preparation assignment does not settle
// it, because the launched agent may ready a story before taking it. Only
// execution is launched, so no other activity's settlement is spelled here.
export function launchAwaitsPublication(
  record: LaunchRecord,
  work: Pick<PublishedWork, "backlog">,
): boolean {
  return work.backlog.some(
    (entry) => entry.identity === record.request.identity,
  );
}

// Why nothing was launched.
export const launchFailureReasons = [
  "folder-not-found",
  "not-installed",
  "folder-not-trusted",
  "refused",
  "unavailable",
] as const;

// Why a launch may or may not have started a session: the launch wait
// expired, or the host exited without a session this boundary could confirm.
export const launchUncertaintyReasons = ["timed-out", "unconfirmed"] as const;

export const launchResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("launched"), record: launchRecordSchema }),
  z.object({
    kind: z.literal("failed"),
    reason: z.enum(launchFailureReasons),
    explanation: z.string().min(1),
  }),
  z.object({
    kind: z.literal("uncertain"),
    reason: z.enum(launchUncertaintyReasons),
    explanation: z.string().min(1),
  }),
]);

export type LaunchResult = z.infer<typeof launchResultSchema>;

// One project's launch records, as the boundary answers a GET.
export const launchRecordsSchema = z.object({
  records: z.array(launchRecordSchema),
});
