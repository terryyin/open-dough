// Launch request and recorded-request contracts shared by the browser and server.
import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  launchModelAliases,
  launchWorkflowNames,
  type LaunchModel,
} from "./launchWorkflow.ts";

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
  model: z.enum(launchModelAliases).optional(),
  options: z.array(oneLine).max(launchOptionLimit).optional(),
};

const storyLaunchRequestSchema = z.object({
  source: z.string().min(1).max(launchTextLimit),
  identity: oneLine,
  title: oneLine,
  workflow: z.enum(launchWorkflowNames),
  host: z.enum(agentHosts),
  ...launchOptions,
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

// What a launch dialog hands its caller: the developer's choices among the
// request's options, as typed, before the request trims and omits them.
export type LaunchChoices = {
  readonly host?: AgentLaunchRequest["host"];
  readonly instruction: NonNullable<StoryLaunchRequest["instruction"]>;
  // Absent for Default: Claude Code's own setting applies.
  readonly model?: LaunchModel;
  // The flags selected, absent when none.
  readonly options?: readonly string[];
};

// The request a record keeps: an ad hoc one with the label the server
// derived as its title.
export const recordedLaunchRequestSchema = z.discriminatedUnion("workflow", [
  storyLaunchRequestSchema,
  adHocLaunchRequestSchema.extend({ title: oneLine }),
]);

export type RecordedLaunchRequest = z.infer<typeof recordedLaunchRequestSchema>;
