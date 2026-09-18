// Reconciles three versions of one backlog — the ancestor both branches
// started from, and each branch's version of it — into one complete, validated
// backlog, or into nothing at all.
//
// Everything a backlog holds is asked the same question, and it is asked next
// door: membership, each entry's title, link, list and plan, each list's
// order, the direction, and the human text around the lists. This decides
// which values there are to ask about, gathers every answer before publishing
// any of them, and reads the whole candidate back before it is written, so a
// reconciliation that cannot be made is handed to a human whole rather than
// applied in part.
//
// This reconciles supplied files. It is not Git-aware: which files hold the
// ancestor and the two branch versions is the caller's to establish.
import {
  mergeOrder,
  mergeValue,
  mergeWork,
  sameState,
} from "./product-backlog-combine.mjs";
import { directionHeading } from "./product-backlog-direction.mjs";
import { queueHeading, takenHeading } from "./product-backlog-document.mjs";
import { BacklogError, requireField } from "./product-backlog-refusal.mjs";
import {
  publishableCandidate,
  readVersion,
  stateOf,
} from "./product-backlog-version.mjs";
import { groupWork } from "./product-backlog-work.mjs";

const ancestorLabel = "the ancestor version";
const branchLabels = ["the first branch version", "the second branch version"];

function requestedVersions(request) {
  requireField(
    request.ancestor,
    "ancestor",
    ` It names the version both branches started from, which is what makes ` +
      `each branch's change readable as a change.`,
  );
  const branches = request.branches ?? [];
  if (branches.length !== 2) {
    throw new BacklogError(
      `Supply --branch <path> exactly twice, once for each branch's version ` +
        `of the backlog; found ${branches.length}.`,
    );
  }
  return [
    readVersion(request.ancestor, ancestorLabel),
    ...branches.map((path, at) => readVersion(path, branchLabels[at])),
  ];
}

function refuse(versions, conflicts) {
  throw new BacklogError(
    [
      `The two branch versions make different changes to the same meaning, ` +
        `so nothing was merged and no part of the result was written.`,
      ...versions.map((version) => `  ${version.label}: ${version.path}`),
      ...conflicts,
      `Decide what each of these should say, repair the versions by hand, ` +
        `and merge them again.`,
    ].join("\n"),
  );
}

// Reconciles the three versions and returns the backlog to publish alongside
// the transitions both branches turned out to have made.
export function mergeBacklogs(request) {
  const versions = requestedVersions(request);
  const [ancestor, one, other] = versions;
  const { groups, keyOf } = groupWork(versions);

  const conflicts = [];
  const merged = new Map();
  for (const group of groups) {
    const outcome = mergeWork(group, versions);
    if (outcome.conflict) {
      conflicts.push(outcome.conflict);
    } else {
      merged.set(group.key, outcome.state);
    }
  }

  const orderIn = (version, list) =>
    version.entries
      .filter((entry) => entry.list === list)
      .map((entry) => keyOf.get(entry));
  const listed = {};
  for (const list of [takenHeading, queueHeading]) {
    const order = mergeOrder(
      orderIn(ancestor, list),
      orderIn(one, list),
      orderIn(other, list),
    );
    if (!("value" in order)) {
      conflicts.push(
        `"## ${list}": the versions put the entries they share in different ` +
          `orders, and neither order is the one the ancestor had.`,
      );
      continue;
    }
    const members = [...merged]
      .filter(([, state]) => state !== null && state.list === list)
      .map(([key]) => key);
    const held = new Set(members);
    const established = order.value.filter((key) => held.has(key));
    const placed = new Set(established);
    // An entry neither branch's established order places — one newly listed,
    // or one that moved between the lists — goes after them, by identity so
    // that reversing the two branch arguments cannot change the result.
    const rest = members
      .filter((key) => !placed.has(key))
      .sort((key, also) =>
        merged.get(key).identity < merged.get(also).identity ? -1 : 1,
      );
    listed[list] = [...established, ...rest];
  }

  // The direction is one value, and so is everything a version holds outside
  // the two lists and the direction: human text no backlog operation writes,
  // carried across as the bytes it already was.
  const around = {};
  const said = {
    direction:
      `"## ${directionHeading}": the versions give it different text, and ` +
      `this tool never writes, summarises, or chooses strategy text.`,
    preamble:
      `The text above the two lists differs between the versions, and no ` +
      `backlog operation writes it.`,
    epilogue:
      `The text below the two lists differs between the versions, and no ` +
      `backlog operation writes it.`,
  };
  for (const value of Object.keys(said)) {
    const outcome = mergeValue(ancestor[value], one[value], other[value]);
    if ("value" in outcome) {
      around[value] = outcome.value;
    } else {
      conflicts.push(said[value]);
    }
  }

  if (conflicts.length > 0) {
    refuse(versions, conflicts);
  }

  const candidate = publishableCandidate(ancestor, {
    ...around,
    taken: listed[takenHeading].map((key) => merged.get(key)),
    queue: listed[queueHeading].map((key) => merged.get(key)),
  });

  return {
    source: candidate,
    changes: transitions(groups, ancestor, merged, around.direction),
    entries: [...merged.values()].filter((state) => state !== null).length,
  };
}

// What both branches turned out to have changed, read from the ancestor and
// the merged result rather than from either branch's request, so a caller sees
// the sibling removals and claims it is about to publish.
function transitions(groups, ancestor, merged, direction) {
  const changes = [];
  for (const group of groups) {
    const was = stateOf(group.states.get(ancestor.label));
    const now = merged.get(group.key);
    if (was === null && now !== null) {
      changes.push(`added "${now.identity}" to "## ${now.list}"`);
    } else if (was !== null && now === null) {
      changes.push(`removed "${was.identity}" from "## ${was.list}"`);
    } else if (was !== null && now !== null && !sameState(was, now)) {
      changes.push(`changed "${now.identity}", now in "## ${now.list}"`);
    }
  }
  if (direction !== ancestor.direction) {
    changes.push(`changed the "## ${directionHeading}"`);
  }
  return changes;
}
