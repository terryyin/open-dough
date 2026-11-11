// Pure declaration grammar shared by Intent and standalone test-entry rules.
// A generated runtime bundles this owner together with intentLocationSelection.
import type {
  LocationSelection,
  SourceDeclaration,
} from "./intentLocationSelection.ts";
import { isSafeRepositoryPath } from "./repositoryPath.ts";

// The declaration retains the display name and independent testing opt-ins.
// Only boolean values are retained; selection enables only exact true.
export type DeclaredLocation = LocationSelection & {
  readonly label?: string;
  readonly makeMe?: boolean;
  readonly pageObjects?: boolean;
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
    const { path, kind, include, label, sources, makeMe, pageObjects } =
      entry as {
        path?: unknown;
        kind?: unknown;
        include?: unknown;
        label?: unknown;
        sources?: unknown;
        makeMe?: unknown;
        pageObjects?: unknown;
      };
    if (typeof path !== "string" || !isSafeRepositoryPath(path)) continue;
    const named = {
      path,
      ...(typeof makeMe === "boolean" ? { makeMe } : {}),
      ...(typeof pageObjects === "boolean" ? { pageObjects } : {}),
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
