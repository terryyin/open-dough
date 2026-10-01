// What the installed skills offer a launch dialog, from the latest read of
// the machine's sessions (`./agentLaunches.ts`): whether a workflow's start is
// established before its session, whether that start takes a session policy,
// and the workflow's options (`./optionsOffer.ts`).

import type { SessionReference } from "./sessionReference.ts";
import type { LaunchWorkflow, MachineAnswer } from "./agentLaunch.ts";
import { optionsOfferOf, type OptionsOffer } from "./optionsOffer.ts";

// Whether a launch dialog can offer session choices: while the read answers,
// offered, or not taken by the installed skills.
export type SessionPolicyOffer = "reading" | "offered" | "unavailable";

export type LaunchOffers = {
  // Installed workflow start capability at the latest read.
  establishesStart(
    sourceId: string,
    workflow: LaunchWorkflow,
    host: SessionReference["host"],
  ): boolean;
  // Whether the installed skills take a session policy at the workflow's
  // start for the host, at the latest read; `reading` until one answered.
  sessionPolicyOffer(
    sourceId: string,
    workflow: LaunchWorkflow,
    host: SessionReference["host"],
  ): SessionPolicyOffer;
  // Installed options at the latest read; absent for workflows without options.
  optionsOffer(
    sourceId: string,
    workflow: LaunchWorkflow,
    host: SessionReference["host"],
  ): OptionsOffer | undefined;
};

// The offers a read answered; `answered` is false until a read answered and
// while offers are being read again.
export function launchOffers(
  read: Pick<
    MachineAnswer,
    | "establishing"
    | "establishingPreparation"
    | "establishingHosts"
    | "sessionPolicies"
    | "definitions"
  >,
  answered: boolean,
): LaunchOffers {
  const isFor =
    (sourceId: string, workflow: LaunchWorkflow, host: string) =>
    (entry: { source: string; workflow: string; host: string }) =>
      entry.source === sourceId &&
      entry.workflow === workflow &&
      entry.host === host;
  return {
    // Legacy machine-answer arrays describe Claude installations only.
    establishesStart: (sourceId, workflow, host) =>
      host !== "claude"
        ? read.establishingHosts.some(isFor(sourceId, workflow, host))
        : (workflow === "execution"
            ? read.establishing
            : read.establishingPreparation
          ).includes(sourceId),
    sessionPolicyOffer: (sourceId, workflow, host) =>
      !answered
        ? "reading"
        : read.sessionPolicies.some(isFor(sourceId, workflow, host))
          ? "offered"
          : "unavailable",
    optionsOffer: (sourceId, workflow, host) =>
      optionsOfferOf(
        answered ? read.definitions : undefined,
        sourceId,
        workflow,
        host,
      ),
  };
}
