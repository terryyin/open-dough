// How a launch's session policy reads (`./launchRequest.ts`): the label of
// each choice and its values, in the order a dialog offers them, the short
// summary a dialog keeps beside Start, and the sentence of what a one-shot
// session does. The meanings and flags are the shared definition's
// (`session-policy.mjs`); only the words are spelled here.

import type {
  SessionPolicy,
  UnattachedSessionPolicy,
} from "./launchRequest.ts";
import type { SessionPolicyOffer } from "./launchOffers.ts";
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

// Where a session in the default checkout runs.
const onDefaultMain =
  "in this project's folder on default main, with its existing changes";

// Where a session that starts now runs, by its workspace choice.
const startsIn = (workspace: SessionPolicy["workspace"]) =>
  workspace === "default-checkout"
    ? onDefaultMain
    : "in a new workspace under .worktrees/";

// Where a one-shot session runs, for Command details: a kept start's shown
// workspace when it continues one.
export function oneShotWhere(policy: SessionPolicy, keptIn?: string): string {
  return `The session runs ${
    keptIn !== undefined ? `in workspace ${keptIn}` : startsIn(policy.workspace)
  }.`;
}

// `Default main · Automatically land`: where an unattached session runs and
// what follows the checks of what it later verifies. It has no tracking.
export function unattachedSummary(policy: UnattachedSessionPolicy): string {
  return [
    sessionChoiceWords.workspace.values[policy.workspace],
    sessionChoiceWords.landing.values[policy.landing],
  ].join(" · ");
}

// What starting an unattached session does, for the dialog's line beside
// Start under its summary: where it runs, and whether what it later verifies
// lands.
export function unattachedEffect(policy: UnattachedSessionPolicy): string {
  return `The session runs ${startsIn(policy.workspace)}; ${
    policy.landing === "auto-land"
      ? "verified results land on origin without another review. Pressing Start authorizes that push."
      : "nothing is published."
  }`;
}

// Why an unattached session's other choices are not offered, while the
// selected host's installed skills cannot establish one.
export const unattachedNotOffered = `${sessionChoiceWords.workspace.values.isolated} and ${sessionChoiceWords.landing.values["auto-land"]} are not offered: the installed skills in this project do not establish a session without a story for this host.`;

// What a Session group says under the choices it does not offer: `unavailable`
// when the installed skills cannot take them, that the read still goes on, or
// nothing once they are offered.
export const notOfferedHint = (
  offer: SessionPolicyOffer,
  unavailable: string,
): string | undefined =>
  offer === "unavailable"
    ? unavailable
    : offer === "reading"
      ? "Reading session choices…"
      : undefined;

// Where an unattached session runs, for Command details, and the fields of
// the established session its first message carries when its launch
// establishes one: a new workspace starts at fetched trunk, so its starting
// revision is that trunk.
export function unattachedWhere(
  policy: UnattachedSessionPolicy,
  establishes: boolean,
): string {
  return `The session runs ${startsIn(policy.workspace)}.${
    establishes
      ? ` Its first message carries the established session: workspace, workspace role, branch, remote, target, landing, ${
          policy.workspace === "default-checkout"
            ? "starting revision, and fetched trunk"
            : "and the starting revision on fetched trunk"
        }.`
      : ""
  }`;
}
