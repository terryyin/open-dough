// The done catalog through the Git-aware backlog adapters: real scratch
// repositories and real merges through the real adapter CLI, each leaving a
// committed catalog that describes the committed record files.
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { backlogOf, direction } from "./product-backlog-fixture.mjs";
import {
  assertCatalogDoneAgrees,
  assertCommittedCatalogCurrent,
  catalog,
  completeAndCommit,
  completingBranch,
  done,
  doneRecord,
  entries,
  fileNames,
  items,
  plainMergeConflicts,
  show,
} from "./product-backlog-git-done-catalog-fixture.mjs";
import {
  checkout,
  checkoutOf,
  headSha,
  isMidMerge,
  parentCount,
  refSha,
  run,
} from "./product-backlog-git-fixture.mjs";

test("a merge whose incoming side added two records without a catalog commits a catalog listing every record", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B", "C"), direction },
      })
      .please(),
  );
  completingBranch(repo, "incoming", [
    doneRecord("A", "2026-10-05T10:00:00.000Z"),
    doneRecord("B", "2026-10-05T10:00:00.000Z"),
  ]);
  // The incoming side was published by a producer that kept no catalog.
  checkout(repo, "incoming");
  repo.git(["rm", "-q", catalog]);
  repo.git(["commit", "-q", "-m", "publish without a catalog"]);
  checkout(repo, "main");
  completeAndCommit(repo, doneRecord("C", "2026-10-06T10:00:00.000Z"));
  const ours = headSha(repo);

  const merged = await run(repo, ["merge", "--ref", "incoming"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(merged.stdout.trim(), "accepted");
  assert.equal(parentCount(repo), 2);
  assert.equal(refSha(repo, "HEAD^1"), ours);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json", "C_C.json"]);
  assert.equal(repo.git(["status", "--porcelain"]), "");
  await assertCatalogDoneAgrees(repo);
});

test("a merge where both sides completed work, so both changed the catalog, finishes without a stop", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B", "C"), direction },
      })
      .please(),
  );
  completeAndCommit(repo, doneRecord("A", "2026-10-04T10:00:00.000Z"));
  completingBranch(repo, "theirs", [
    doneRecord("B", "2026-10-05T10:00:00.000Z"),
  ]);
  completeAndCommit(repo, doneRecord("C", "2026-10-06T10:00:00.000Z"));
  assert.match(
    plainMergeConflicts(repo, "main", "theirs"),
    /\.catalog\.json/,
    "a plain Git merge of the two catalogs conflicts",
  );

  const merged = await run(repo, ["merge", "--ref", "theirs"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(isMidMerge(repo), false);
  assert.equal(parentCount(repo), 2);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json", "C_C.json"]);
  await assertCatalogDoneAgrees(repo);
});

test("a merge whose other side carries a malformed catalog finishes without a stop and commits a rebuilt one", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B", "C"), direction },
      })
      .please(),
  );
  completeAndCommit(repo, doneRecord("A", "2026-10-04T10:00:00.000Z"));
  completingBranch(repo, "theirs", [
    doneRecord("B", "2026-10-05T10:00:00.000Z"),
  ]);
  checkout(repo, "theirs");
  writeFileSync(join(repo.directory, catalog), "{ hand-edited\n");
  repo.git(["commit", "-q", "-am", "break the catalog"]);
  checkout(repo, "main");
  completeAndCommit(repo, doneRecord("C", "2026-10-06T10:00:00.000Z"));

  const merged = await run(repo, ["merge", "--ref", "theirs"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(isMidMerge(repo), false);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json", "C_C.json"]);
  await assertCatalogDoneAgrees(repo);
});

test("a conflicting record stops the merge before any catalog is committed, and continue commits a catalog matching the resolved record", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B"), direction },
      })
      .please(),
  );
  completingBranch(repo, "theirs", [
    doneRecord("A", "2026-10-05T10:00:00.000Z"),
  ]);
  completeAndCommit(repo, doneRecord("A", "2026-10-06T10:00:00.000Z"));
  const before = headSha(repo);

  const stopped = await run(repo, ["merge", "--ref", "theirs"]);

  assert.equal(stopped.code, 1);
  assert.match(stopped.stdout, /could not be committed/);
  assert.equal(headSha(repo), before, "nothing was committed");
  assert.equal(isMidMerge(repo), true);
  assert.match(repo.git(["ls-files", "-u"]), /\.planning\/done\/A_A\.json/);

  // The human decides their side's record stands.
  repo.git(["checkout", "--theirs", "--", `${done}/A_A.json`]);
  repo.git(["add", "--", `${done}/A_A.json`]);
  const continued = await run(repo, ["continue"]);

  assert.equal(continued.code, 0, continued.stdout + continued.stderr);
  assert.equal(isMidMerge(repo), false);
  assert.equal(parentCount(repo), 2);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(
    committed.records.map(({ fileName, completedAt }) => [
      fileName,
      completedAt,
    ]),
    [["A_A.json", "2026-10-05T10:00:00.000Z"]],
  );
  await assertCatalogDoneAgrees(repo);
});

test("a merge changing no done path leaves the catalog's bytes as they were, even a stale catalog", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B", "C"), direction },
      })
      .please(),
  );
  completeAndCommit(repo, doneRecord("A", "2026-10-06T10:00:00.000Z"));
  // A record the catalog does not describe, published by hand.
  writeFileSync(
    join(repo.directory, done, "OLD_old.json"),
    renderDoneRecord(
      makeMe.aDoneRecord
        .with({
          identity: "OLD#old",
          title: "Old",
          completedAt: "2026-10-01T00:00:00.000Z",
          developer: "Ann",
        })
        .please(),
    ),
  );
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", "hand-written record"]);
  const staleCatalog = show(repo, "HEAD", catalog);
  repo.git(["checkout", "-q", "-b", "theirs"]);
  repo.write(backlogOf([], items("B", "C", "D")));
  repo.git(["commit", "-q", "-am", "add D"]);
  checkout(repo, "main");
  repo.write(backlogOf([], items("E", "B", "C")));
  repo.git(["commit", "-q", "-am", "add E"]);

  const merged = await run(repo, ["merge", "--ref", "theirs"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(parentCount(repo), 2);
  assert.equal(show(repo, "HEAD", catalog), staleCatalog);
  assert.equal(repo.git(["status", "--porcelain"]), "");
});

test("a fast-forward merge adds no commit and rebuilds nothing", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B"), direction },
      })
      .please(),
  );
  completingBranch(repo, "ahead", [
    doneRecord("A", "2026-10-06T10:00:00.000Z"),
  ]);

  const merged = await run(repo, ["merge", "--ref", "ahead"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(merged.stdout.trim(), "fast-forwarded");
  assert.equal(headSha(repo), refSha(repo, "ahead"));
  assert.equal(repo.git(["status", "--porcelain"]), "");
});
