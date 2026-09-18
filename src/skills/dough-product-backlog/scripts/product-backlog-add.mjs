// Adds exactly one already identified entry to "## Backlog list" at an
// explicit relative position. Identities are never allocated here, and nothing
// else in the document changes.

import {
  ambiguousHome,
  BacklogError,
  parseBacklog,
  queueHeading,
  renderBacklog,
  renderEntry,
} from "./product-backlog-document.mjs";
import {
  appendIndex,
  entriesIn,
  insertEntryLine,
} from "./product-backlog-placement.mjs";

function queueInsertIndex(document, placement) {
  const queued = entriesIn(document, queueHeading);

  if (placement.position === "first") {
    return queued.length > 0
      ? queued[0].index
      : appendIndex(document, document.queue);
  }
  if (placement.position === "last") {
    return appendIndex(document, document.queue);
  }

  const wanted = placement.after ?? placement.before;
  const anchor = queued.find((entry) => entry.identity === wanted);
  if (!anchor) {
    const elsewhere = document.entries.find(
      (entry) => entry.identity === wanted,
    );
    throw new BacklogError(
      elsewhere
        ? `Anchor identity "${wanted}" is in "## ${elsewhere.list}"; this ` +
            `operation only places entries in "## ${queueHeading}".`
        : `Anchor identity "${wanted}" is not in "## ${queueHeading}".`,
    );
  }
  return placement.after ? anchor.index + 1 : anchor.index;
}

function requireUnlistedWork(document, request) {
  const existing = document.entries.find(
    (entry) => entry.identity === request.identity,
  );
  if (existing) {
    throw new BacklogError(
      `Identity "${request.identity}" is already listed in ` +
        `"## ${existing.list}" at line ${existing.index + 1}. This ` +
        `operation never re-identifies or moves existing work.`,
    );
  }
  const sameHome = document.entries.find(
    (entry) => entry.href === request.href,
  );
  if (sameHome) {
    throw ambiguousHome(
      `the canonical home "${request.href}" is already listed in ` +
        `"## ${sameHome.list}" at line ${sameHome.index + 1} as identity ` +
        `"${sameHome.identity}".`,
    );
  }
}

export function addQueueEntry(source, request) {
  const document = parseBacklog(source);
  const line = renderEntry(request);
  requireUnlistedWork(document, request);

  insertEntryLine(document, queueInsertIndex(document, request), line);
  return renderBacklog(document);
}
