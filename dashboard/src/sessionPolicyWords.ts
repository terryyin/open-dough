// How a launch's session policy reads (`./launchRequest.ts`): the label of
// each choice and its values, in the order a dialog offers them, the short
// summary a dialog keeps beside Start, and the sentence of what a one-shot
// session does. The meanings and flags are the shared definition's
// (`session-policy.mjs`); only the words are spelled here.

import type { SessionPolicy } from "./launchRequest.ts";
import type { LaunchWorkflow } from "./launchWorkflow.ts";

type ChoiceWords<Value extends string> = {
  readonly legend: string;
  readonly values: Readonly<Record<Value, string>>;
};

export const sessionChoiceWords: {
  readonly [Choice in keyof SessionPolicy]: ChoiceWords<SessionPolicy[Choice]>;
} = {
  tracking: {
    legend: "Tracking",
    values: { standard: "Standard", "one-shot": "One-shot" },
  },
  workspace: {
    legend: "Workspace",
    values: {
      isolated: "Isolated workspace",
      "default-checkout": "Default main",
    },
  },
  landing: {
    legend: "After checks",
    values: { review: "Wait for review", "auto-land": "Automatically land" },
  },
};

export const oneShotHint = "One-shot creates no published assignment.";
export const autoLandHint = "Automatically land the verified checkout result.";

// `Isolated workspace · One-shot · Wait for review`: where, how tracked, and
// what follows the checks.
export function sessionSummary(policy: SessionPolicy): string {
  return [
    sessionChoiceWords.workspace.values[policy.workspace],
    sessionChoiceWords.tracking.values[policy.tracking],
    sessionChoiceWords.landing.values[policy.landing],
  ].join(" · ");
}

// What a one-shot session does, for the dialog's line beside Start under its
// summary: that it publishes no assignment, and whether its result waits for
// review or lands.
export function oneShotEffect(
  workflow: LaunchWorkflow,
  policy: SessionPolicy,
): string {
  const result =
    workflow === "refinement" ? "recorded refinement" : "verified result";
  return policy.landing === "auto-land"
    ? `No assignment is published; the ${result} lands on origin without another review. Pressing Start authorizes that push.`
    : `No assignment is published; the ${result} waits for review and nothing is pushed.`;
}

// Where a one-shot session runs, for Command details: a kept start's shown
// workspace when it continues one.
export function oneShotWhere(policy: SessionPolicy, keptIn?: string): string {
  return `The session runs ${
    keptIn !== undefined
      ? `in workspace ${keptIn}`
      : policy.workspace === "default-checkout"
        ? "in this project's folder on default main, with its existing changes"
        : "in a new workspace under .worktrees/"
  }.`;
}
