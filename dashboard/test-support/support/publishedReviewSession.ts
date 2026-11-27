// A story-linked session close backed by an actual pair of commits in the
// fixture's origin. Dashboard reads the record and comparison through Git.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { defaultBacklogPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import path from "node:path";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { rebuildDoneCatalog } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs";
import { advanceOriginTrunk } from "../originatingMachine.ts";
import type { StartOrigin } from "./startOrigin.ts";

export const publishedReviewStory = {
  identity: "SEED-898#published-review",
  title: "Published review examples",
};

export function publishReviewSession(
  origin: StartOrigin,
  range: { base: string; candidate: string },
) {
  const story = makeMe.aDoneRecord
    .completed({
      ...publishedReviewStory,
      completedAt: new Date().toISOString(),
    })
    .please();
  const record = makeMe.aSessionRecord
    .forStory(story.identity)
    .closing(range)
    .please();
  advanceOriginTrunk(origin, (workspace) => {
    const backlog = path.dirname(defaultBacklogPath);
    makeMe
      .theWorkspace(workspace)
      .writeAt(
        path.join(backlog, doneRecordPath(story.identity)),
        renderDoneRecord(story),
      )
      .please();
    rebuildDoneCatalog(path.join(workspace, backlog));
    makeMe
      .theWorkspace(workspace)
      .writeAt(
        sessionRecordPathBeside(defaultBacklogPath, record.sessionId),
        `${JSON.stringify(record)}\n`,
      )
      .please();
  });
  return record.sessionId;
}
