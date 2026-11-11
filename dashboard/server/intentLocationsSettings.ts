// Declared Intent settings share their pure parser with installed guidance;
// this adapter owns pinned reads, provider failures and recovery.
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { DeclaredLocation } from "../../src/skills/dough-makeme/scripts/intent-location-settings.mjs";
import { isNotFound, rateLimitStop } from "./ghFailure.ts";
import type { PinnedReader } from "./reachablePaths.ts";
import {
  readFailureRecovery,
  type ReportedFailure,
} from "./readFailureMessage.ts";

export { declaredLocations } from "../../src/skills/dough-makeme/scripts/intent-location-settings.mjs";
export type {
  DeclaredLocation,
  DeclaredSettings,
} from "../../src/skills/dough-makeme/scripts/intent-location-settings.mjs";
export type IntentSettingsProblem = "malformed" | "unreadable";
export type IntentLocationProblem = "unsupported-kind" | "no-matching-files";
export type IntentLocation = DeclaredLocation & {
  readonly files: readonly string[];
  readonly problem?: IntentLocationProblem;
};

// Settings text for Intent: absent (missing file), readable text, or
// unreadable (any failure other than not-found). Rate limits still fail the
// whole read. `agentSettingsTextAt` keeps conflating absence with unread for
// other readers that treat either as "no settings".
export async function intentSettingsTextAt(readPinned: PinnedReader): Promise<
  | { readonly kind: "absent" }
  | { readonly kind: "text"; readonly text: string }
  | {
      readonly kind: "unreadable";
      readonly recovery: ReportedFailure["recovery"];
    }
> {
  try {
    return { kind: "text", text: await readPinned(agentSettingsPath) };
  } catch (error) {
    if (rateLimitStop(error) !== undefined) throw error;
    if (isNotFound(error)) return { kind: "absent" };
    return { kind: "unreadable", recovery: readFailureRecovery(error) };
  }
}
