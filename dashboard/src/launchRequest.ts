// Launch request and recorded-request contracts shared by the browser and server.
import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  sessionPolicy,
  sessionPolicyChoices,
  sessionPolicyFlags,
} from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import { launchWorkflowNames } from "./launchWorkflow.ts";
import { type LaunchModel } from "./hostDescription.ts";
import { launchModelSchema, launchSettingSchema } from "./launchHostOptions.ts";

export const agentLaunchEndpoint = "/__agent-launch";

// A work item's identity and title each fit on one line of this length; a
// developer instruction may span lines up to its own bound.
export const launchTextLimit = 200;
export const launchInstructionLimit = 4_000;

// At most this many flags may be selected.
const launchOptionLimit = 32;

const oneLine = z
  .string()
  .min(1)
  .max(launchTextLimit)
  .regex(/^[^\r\n]*$/);

// What either kind of request carries beside its subject: the developer's own
// instruction, the model asked for, and the flags selected from the skill's
// options, if any. Which flags exist is the project's installed definition.
const launchOptions = {
  instruction: z.string().max(launchInstructionLimit).optional(),
  model: launchModelSchema.optional(),
  effort: launchSettingSchema.optional(),
  options: z.array(oneLine).max(launchOptionLimit).optional(),
};

// A session's policy as the shared definition spells its three choices
// (`session-policy.mjs`): tracking, workspace, and landing. A request or
// record without one has the default policy: standard tracking in an isolated
// workspace, published through the workflow's own lifecycle.
export const sessionPolicySchema = z.object({
  tracking: z.enum(sessionPolicyChoices.tracking.values),
  workspace: z.enum(sessionPolicyChoices.workspace.values),
  landing: z.enum(sessionPolicyChoices.landing.values),
});

export type SessionPolicy = z.infer<typeof sessionPolicySchema>;

export const defaultSessionPolicy: SessionPolicy = sessionPolicy({});

// A request's or record's policy, the default when it names none.
export function policyOf(request: {
  readonly policy?: SessionPolicy | undefined;
}): SessionPolicy {
  return request.policy ?? defaultSessionPolicy;
}

// What a story's command line takes after its skill, as every host and the
// dialog spell it: the work item's identity, the flags of its policy, then
// the options selected.
export function launchArguments(request: {
  readonly identity: string;
  readonly policy?: SessionPolicy | undefined;
  readonly options?: readonly string[] | undefined;
}): string[] {
  return [
    request.identity,
    ...sessionPolicyFlags(policyOf(request)),
    ...(request.options ?? []),
  ];
}

// The observed existing changes in the default checkout a developer confirmed
// may join the session's result: the fingerprint of what the dashboard showed
// (`../server/defaultCheckoutChanges.ts`). Transient: never recorded.
export const existingChangesSchema = z.string().regex(/^[0-9a-f]{64}$/);

const storyLaunchRequestSchema = z.object({
  source: z.string().min(1).max(launchTextLimit),
  identity: oneLine,
  title: oneLine,
  workflow: z.enum(launchWorkflowNames),
  host: z.enum(agentHosts),
  ...launchOptions,
  policy: sessionPolicySchema.optional(),
  existingChanges: existingChangesSchema.optional(),
});

// A session in a project with no story or skill: the request carries no
// title or identity, since the server derives the label
// (`../server/hostLaunch.ts`), and one naming an identity is refused.
const adHocLaunchRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  workflow: z.literal("ad-hoc"),
  host: z.enum(agentHosts),
  ...launchOptions,
});

export const agentLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema,
  adHocLaunchRequestSchema,
]);

export type StoryLaunchRequest = z.infer<typeof storyLaunchRequestSchema>;
export type AgentLaunchRequest = z.infer<typeof agentLaunchRequestSchema>;

// Retries belong to the same project, host, workflow and subject. New options
// or story instructions do not replace a retained launch's original intent.
export function sameLaunch(
  a: AgentLaunchRequest | RecordedLaunchRequest,
  b: AgentLaunchRequest | RecordedLaunchRequest,
): boolean {
  return (
    a.source === b.source &&
    a.host === b.host &&
    a.workflow === b.workflow &&
    ("identity" in a && "identity" in b
      ? a.identity === b.identity
      : a.instruction === b.instruction)
  );
}

// What a launch dialog hands its caller: the developer's choices among the
// request's options, as typed, before the request trims and omits them.
export type LaunchChoices = {
  readonly host: AgentLaunchRequest["host"];
  readonly instruction: NonNullable<StoryLaunchRequest["instruction"]>;
  // Absent for Default: the selected host's configured setting applies.
  readonly model?: LaunchModel;
  readonly effort?: string;
  // The flags selected, absent when none.
  readonly options?: readonly string[];
  // The session's policy, absent for the default.
  readonly policy?: SessionPolicy;
  // The fingerprint of the existing changes the developer confirmed.
  readonly existingChanges?: string;
};

// The choices as a request carries them: the chosen host, trimmed text
// omitted when empty, and the model, options, policy
// and confirmation only when chosen.
export function requestedChoices({
  host,
  instruction,
  model,
  effort,
  options,
  policy,
  existingChanges,
}: LaunchChoices) {
  const own = instruction.trim();
  return {
    host,
    ...(own === "" ? {} : { instruction: own }),
    ...(model === undefined ? {} : { model }),
    ...(effort === undefined ? {} : { effort }),
    ...(options === undefined || options.length === 0
      ? {}
      : { options: [...options] }),
    ...(policy === undefined ? {} : { policy }),
    ...(existingChanges === undefined ? {} : { existingChanges }),
  };
}

// The request a record keeps: an ad hoc one with the label the server
// derived as its title, and a story's without a confirmation.
export const recordedLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema.omit({ existingChanges: true }),
  adHocLaunchRequestSchema.extend({ title: oneLine }),
]);

export type RecordedLaunchRequest = z.infer<typeof recordedLaunchRequestSchema>;
