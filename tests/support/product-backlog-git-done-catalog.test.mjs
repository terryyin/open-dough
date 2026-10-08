// The done catalog through the Git-aware backlog adapters: real scratch
// repositories, real merges through the real adapter CLI, and real
// history-preserving publication, each leaving a committed catalog that
// describes the committed record files.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../src/skills/dough-execute-plan/scripts/history-preserving-publication.mjs";
import {
  createCleanTrunkFixture,
  git as gitAsync,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { recordText } from "./product-backlog-done-fixture.mjs";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  assertCatalogDescribes,
  assertCatalogDoneAgrees,
  assertCommittedCatalogCurrent,
  backlogCommand,
  catalog,
  completeAndCommit,
  completingBranch,
  done,
  fileNames,
  items,
  plainMergeConflicts,
  show,
} from "./product-backlog-git-done-catalog-fixture.mjs";
import {
  checkout,
  headSha,
  isMidMerge,
  parentCount,
  refSha,
  run,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

test("a merge whose incoming side added two records without a catalog commits a catalog listing every record", async (t) => {
  const repo = scratchRepo(t, backlogOf([], items("A", "B", "C")));
  await completingBranch(
    repo,
    "incoming",
    ["A", "B"],
    "2026-10-05T10:00:00.000Z",
  );
  // The incoming side was published by a producer that kept no catalog.
  checkout(repo, "incoming");
  repo.git(["rm", "-q", catalog]);
  repo.git(["commit", "-q", "-m", "publish without a catalog"]);
  checkout(repo, "main");
  await completeAndCommit(repo, "C");
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
  const repo = scratchRepo(t, backlogOf([], items("A", "B", "C")));
  await completeAndCommit(repo, "A", "2026-10-04T10:00:00.000Z");
  await completingBranch(repo, "theirs", ["B"], "2026-10-05T10:00:00.000Z");
  await completeAndCommit(repo, "C", "2026-10-06T10:00:00.000Z");
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
  const repo = scratchRepo(t, backlogOf([], items("A", "B", "C")));
  await completeAndCommit(repo, "A", "2026-10-04T10:00:00.000Z");
  await completingBranch(repo, "theirs", ["B"], "2026-10-05T10:00:00.000Z");
  checkout(repo, "theirs");
  writeFileSync(join(repo.directory, catalog), "{ hand-edited\n");
  repo.git(["commit", "-q", "-am", "break the catalog"]);
  checkout(repo, "main");
  await completeAndCommit(repo, "C", "2026-10-06T10:00:00.000Z");

  const merged = await run(repo, ["merge", "--ref", "theirs"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(isMidMerge(repo), false);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), ["A_A.json", "B_B.json", "C_C.json"]);
  await assertCatalogDoneAgrees(repo);
});

test("a conflicting record stops the merge before any catalog is committed, and continue commits a catalog matching the resolved record", async (t) => {
  const repo = scratchRepo(t, backlogOf([], items("A", "B")));
  await completingBranch(repo, "theirs", ["A"], "2026-10-05T10:00:00.000Z");
  await completeAndCommit(repo, "A", "2026-10-06T10:00:00.000Z");
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
  const repo = scratchRepo(t, backlogOf([], items("A", "B", "C")));
  await completeAndCommit(repo, "A");
  // A record the catalog does not describe, published by hand.
  writeFileSync(
    join(repo.directory, done, "OLD_old.json"),
    recordText("OLD#old", "Old", "2026-10-01T00:00:00.000Z"),
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
  const repo = scratchRepo(t, backlogOf([], items("A", "B")));
  await completingBranch(repo, "ahead", ["A"]);

  const merged = await run(repo, ["merge", "--ref", "ahead"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(merged.stdout.trim(), "fast-forwarded");
  assert.equal(headSha(repo), refSha(repo, "ahead"));
  assert.equal(repo.git(["status", "--porcelain"]), "");
});

test("history-preserving publication merges a story tip changing only done records through the backlog adapter, publishing a current catalog", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const git =
    (directory) =>
    async (...args) =>
      (await gitAsync(directory, ...args)).stdout;
  const writeRecord = (directory, name, time) => {
    mkdirSync(join(directory, done), { recursive: true });
    writeFileSync(
      join(directory, done, `${name}_${name}.json`),
      recordText(`${name}#${name}`, `Item ${name}`, time),
    );
  };

  mkdirSync(join(integration, ".planning"), { recursive: true });
  writeFileSync(
    join(integration, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf([], items("Q")),
  );
  writeRecord(integration, "X", "2026-10-01T00:00:00.000Z");
  await backlogCommand(integration, ["catalog-done"]);
  await git(integration)("add", "-A");
  await git(integration)("commit", "-m", "backlog and catalogued record");
  await git(integration)("push", "origin", "main");

  await git(execution)("rebase", "origin/main");
  writeRecord(execution, "Y", "2026-10-03T00:00:00.000Z");
  await backlogCommand(execution, ["catalog-done"]);
  await git(execution)("add", "-A");
  await git(execution)("commit", "-m", "story record");
  const storyTip = await revParse(execution, "HEAD");

  // Another writer publishes a record without rebuilding the catalog.
  const writer = join(fixture.fixture, "writer");
  await gitAsync(fixture.fixture, "clone", "-q", origin, writer);
  await git(writer)("config", "user.name", "Another Writer");
  await git(writer)("config", "user.email", "another@example.test");
  writeRecord(writer, "Z", "2026-10-02T00:00:00.000Z");
  await git(writer)("add", "-A");
  await git(writer)("commit", "-m", "record without catalog");
  await git(writer)("push", "origin", "main");

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: storyTip,
    branch: "exec/story",
  });

  assert.equal(published.classification, "published");
  assert.deepEqual(published.adapterStatuses, ["accepted"]);
  const { sha } = published.receipt;
  const publishedCatalog = assertCatalogDescribes(
    await git(origin)("show", `${sha}:${catalog}`),
    await git(origin)("ls-tree", `${sha}:${done}`),
  );
  assert.deepEqual(fileNames(publishedCatalog), [
    "X_X.json",
    "Y_Y.json",
    "Z_Z.json",
  ]);
});
