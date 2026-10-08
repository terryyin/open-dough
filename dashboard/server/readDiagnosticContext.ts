// Attribution carried from an admitted reader to a shared `gh` invocation
// (`./ghRead.ts`) so a failed call is recorded once under that reader's
// configured source and fixed category (`./readDiagnostics.ts`). Never
// caller-supplied command or path text.

import { AsyncLocalStorage } from "node:async_hooks";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";
import { safeText } from "./readDiagnosticSanitize.ts";
import type { RequestedRead } from "./requestedRead.ts";

// Fixed operation categories carried from the admitted reader.
export type DiagnosticCategory =
  | "ref"
  | "revision-check"
  | "backlog"
  | "content"
  | "commit-time"
  | "addition"
  | "branch-head"
  | "agents"
  | "done"
  | "containment"
  | "avatar";

export type ReadDiagnosticContext = {
  readonly source: string;
  readonly category: DiagnosticCategory;
  // Pinned revision or head when the admitted reader already knew one.
  readonly pin?: string;
};

const context = new AsyncLocalStorage<ReadDiagnosticContext>();

export function withReadDiagnosticContext<T>(
  carried: ReadDiagnosticContext,
  run: () => T,
): T {
  const sanitized = sanitizeContext(carried);
  return sanitized === undefined ? run() : context.run(sanitized, run);
}

export function currentReadDiagnosticContext():
  ReadDiagnosticContext | undefined {
  return context.getStore();
}

// Safe source/category/pin from an admitted read: configured id, fixed
// category, and a commit pin when the request already named one.
export function contextForAdmittedRead(
  sourceId: string,
  read: RequestedRead,
): ReadDiagnosticContext {
  const pin = pinOf(read);
  return {
    source: sourceId,
    category: categoryOf(read),
    ...(pin !== undefined && { pin }),
  };
}

export function contextForAvatarRead(
  sourceId: string,
  revision: string,
): ReadDiagnosticContext {
  return {
    source: sourceId,
    category: "avatar",
    ...(commitShaPattern.test(revision) && { pin: revision }),
  };
}

function categoryOf(read: RequestedRead): DiagnosticCategory {
  switch (read.kind) {
    case "ref":
      return "ref";
    case "revision-check":
      return "revision-check";
    case "backlog-at":
      return "backlog";
    case "file-at":
      return "content";
    case "commit-time-at":
      return "commit-time";
    case "addition-at":
      return "addition";
    case "branch-head-at":
      return "branch-head";
    case "agent-profiles-at":
      return "agents";
    case "done-catalog-at":
    case "done-bodies-at":
      return "done";
    case "containment-at":
      return "containment";
  }
}

function pinOf(read: RequestedRead): string | undefined {
  switch (read.kind) {
    case "ref":
      return undefined;
    case "revision-check":
      return read.since;
    case "file-at":
    case "commit-time-at":
      return read.onBranch?.head ?? read.revision;
    case "backlog-at":
    case "addition-at":
    case "branch-head-at":
    case "agent-profiles-at":
    case "done-catalog-at":
    case "done-bodies-at":
    case "containment-at":
      return read.revision;
  }
}

function sanitizeContext(
  carried: ReadDiagnosticContext,
): ReadDiagnosticContext | undefined {
  const source = safeText(carried.source);
  if (source === undefined) {
    return undefined;
  }
  const pin =
    carried.pin !== undefined && commitShaPattern.test(carried.pin)
      ? carried.pin
      : undefined;
  return {
    source,
    category: carried.category,
    ...(pin !== undefined && { pin }),
  };
}
