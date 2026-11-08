// Real completion and manually committed merges against local bare remotes.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  assertHeld,
  branch,
  main,
  manualMerge,
  publish,
} from "./publication-done-records-fixture.mjs";

for (const [file, list] of [
  [".planning/PRODUCT-BACKLOG.md", "Taken"],
  ["delivery/custom.md", "Backlog list"],
]) {
  for (const publisher of ["history", "execution", "resume"]) {
    test(`${publisher} refuses a completed identity restored in ${list} at ${file}`, async (t) => {
      const fixture = await manualMerge(t, file, list);
      const { execution, donePath, record } = fixture;
      const before = await captureCheckout(execution);
      const sourceBefore = readFileSync(join(execution, file), "utf8");
      const doneBefore = readFileSync(join(execution, donePath), "utf8");
      const publishedRevisions = [];

      const result = await publish(publisher, fixture, { publishedRevisions });

      const { error } = await assertHeld(
        result,
        "completed-identity",
        fixture,
        before,
        publishedRevisions,
      );
      assert.match(error, /A#A/);
      assert.ok(error.includes(donePath));
      assert.ok(error.includes(record.completedAt));
      assert.equal(readFileSync(join(execution, file), "utf8"), sourceBefore);
      assert.equal(readFileSync(join(execution, donePath), "utf8"), doneBefore);
    });
  }
}

for (const publisher of ["history", "execution", "resume"]) {
  test(`${publisher} still publishes unrelated active work beside completed records`, async (t) => {
    const fixture = await manualMerge(t, "delivery/custom.md", "Taken", {
      active: false,
    });
    const result = await publish(
      publisher,
      fixture,
      publisher === "history" ? { backlogPath: `./${fixture.file}` } : {},
    );
    assert.equal(result.acceptedSha ?? result.receipt?.sha, fixture.candidate);
    assert.equal(await lsRemoteSha(fixture.origin, main), fixture.candidate);
  });
}

test("ordinary publication accepts legacy backlog text beside only an empty done catalog", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { execution, origin, trunkSha } = fixture;
  const file = "delivery/custom.md";
  mkdirSync(join(execution, "delivery/done"), { recursive: true });
  writeFileSync(
    join(execution, file),
    "# Retained backlog\n\nReviewed draft.\n",
  );
  writeFileSync(
    join(execution, "delivery/done/.catalog.json"),
    '{"schemaVersion":1,"records":[],"unreadable":[]}\n',
  );
  await git(execution, "add", "delivery");
  await git(execution, "commit", "-m", "retain reviewed backlog draft");
  const candidate = await revParse(execution, "HEAD");
  const result = await publishExecutionIncrement({
    workspace: execution,
    branch,
    previouslyPublishedBase: trunkSha,
    targetRef: main,
    backlogPath: file,
  });
  assert.equal(result.receipt?.sha, candidate);
  assert.equal(await lsRemoteSha(origin, main), candidate);
});
