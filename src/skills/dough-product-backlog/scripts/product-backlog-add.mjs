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

function queueInsertIndex(document, placement) {
  const queued = document.entries.filter(
    (entry) => entry.list === queueHeading,
  );

  if (placement.position === "first" || placement.position === "last") {
    if (queued.length > 0) {
      const target =
        placement.position === "first" ? queued[0] : queued[queued.length - 1];
      return placement.position === "first" ? target.index : target.index + 1;
    }
    let index = document.queue.start;
    if (document.lines[index] === "") {
      index += 1;
    }
    return index;
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

  const index = queueInsertIndex(document, request);
  document.lines.splice(index, 0, line);
  const following = document.lines[index + 1];
  if (
    following !== undefined &&
    following !== "" &&
    !following.startsWith("- ")
  ) {
    document.lines.splice(index + 1, 0, "");
  }
  return renderBacklog(document);
}
