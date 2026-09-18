// Adds exactly one already identified entry to "## Backlog list" at an
// explicit relative position. Identities are never allocated here, and nothing
// else in the document changes.

import {
  ambiguousHome,
  BacklogError,
  parseBacklog,
  renderBacklog,
  renderEntry,
} from "./product-backlog-document.mjs";
import {
  insertEntryLine,
  queueIndexFor,
} from "./product-backlog-placement.mjs";

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

  insertEntryLine(document, queueIndexFor(document, request), line);
  return renderBacklog(document);
}
