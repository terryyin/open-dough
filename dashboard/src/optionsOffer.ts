// What a launch dialog says about a workflow's options, from the definitions
// the latest read of the machine's sessions answered
// (`./agentLaunches.ts`); the words for why none are offered are
// `./commandOptions.ts`'s.

import type { SessionReference } from "./sessionReference.ts";
import {
  launchWorkflows,
  type LaunchWorkflow,
  type OfferedDefinition,
} from "./agentLaunch.ts";
import { unavailableOptionsWhy, type OfferedShape } from "./commandOptions.ts";

// The options a launch dialog has to say: being read, offered, or why none.
export type OptionsOffer =
  | { readonly kind: "reading" }
  | { readonly kind: "unavailable"; readonly why: string }
  | ({ readonly kind: "offered" } & OfferedShape);

// What the project's installed skill offers for the workflow's launch, given
// the definitions read, or undefined while none were; undefined when the
// workflow defines no options. A project the read did not answer for has no
// options file.
export function optionsOfferOf(
  definitions: readonly OfferedDefinition[] | undefined,
  sourceId: string,
  workflow: LaunchWorkflow,
  host: SessionReference["host"],
): OptionsOffer | undefined {
  if (launchWorkflows[workflow].options === undefined) return undefined;
  if (definitions === undefined) return { kind: "reading" };
  const offered = definitions.find(
    (definition) =>
      definition.source === sourceId &&
      definition.workflow === workflow &&
      definition.host === host,
  );
  if (offered === undefined) {
    return { kind: "unavailable", why: unavailableOptionsWhy.missing };
  }
  return "unavailable" in offered
    ? { kind: "unavailable", why: offered.unavailable }
    : { kind: "offered", ...offered };
}

// What the dialog says where the options would be, when it cannot offer any:
// the boundary's words for why, so a refusal and the dialog agree.
export function optionsLine(
  offer: OptionsOffer | undefined,
  skill: string,
  named: string,
): string | undefined {
  const starts = `${named.charAt(0).toUpperCase()}${named.slice(1)} starts straightforwardly.`;
  switch (offer?.kind) {
    case undefined:
      return undefined;
    case "reading":
      return "Reading options…";
    case "unavailable":
      return `Options are not offered: the installed ${skill} skill in this project ${offer.why}. ${starts}`;
    case "offered":
      return offer.options.length === 0
        ? `The installed ${skill} skill in this project offers no options. ${starts}`
        : undefined;
  }
}

// What the dialog says under the options when a kept selection names flags
// the offer, once read, no longer has: those flags, in the kept order, are
// not sent.
export function notOfferedLine(
  offer: OptionsOffer | undefined,
  kept: ReadonlySet<string> | undefined,
): string | undefined {
  if (offer === undefined || offer.kind === "reading") return undefined;
  const offered = new Set(
    offer.kind === "offered" ? offer.options.map(({ flag }) => flag) : [],
  );
  const absent = [...(kept ?? [])].filter((flag) => !offered.has(flag));
  return absent.length === 0
    ? undefined
    : `Not offered any more, so not sent: ${absent.join(", ")}.`;
}
