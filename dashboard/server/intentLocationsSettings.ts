// Declared Intent locations, their answered shape, and settings text for one
// pinned revision (`./intentLocationsRead.ts`, `./readOutcome.ts`): parse
// `.planning/open-dough.json`'s `intent.locations`, and distinguish absent,
// malformed, and unreadable settings. Listing each location's files stays
// with the locations read.

import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type {
  LocationSelection,
  SourceDeclaration,
} from "../src/intentLocationSelection.ts";
import { isNotFound, rateLimitStop } from "./ghFailure.ts";
import { isSafeRepositoryPath, type PinnedReader } from "./reachablePaths.ts";
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

// A declared location: its selection (`../src/intentLocationSelection.ts`)
// and optional display name; the repository path remains its identity.
export type DeclaredLocation = LocationSelection & {
  readonly label?: string;
};

export type DeclaredSettings =
  | { readonly kind: "absent" }
  | { readonly kind: "malformed" }
  | { readonly kind: "locations"; readonly locations: DeclaredLocation[] };

function includePatternsOf(value: unknown): readonly string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;
  const patterns: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || !isSafeRepositoryPath(entry)) {
      return undefined;
    }
    patterns.push(entry);
  }
  return patterns;
}

// A `sources` list, or undefined when it is not a non-empty list of entries
// each with a non-empty `include` list of patterns and, when present, a
// non-empty `syntax` hint.
function sourceDeclarationsOf(
  value: unknown,
): readonly SourceDeclaration[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const sources: SourceDeclaration[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      return undefined;
    }
    const { include, syntax } = entry as {
      include?: unknown;
      syntax?: unknown;
    };
    const patterns = includePatternsOf(include);
    if (patterns === undefined || patterns.length === 0) return undefined;
    if (syntax === undefined) {
      sources.push({ include: patterns });
      continue;
    }
    if (typeof syntax !== "string" || syntax.length === 0) return undefined;
    sources.push({ include: patterns, syntax });
  }
  return sources;
}

// The locations the settings declare, or absence / malformed JSON as distinct
// outcomes from an unreadable settings file (handled by the caller). A
// malformed `include` (not a list of non-empty safe relative strings) or
// `sources` list drops that entry; it does not invent "match everything".
// When `sources` is present it alone selects; `kind` and `include` are then
// not read.
export function declaredLocations(settings: string): DeclaredSettings {
  let parsed: unknown;
  try {
    parsed = JSON.parse(settings);
  } catch {
    return { kind: "malformed" };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { kind: "absent" };
  }
  const intent = (parsed as { intent?: unknown }).intent;
  if (intent === undefined) return { kind: "absent" };
  if (intent === null || typeof intent !== "object" || Array.isArray(intent)) {
    return { kind: "absent" };
  }
  const locations = (intent as { locations?: unknown }).locations;
  if (!Array.isArray(locations) || locations.length === 0) {
    return { kind: "absent" };
  }
  const declared: DeclaredLocation[] = [];
  for (const entry of locations) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }
    const { path, kind, include, label, sources } = entry as {
      path?: unknown;
      kind?: unknown;
      include?: unknown;
      label?: unknown;
      sources?: unknown;
    };
    if (typeof path !== "string" || !isSafeRepositoryPath(path)) continue;
    const named = {
      path,
      ...(typeof label === "string" && label.trim() !== ""
        ? { label: label.trim() }
        : {}),
    };
    if ("sources" in (entry as object)) {
      const declarations = sourceDeclarationsOf(sources);
      if (declarations !== undefined) {
        declared.push({ ...named, sources: declarations });
      }
      continue;
    }
    if (typeof kind !== "string" || kind.length === 0) continue;
    const fields = { ...named, kind };
    if (!("include" in (entry as object))) {
      declared.push(fields);
      continue;
    }
    const patterns = includePatternsOf(include);
    if (patterns === undefined) continue;
    declared.push({ ...fields, include: patterns });
  }
  return declared.length === 0
    ? { kind: "absent" }
    : { kind: "locations", locations: declared };
}

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
