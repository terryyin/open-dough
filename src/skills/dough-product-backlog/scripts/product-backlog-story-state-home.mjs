// Filesystem boundary for story-state preparation records: opens a canonical
// home, serializes cooperating writers per file, validates a planned path
// relative to that home, and applies the pure record/read operations.
// Backlog queue bytes are never rewritten here.

import { dirname, resolve } from "node:path";
import { splitHref } from "./product-backlog-identity.mjs";
import { BacklogError } from "./product-backlog-refusal.mjs";
import { applyToFile, readFile } from "./product-backlog-store.mjs";
import {
  readStoryState,
  recordStoryState,
} from "./product-backlog-story-state.mjs";

function homePath(backlogDirectory, href) {
  const { path: relative } = splitHref(href);
  return {
    relative,
    path: resolve(backlogDirectory, relative),
  };
}

function requirePlanBesideHome(canonicalPath, plan) {
  readFile(
    resolve(dirname(canonicalPath), plan),
    `Unresolved plan: ${plan} is not there, relative to the canonical file. ` +
      `Create the plan first, or supply the path the story should associate.`,
  );
}

// Reads preparation facts from the canonical home a link names.
export function readPreparation(backlogDirectory, href) {
  const { relative, path } = homePath(backlogDirectory, href);
  const source = readFile(path, `canonical home not found: ${relative}`);
  return readStoryState(source, href);
}

// Records preparation facts for one story under a cooperating per-file lock.
// Other stories in the same seed, identity lines, and the backlog file are
// left untouched. A planned approach must resolve beside the canonical file.
export async function recordPreparation(backlogDirectory, request) {
  const { relative, path } = homePath(backlogDirectory, request.href);
  let outcome;
  await applyToFile(
    path,
    (source) => {
      outcome = recordStoryState(source, request);
      if (request.approach === "planned") {
        requirePlanBesideHome(path, request.plan);
      }
      return outcome.source;
    },
    `canonical home not found: ${relative}`,
  );
  return outcome;
}

// Re-export the pure reader for callers that already hold source text.
export { readStoryState };

// Surface lock/refusal cases that are about the home, not the backlog queue.
export function preparationRefusal(error) {
  if (!(error instanceof BacklogError)) {
    return undefined;
  }
  return error.refusal.replace(
    /\nThe backlog was not changed\.$/,
    "\nNothing was written.",
  );
}
