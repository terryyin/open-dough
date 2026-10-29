// Machine-local evidence that a held Cursor conversation still owns fresh
// non-terminal CI: the observer mailbox under the injectable storage root.
// Match is the owner claim alone (repository, host `cursor`, this session,
// empty child). Worker liveness is never evidence. Missing or unreadable
// trees supply no Working claim (ADR 0008).
import { listMailboxDirectories } from "../../../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs";
import { mailboxRoot } from "../../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import {
  freshPendingRevision,
  readRevisionCoverage,
} from "../../../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-records.mjs";
import {
  observerOwner,
  readOwnerClaim,
} from "../../../../src/skills/dough-execute-plan/scripts/ci-observer-owner.mjs";

export { mailboxRoot };

// True when any mailbox this conversation claims still has a fresh pending
// revision observation. False when none exist, every owned revision is
// terminal or stale, the claim does not match, or storage cannot be read.
export function hasOwnedFreshPendingCi(
  mailboxStorage: string,
  workspace: string,
  sessionId: string,
  now = Date.now(),
): boolean {
  const owner = observerOwner({
    root: workspace,
    host: "cursor",
    session: sessionId,
    child: "",
  });
  let directories: string[];
  try {
    directories = listMailboxDirectories(mailboxStorage);
  } catch {
    return false;
  }
  for (const directory of directories) {
    let claim: string | undefined;
    try {
      claim = readOwnerClaim(directory);
    } catch {
      continue;
    }
    if (claim !== owner) continue;
    let coverage: ReturnType<typeof readRevisionCoverage>;
    try {
      coverage = readRevisionCoverage(directory);
    } catch {
      continue;
    }
    for (const revision of coverage) {
      if (freshPendingRevision(revision, now)) return true;
    }
  }
  return false;
}
