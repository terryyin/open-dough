// Host-hook merge policy for Open Dough CI registration.
// Identifies managed entries by native event and the known fragment command,
// including locally argument-extended variants that require conflict review.
// Preserves unrelated handlers and matcher siblings; refuses named conflicts.

import {
  jsonValuesEqual,
  isPlainObject,
  conflict,
  cloneEntries,
  mergeCursorEvent,
  mergeClaudeEvent,
} from "./open-dough-register-hook-events.mjs";

function mergeHooksMap(existingHooks, fragmentHooks, hostId, relativePath) {
  if (existingHooks !== undefined) {
    if (!isPlainObject(existingHooks)) {
      return conflict(
        "unsupported-existing-hooks",
        `unsupported-existing-hooks: ${relativePath} hooks value is not a JSON object.`,
      );
    }
  }
  const result =
    existingHooks === undefined
      ? {}
      : Object.fromEntries(
          Object.entries(existingHooks).map(([event, value]) => [
            event,
            Array.isArray(value) ? cloneEntries(value) : structuredClone(value),
          ]),
        );

  for (const [event, fragmentEntries] of Object.entries(fragmentHooks)) {
    if (!Array.isArray(fragmentEntries) || fragmentEntries.length === 0) {
      throw new Error(
        `Authoritative fragment for ${relativePath} must declare entries for ${event}.`,
      );
    }
    for (const managedEntry of fragmentEntries) {
      const merged =
        hostId === "cursor"
          ? mergeCursorEvent(result[event], managedEntry, relativePath)
          : mergeClaudeEvent(result[event], managedEntry, relativePath);
      if (merged.error) {
        return merged;
      }
      result[event] = merged.entries;
    }
  }
  return { hooks: result };
}

export function mergeDocument(existingDoc, fragment, hostId, relativePath) {
  if (
    existingDoc !== null &&
    existingDoc !== undefined &&
    !isPlainObject(existingDoc)
  ) {
    return conflict(
      "unsupported-existing-hooks",
      `unsupported-existing-hooks: ${relativePath} is not a JSON object.`,
    );
  }
  const base = isPlainObject(existingDoc) ? structuredClone(existingDoc) : {};
  const mergedHooks = mergeHooksMap(
    base.hooks,
    fragment.hooks,
    hostId,
    relativePath,
  );
  if (mergedHooks.error) {
    return mergedHooks;
  }
  base.hooks = mergedHooks.hooks;
  if (
    hostId === "cursor" &&
    fragment.version !== undefined &&
    base.version === undefined
  ) {
    base.version = fragment.version;
  }
  return { nextDoc: base, changed: !jsonValuesEqual(existingDoc, base) };
}
