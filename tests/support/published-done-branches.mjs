// Shared starting state for two publication operations. Both branches have
// catalogued records from their common base. An independent trunk writer
// publishes one more record without refreshing the catalog.
import { join } from "node:path";
import { advanceOriginFromAnotherWriter } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "./makeMe.mjs";
import { done } from "./product-backlog-git-done-catalog-fixture.mjs";
import { materializeRepository } from "./repository-fixture.mjs";

function record(name, completedAt) {
  return makeMe.aDoneRecord
    .with({
      identity: `${name}#${name}`,
      title: `Item ${name}`,
      completedAt,
      developer: "Ann",
    })
    .please();
}

// The published base holds a backlog queuing Q and the catalogued record X;
// the story's unpublished commit adds the catalogued record Y.
const cataloguedOnBothSides = makeMe.aRepository
  .withRevision("published base", {
    backlog: {
      queued: [
        makeMe.aBacklogEntry
          .with({ identity: "Q#Q", title: "Item Q", href: "seeds/Q.md#Q" })
          .please(),
      ],
    },
    doneRecords: [record("X", "2026-10-01T00:00:00.000Z")],
    message: "backlog and catalogued record",
  })
  .withWorkspace("exec/story", { from: "published base" })
  .withUnpublishedRevision("story record", {
    doneRecords: [record("Y", "2026-10-03T00:00:00.000Z")],
  })
  .please();

export async function divergedDoneBranches(t) {
  const fixture = await materializeRepository(cataloguedOnBothSides);
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;

  const uncatalogued = record("Z", "2026-10-02T00:00:00.000Z");
  await advanceOriginFromAnotherWriter(origin, {
    file: join(done, doneRecordFileName(uncatalogued.identity)),
    body: renderDoneRecord(uncatalogued),
    message: "record without catalog",
  });
  return {
    origin,
    execution,
    publishedBase: fixture.trunkSha,
    storyTip: fixture.candidateSha,
  };
}
