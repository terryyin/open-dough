// A standalone session close backed by an actual pair of commits in the
// fixture's origin. Dashboard reads the record and comparison through Git.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { defaultBacklogPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { trunkAdvancedWith } from "../originatingMachine.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

export function publishReviewSession(
  origin: StartOrigin,
  range: { base: string; candidate: string },
) {
  const record = makeMe.aSessionRecord.closing(range).please();
  trunkAdvancedWith(
    origin,
    sessionRecordPathBeside(defaultBacklogPath, record.sessionId),
    `${JSON.stringify(record)}\n`,
  );
  return record.sessionId;
}

export function publishWorktreeReviewSession(
  origin: StartOrigin,
  workspace: string,
  base: string,
) {
  const candidate = git(workspace, "rev-parse", "HEAD");
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  return publishReviewSession(origin, { base, candidate });
}
