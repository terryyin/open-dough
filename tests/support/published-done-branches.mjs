// Shared starting state for two publication operations. Both branches have
// catalogued records from their common base. An independent trunk writer
// publishes one more record without refreshing the catalog.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  advanceOriginFromAnotherWriter,
  createCleanTrunkFixture,
  git,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "./makeMe.mjs";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  backlogCommand,
  done,
  items,
} from "./product-backlog-git-done-catalog-fixture.mjs";

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

async function commitCataloguedRecord(checkout, facts, message) {
  mkdirSync(join(checkout, done), { recursive: true });
  writeFileSync(
    join(checkout, done, doneRecordFileName(facts.identity)),
    renderDoneRecord(facts),
  );
  await backlogCommand(checkout, ["catalog-done"]);
  await git(checkout, "add", "-A");
  await git(checkout, "commit", "-m", message);
}

export async function divergedDoneBranches(t) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  mkdirSync(join(integration, ".planning"), { recursive: true });
  writeFileSync(
    join(integration, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf([], items("Q")),
  );
  await commitCataloguedRecord(
    integration,
    record("X", "2026-10-01T00:00:00.000Z"),
    "backlog and catalogued record",
  );
  await git(integration, "push", "origin", "main");
  const publishedBase = await revParse(integration, "main");

  await git(execution, "rebase", publishedBase);
  await commitCataloguedRecord(
    execution,
    record("Y", "2026-10-03T00:00:00.000Z"),
    "story record",
  );
  const storyTip = await revParse(execution, "HEAD");

  const uncatalogued = record("Z", "2026-10-02T00:00:00.000Z");
  await advanceOriginFromAnotherWriter(origin, {
    file: join(done, doneRecordFileName(uncatalogued.identity)),
    body: renderDoneRecord(uncatalogued),
    message: "record without catalog",
  });
  return { origin, execution, publishedBase, storyTip };
}
