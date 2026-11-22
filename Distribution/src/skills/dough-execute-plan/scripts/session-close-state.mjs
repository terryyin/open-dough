// A Land close's local recovery state, one file per session at the Git path
// `open-dough/session-close/<sessionId>.json`, so several sessions sharing one
// checkout each keep their own. It holds the exact `candidate` and
// `suffixBase` saved before each work push and, once sealed, the `record`
// saved before it is published. The state stays local; only the record is
// published, and the state retires once the record is.
import {
  readGitPathJson,
  removeGitPathJson,
  replaceGitPathJson,
} from "./git-path-json-store.mjs";

function closeStatePath(sessionId) {
  return `open-dough/session-close/${sessionId}.json`;
}

// The session's saved close state, or undefined when none was saved here.
export function readCloseState(workspace, sessionId) {
  return readGitPathJson(workspace, closeStatePath(sessionId));
}

// Merges `facts` into the session's saved close state, replacing the file
// whole so an interruption leaves the previous state intact.
export function saveCloseState(workspace, sessionId, facts) {
  replaceGitPathJson(workspace, closeStatePath(sessionId), {
    ...readCloseState(workspace, sessionId),
    ...facts,
  });
}

// Removes the session's saved close state once its record is published; any
// other record status keeps it for the next resume.
export function retireCloseState(workspace, sessionId, status) {
  if (status === "published")
    removeGitPathJson(workspace, closeStatePath(sessionId));
}
