// Live agent profiles through a merge by the backlog adapter: when one side
// completes the story whose profile was the last in `agents/`, Git must not
// read that as the whole directory moving into `done/` and carry the other
// side's live profile along, and a hand resolution that moved it there anyway
// is held by `continue`. Real scratch repositories, completions committed as
// `complete` publishes them, and the real adapter CLI, asserted on the
// committed or still-stopped merge.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "./makeMe.mjs";
import { direction } from "./product-backlog-fixture.mjs";
import {
  assertCatalogDoneAgrees,
  assertCommittedCatalogCurrent,
  completeAndCommit,
  done,
  doneRecord,
  entries,
  fileNames,
  profilePath,
  takeAndCommit,
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
import { integrationDeveloper } from "./repository-fixture.mjs";

const doneFiles = (repo, rev) =>
  repo
    .git(["ls-tree", "--name-only", `${rev}:${done}`])
    .trim()
    .split("\n")
    .sort();

// A story-branch execution profile reporting its host and model, which its
// done record carries too: that shared text is what makes Git pair a released
// profile with the done record replacing it as a rename.
const executing = (name, identity) =>
  makeMe.anAgentProfile
    .executing({
      name,
      identity,
      mode: "story-branch",
      branch: `story-${identity}`,
      host: "claude",
      model: "opus",
    })
    .please();

// The record `complete` writes for the story `profile` was executing, by the
// checkout's configured developer, releasing that profile.
const completedBy = (profile) =>
  doneRecord(profile.identity.split("#")[0], "2026-10-06T10:00:00.000Z", {
    developer: integrationDeveloper.name,
    agent: agentIdentity(profile.name).agent,
    host: profile.host,
    model: profile.model,
  });

// The adapter's answer, with the index state it left, for a failure message.
const outcome = (repo, result) =>
  `${result.stdout}${result.stderr}\n${repo.git(["status", "--short"])}`;

const exists = (repo, rev, path) =>
  repo.git(["ls-tree", "--name-only", rev, "--", path]).trim() !== "";

// The adapter accepted and committed the merge, keeping the `live` agent's
// profile at the blob `liveBlob`, releasing the `released` agent's, and
// publishing only `record` beside a current catalog.
async function assertAcceptedKeeping(
  repo,
  merged,
  { live, liveBlob, released, record },
) {
  assert.equal(merged.code, 0, outcome(repo, merged));
  assert.equal(merged.stdout.trim(), "accepted");
  assert.equal(isMidMerge(repo), false);
  assert.equal(repo.git(["ls-files", "-u"]), "", "no file-location conflict");
  assert.equal(parentCount(repo), 2);
  assert.equal(refSha(repo, `HEAD:${profilePath(live)}`), liveBlob);
  assert.equal(exists(repo, "HEAD", profilePath(released)), false);
  assert.deepEqual(doneFiles(repo, "HEAD"), [".catalog.json", record]);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), [record]);
  assert.equal(repo.git(["status", "--porcelain"]), "");
  await assertCatalogDoneAgrees(repo);
}

test("merging trunk that completed the story holding the last profile keeps the branch's own new profile in agents/", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B"), direction },
      })
      .please(),
  );
  // Base: agents/ holds only A's profile.
  const pyo = executing("pyo", "A#A");
  takeAndCommit(repo, pyo);
  // The story branch takes B, adding its profile beside A's.
  repo.git(["checkout", "-q", "-b", "story-b"]);
  takeAndCommit(repo, executing("joey", "B#B"));
  const blobB = refSha(repo, `HEAD:${profilePath("joey")}`);
  // Trunk completes A: its profile is replaced by A's done record.
  checkout(repo, "main");
  completeAndCommit(repo, completedBy(pyo), { released: pyo });
  checkout(repo, "story-b");

  const merged = await run(repo, ["merge", "--ref", "main"]);

  await assertAcceptedKeeping(repo, merged, {
    live: "joey",
    liveBlob: blobB,
    released: "pyo",
    record: "A_A.json",
  });
});

test("merging trunk that took another story into a branch completing the last profile's story releases only its own profile", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("B", "C"), direction },
      })
      .please(),
  );
  // Base: agents/ holds only B's profile.
  const joey = executing("joey", "B#B");
  takeAndCommit(repo, joey);
  // The story branch completes B: its profile is replaced by B's done record.
  repo.git(["checkout", "-q", "-b", "story-b"]);
  completeAndCommit(repo, completedBy(joey), { released: joey });
  // Trunk meanwhile takes C.
  checkout(repo, "main");
  takeAndCommit(repo, executing("Akiho", "C#C"));
  const blobC = refSha(repo, `HEAD:${profilePath("Akiho")}`);
  checkout(repo, "story-b");

  const merged = await run(repo, ["merge", "--ref", "main"]);

  await assertAcceptedKeeping(repo, merged, {
    live: "Akiho",
    liveBlob: blobC,
    released: "joey",
    record: "B_B.json",
  });
});

// Example 2: an integration stopped where Git, inferring `agents/ → done/`,
// moved the branch's live profile into `done/`, and a resolution staged it
// there, as both retained trunk commits did. `continue` holds it, naming the
// misplaced path and its home, with nothing committed; moving the profile
// back lets `continue` accept.
test("continue holds a staged result with a live profile under done/ until it is moved back to agents/", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { queued: entries("A", "B"), direction },
      })
      .please(),
  );
  const pyo = executing("pyo", "A#A");
  takeAndCommit(repo, pyo);
  repo.git(["checkout", "-q", "-b", "story-b"]);
  takeAndCommit(repo, executing("joey", "B#B"));
  const blobB = refSha(repo, `HEAD:${profilePath("joey")}`);
  checkout(repo, "main");
  completeAndCommit(repo, completedBy(pyo), { released: pyo });
  checkout(repo, "story-b");
  const misplaced = `${done}/joey-chan.json`;
  // A stopped integration in Git's default directory-rename mode leaves the
  // live profile moved into done/ and unresolved there.
  const stopped = spawnSync(
    "git",
    [
      "-c",
      "merge.directoryRenames=conflict",
      "merge",
      "--no-commit",
      "--no-ff",
      "main",
    ],
    { cwd: repo.directory, encoding: "utf8" },
  );
  assert.equal(stopped.status, 1, stopped.stdout + stopped.stderr);
  assert.match(repo.git(["ls-files", "-u", "--", misplaced]), /joey-chan/);
  // The resolution stages it there.
  repo.git(["add", "--", misplaced]);
  const head = headSha(repo);
  const staged = repo.git(["status", "--porcelain"]);

  const held = await run(repo, ["continue"]);

  assert.equal(held.code, 1, outcome(repo, held));
  const report = held.stdout + held.stderr;
  assert.match(report, /agent profile/);
  assert.ok(report.includes(misplaced), report);
  assert.ok(report.includes(profilePath("joey")), report);
  assert.equal(isMidMerge(repo), true, "the merge stays uncommitted");
  assert.equal(headSha(repo), head);
  assert.equal(repo.git(["status", "--porcelain"]), staged);

  // Git left no agents/ directory behind once its only profiles moved out.
  mkdirSync(dirname(join(repo.directory, profilePath("joey"))), {
    recursive: true,
  });
  repo.git(["mv", misplaced, profilePath("joey")]);
  const merged = await run(repo, ["continue"]);

  await assertAcceptedKeeping(repo, merged, {
    live: "joey",
    liveBlob: blobB,
    released: "pyo",
    record: "A_A.json",
  });
});
