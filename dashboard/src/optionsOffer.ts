// What a launch dialog says about a workflow's options, from the definitions
// the latest read of the machine's sessions answered
// (`./agentLaunches.ts`); the words for why none are offered are
// `./commandOptions.ts`'s.

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
): OptionsOffer | undefined {
  if (launchWorkflows[workflow].options === undefined) return undefined;
  if (definitions === undefined) return { kind: "reading" };
  const offered = definitions.find(
    (definition) =>
      definition.source === sourceId && definition.workflow === workflow,
  );
  if (offered === undefined) {
    return { kind: "unavailable", why: unavailableOptionsWhy.missing };
  }
  return "unavailable" in offered
    ? { kind: "unavailable", why: offered.unavailable }
    : { kind: "offered", ...offered };
}
