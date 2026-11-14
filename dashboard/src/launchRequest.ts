// Launch request and recorded-request contracts shared by the browser and server.
import { z } from "zod";
import { agentHosts } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { sessionPolicyFlags } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-policy.mjs";
import { baseCiConfirmationSchema } from "./baseCiConfirmation.ts";
import { launchWorkflowNames } from "./launchWorkflow.ts";
import { launchModelSchema, launchSettingSchema } from "./launchHostOptions.ts";
import { followUpSchema, sameFollowUpSource } from "./followUpRequest.ts";
import {
  policyOf,
  sameUnattachedPolicy,
  sessionPolicySchema,
  unattachedPolicyOf,
  unattachedSessionPolicySchema,
  type SessionPolicy,
} from "./launchRequestSessionPolicy.ts";

export {
  defaultSessionPolicy,
  policyOf,
  sameUnattachedPolicy,
  sessionPolicySchema,
  unattachedPolicyOf,
  unattachedSessionPolicySchema,
  type SessionPolicy,
  type UnattachedSessionPolicy,
} from "./launchRequestSessionPolicy.ts";

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
// Attachment claim ids are transient Start uploads; absolute attachment paths
// and content digests are recorded after admission. None of these fields
// carries image bytes; digests identify an ad hoc launch's images.
const launchAttachmentPathLimit = 4_096;
const launchAttachmentDigest = z.string().regex(/^[0-9a-f]{64}$/);
const launchOptions = {
  instruction: z.string().max(launchInstructionLimit).optional(),
  model: launchModelSchema.optional(),
  effort: launchSettingSchema.optional(),
  options: z.array(oneLine).max(launchOptionLimit).optional(),
  attachmentClaims: z.array(z.uuid()).max(5).optional(),
  attachments: z
    .array(z.string().min(1).max(launchAttachmentPathLimit))
    .max(5)
    .optional(),
  attachmentDigests: z.array(launchAttachmentDigest).max(5).optional(),
};

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

// A work item's identity as a request names it.
export const workIdentitySchema = oneLine;

const storyLaunchRequestSchema = z.object({
  source: z.string().min(1).max(launchTextLimit),
  identity: workIdentitySchema,
  title: oneLine,
  workflow: z.enum(launchWorkflowNames),
  host: z.enum(agentHosts),
  ...launchOptions,
  policy: sessionPolicySchema.optional(),
  existingChanges: existingChangesSchema.optional(),
  // Confirmed origin-target CI judgment for a new execution start. Transient.
  baseCi: baseCiConfirmationSchema.optional(),
  // Explicit override of an unconfirmed stop's replacement-writer block
  // in the same workspace. Transient: never recorded.
  overrideStopUnconfirmed: z.boolean().optional(),
});

// A session in a project with no story or skill: the request carries no
// title or identity, since the server derives the label
// (`../server/hostLaunch.ts`), and one naming an identity is refused. Its
// policy is the unattached one, and it confirms existing changes as a story's
// does. One the dashboard's feedback maintenance check starts
// (`../server/feedbackMaintenanceCheck.ts`) carries the due date it serves as
// its marker, which only that check sets, never a page. One started from an
// entry's Follow up names the entry it follows up (`./followUpRequest.ts`).
const adHocLaunchRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  workflow: z.literal("ad-hoc"),
  host: z.enum(agentHosts),
  ...launchOptions,
  policy: unattachedSessionPolicySchema.optional(),
  maintenance: z.strictObject({ due: z.iso.date() }).optional(),
  followUp: followUpSchema.optional(),
  existingChanges: existingChangesSchema.optional(),
  overrideStopUnconfirmed: z.boolean().optional(),
});

export const agentLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema,
  adHocLaunchRequestSchema,
]);

export type StoryLaunchRequest = z.infer<typeof storyLaunchRequestSchema>;
export type AgentLaunchRequest = z.infer<typeof agentLaunchRequestSchema>;

// A request as it is kept: without transient confirmation of existing changes,
// base CI, or attachment claim ids (bytes stay out of JSON stores; paths are
// set only after admission materializes claims).
export function withoutConfirmation(
  request: AgentLaunchRequest,
): AgentLaunchRequest {
  const kept = { ...request };
  delete kept.existingChanges;
  if ("baseCi" in kept) delete kept.baseCi;
  delete kept.overrideStopUnconfirmed;
  delete kept.attachmentClaims;
  return kept;
}

// Paths and claim ids are not identity; ordered content digests are.
function sameAttachmentDigests(
  a: AgentLaunchRequest | RecordedLaunchRequest,
  b: AgentLaunchRequest | RecordedLaunchRequest,
): boolean {
  const left = a.attachmentDigests ?? [];
  const right = b.attachmentDigests ?? [];
  return left.length === right.length && left.every((d, i) => d === right[i]);
}

// Retries belong to the same project, host, workflow and subject. New options
// or story instructions do not replace a retained launch's original intent.
// An unattached launch's subject is its instruction with its Workspace and
// After checks choices, the content digests of its images, the due date a
// feedback maintenance launch serves, and the source a follow-up names (not
// its resolved context), so one with other choices, other images, for another
// due date or following up another entry is another launch.
export function sameLaunch(
  a: AgentLaunchRequest | RecordedLaunchRequest,
  b: AgentLaunchRequest | RecordedLaunchRequest,
): boolean {
  if (a.source !== b.source || a.host !== b.host) return false;
  if (a.workflow !== "ad-hoc" || b.workflow !== "ad-hoc")
    return (
      a.workflow === b.workflow &&
      "identity" in a &&
      "identity" in b &&
      a.identity === b.identity
    );
  return (
    a.instruction === b.instruction &&
    a.maintenance?.due === b.maintenance?.due &&
    sameFollowUpSource(a.followUp, b.followUp) &&
    sameUnattachedPolicy(unattachedPolicyOf(a), unattachedPolicyOf(b)) &&
    sameAttachmentDigests(a, b)
  );
}

export {
  type LaunchChoices,
  requestedChoices,
  requestedSettings,
} from "./launchChoices.ts";

// The request a record keeps: an ad hoc one with the label the server
// derived as its title, and neither kind with a confirmation.
export const reportingContextSchema = z.object({
  origin: z.url(),
  reference: z.uuid(),
  command: z.string().min(1),
  landingContext: z.string().min(1).optional(),
});
export type ReportingContext = z.infer<typeof reportingContextSchema>;

export const recordedLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema
    .omit({
      existingChanges: true,
      baseCi: true,
      overrideStopUnconfirmed: true,
      attachmentClaims: true,
    })
    .extend({ reporting: reportingContextSchema.optional() }),
  adHocLaunchRequestSchema
    .omit({
      existingChanges: true,
      overrideStopUnconfirmed: true,
      attachmentClaims: true,
    })
    .extend({
      title: oneLine,
      reporting: reportingContextSchema.optional(),
    }),
]);

export type RecordedLaunchRequest = z.infer<typeof recordedLaunchRequestSchema>;
