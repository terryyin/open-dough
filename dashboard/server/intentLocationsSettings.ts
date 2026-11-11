// Declared Intent locations, their answered shape, and settings text for one
// pinned revision (`./intentLocationsRead.ts`, `./readOutcome.ts`): parse
// `.planning/open-dough.json`'s `intent.locations`, and distinguish absent,
// malformed, and unreadable settings. Listing each location's files stays
// with the locations read.

import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { DeclaredLocation } from "../src/intentLocationsDeclaration.ts";
export {
  declaredLocations,
  type DeclaredLocation,
  type DeclaredSettings,
} from "../src/intentLocationsDeclaration.ts";
import { isNotFound, rateLimitStop } from "./ghFailure.ts";
import type { PinnedReader } from "./reachablePaths.ts";
import {
  readFailureRecovery,
  type ReportedFailure,
} from "./readFailureMessage.ts";

// Why Intent cannot use the settings file: it is not readable JSON, or the
// file itself could not be read. Absence stays a separate not-configured
// answer (`locations: null` with no settings problem).
export type IntentSettingsProblem = "malformed" | "unreadable";

// Why one configured location cannot list files: its kind is not yet
// supported, or the path holds none of the files it selects.
export type IntentLocationProblem = "unsupported-kind" | "no-matching-files";

// A configured location's answer: its declaration (a `kind` with optional
// `include` patterns echoed from settings, or its declared `sources` entries,
// with no kind) and the repository paths of files it selects at the
// revision, empty when `problem` is set.
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
