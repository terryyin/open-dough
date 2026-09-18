// Adds exactly one already identified entry to "## Backlog list" at an
// explicit relative position. Identities are never allocated here, and nothing
// else in the document changes.

import {
  parseBacklog,
  renderBacklog,
  renderEntry,
  requireUnlistedHome,
} from "./product-backlog-document.mjs";
import {
  insertEntryLine,
  queueIndexFor,
} from "./product-backlog-placement.mjs";
import { BacklogError } from "./product-backlog-refusal.mjs";

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
  requireUnlistedHome(document, request.href);
}

export function addQueueEntry(source, request) {
  const document = parseBacklog(source);
  const line = renderEntry(request);
  requireUnlistedWork(document, request);

  insertEntryLine(document, queueIndexFor(document, request), line);
  return renderBacklog(document);
}
