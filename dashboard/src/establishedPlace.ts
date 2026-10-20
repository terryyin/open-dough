// Where a launch established its session to work, and the saved directory
// its record retains independently of whether the session still exists.
import type { LaunchRecord } from "./launchRecord.ts";

// Where a launch's start established its session to work, a story's or an
// unattached session's, if its start did.
export const establishedPlace = (
  record: Pick<LaunchRecord, "start" | "preparation" | "establishedSession">,
) => record.start ?? record.preparation ?? record.establishedSession;

// Native Codex and Cursor continuations and Claude's established launch
// retain the saved directory. A Cursor record can lack an established place
// (a default ad-hoc launch establishes none), but its continuation always
// names the workspace its resume command uses, so that is Cursor's saved
// workspace.
export function recordedWorkspace(record: LaunchRecord): string | undefined {
  if (record.session.host === "codex")
    return record.session.continuation?.workspace;
  if (record.session.host === "cursor")
    return record.session.continuation.workspace;
  return establishedPlace(record)?.workspace;
}
