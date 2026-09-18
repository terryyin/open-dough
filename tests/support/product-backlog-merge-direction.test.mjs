// The direction is one value, and the same one rule decides it. These
// establish that the rule reaches it, that the report tells a caller when it
// moved, and that two different directions are handed back rather than run
// together — including where line-by-line text merging would run them
// together silently.
//
// One test below runs `git merge-file` itself, to observe what line-by-line
// text merging makes of the same three files; that is the test watching Git,
// not the tool asking it anything.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  architecture,
  backlog,
  backlogOf,
  direction,
  occurrences,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { versionPath, versions } from "./product-backlog-merge-fixture.mjs";

const [trunk, retrospective, review] = queued;

// The direction a branch chooses when one of them updates it, as the wrapped
// paragraph a project actually writes.
const chosen =
  "Make every ordinary backlog change a scripted, validated operation,\n" +
  "so no agent has to hand-edit the shared list to reprioritize work.";

// A longer direction a project might equally have written, spelled out the
// same way. It is one value like the short one; what it adds is two unchanged
// lines between its first and its last, which the contrast with line-by-line
// text merging below needs.
const spreadDirection =
  "Enable agents to execute stories in parallel while collaborating through\n" +
  "trunk-based development, with each agent working in its own Git worktree.\n" +
  "Keep one readable Markdown list as the authority for what is queued and\n" +
  "taken, so a human can read the backlog without running anything.";

// The established backlog saying something else about its direction, with both
// lists exactly as the ancestor has them, so that where two versions built
// this way differ at all, they differ in the direction and nothing else.
const saying = (text) => backlogOf([takenEntry], queued, text);

// What ordinary line-by-line text merging makes of the three versions already
// written, for the one test that draws a contrast with it. This observes
// rather than acts: `-p` writes the result to standard output and changes no
// file. The exit status is the number of conflicts it could not resolve.
const exec = promisify(execFile);

async function textMerge(project) {
  const named = ["one", "ancestor", "other"].map(versionPath);
  try {
    const { stdout } = await exec("git", ["merge-file", "-p", ...named], {
      cwd: project.directory,
    });
    return { conflicts: 0, merged: stdout };
  } catch (error) {
    return { conflicts: error.code, merged: error.stdout };
  }
}

test("merge direction carries a one-sided update across other item edits", async (t) => {
  const project = scratchProject(t);
  // One branch chose a new direction and closed the architecture story.
  const chose = backlogOf([takenEntry], [trunk, retrospective], chosen);
  // The other took the trunk-integration story and left the direction alone.
  const took = backlogOf([takenEntry, trunk], [retrospective, review]);

  const merged = await run(project, versions(project, backlog, chose, took));

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry, trunk], [retrospective], chosen),
  );
  assert.equal(occurrences(project.read(), direction), 0);
  // The report is what a caller checks the published result against before
  // accepting it, so a strategy one branch rewrote has to appear in it.
  assert.match(merged.stdout, /changed the "## Near-future direction"/);

  // Which branch left the direction alone is not what carried the other
  // branch's text across — the ancestor is — so naming the two the other way
  // round gives the same file and says the same thing about it.
  const backwards = await run(project, versions(project, backlog, took, chose));

  assert.equal(backwards.code, 0, backwards.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry, trunk], [retrospective], chosen),
  );
  assert.equal(backwards.stdout, merged.stdout);
});

test("merge direction is left out of the report when neither branch moved it", async (t) => {
  // The same two item edits with the direction left as the ancestor wrote it.
  // A report that named the direction whatever happened would tell a caller
  // nothing, so what makes the line above mean something is its absence here.
  const project = scratchProject(t);

  const merged = await run(
    project,
    versions(
      project,
      backlog,
      backlogOf([takenEntry], [trunk, retrospective]),
      backlogOf([takenEntry, trunk], [retrospective, review]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.match(merged.stdout, new RegExp(`removed "${architecture}"`));
  assert.doesNotMatch(merged.stdout, /Near-future direction/);
});

test("merge direction applies an identical replacement on both branches once", async (t) => {
  const project = scratchProject(t);
  const both = saying(chosen);

  const merged = await run(project, versions(project, backlog, both, both));

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), both);
  assert.equal(occurrences(project.read(), chosen), 1);
  assert.equal(occurrences(project.read(), direction), 0);
  assert.match(merged.stdout, /changed the "## Near-future direction"/);
});

test("merge direction applies an identical clearing on both branches once", async (t) => {
  // Both branches decided the backlog should carry no direction at all. That
  // is one change made the same way, not two changes to reconcile, so the
  // section goes and its heading goes with it.
  const project = scratchProject(t);
  const cleared = saying("");

  const merged = await run(
    project,
    versions(project, backlog, cleared, cleared),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), cleared);
  assert.equal(occurrences(project.read(), "## Near-future direction"), 0);
  assert.match(merged.stdout, /changed the "## Near-future direction"/);
});

test("merge direction refuses a replacement on one branch against a deletion on the other", async (t) => {
  // One branch rewrote the direction and the other removed it. Clearing a
  // direction is a change like any other, so this is two different changes to
  // one value, and no lifecycle order says a deletion beats a rewrite.
  const project = scratchProject(t);

  const refused = await run(
    project,
    versions(project, backlog, saying(chosen), saying("")),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    /"## Near-future direction": the versions give it different text/,
  );
  assert.match(
    refused.stderr,
    /never writes, summarises, or chooses strategy text/,
  );
  assert.match(refused.stderr, /The backlog was not changed\./);
});

test("merge direction refuses edits an ordinary text merge would run together", async (t) => {
  // The two edits are at opposite ends of the paragraph, with two unchanged
  // lines between them, and that distance is the whole point: two edits to
  // adjacent lines conflict in a line-by-line text merge all by themselves, so
  // a version of this test written that way would prove nothing about this
  // tool. Do not move these edits closer together — the assertion that the
  // text merge succeeded is what holds them apart.
  const ancestor = saying(spreadDirection);
  const sequential = spreadDirection.replace(
    "execute stories in parallel",
    "execute stories one at a time",
  );
  const scheduled = spreadDirection.replace(
    "so a human can read the backlog without running anything.",
    "so a human decides which stories run in parallel next.",
  );
  // The paragraph a line-by-line merge composes out of those two edits: it
  // tells agents to run one story at a time and leaves a human scheduling
  // stories in parallel. Neither branch ever said that, and nobody wrote it.
  const invented =
    "Enable agents to execute stories one at a time while collaborating through\n" +
    "trunk-based development, with each agent working in its own Git worktree.\n" +
    "Keep one readable Markdown list as the authority for what is queued and\n" +
    "taken, so a human decides which stories run in parallel next.";

  const project = scratchProject(t, ancestor);
  const arguments_ = versions(
    project,
    ancestor,
    saying(sequential),
    saying(scheduled),
  );

  const text = await textMerge(project);
  assert.equal(
    text.conflicts,
    0,
    "a text merge refused these versions itself, so they prove no contrast",
  );
  assert.ok(
    text.merged.includes(invented),
    "a text merge did not compose the paragraph this contrast is about",
  );
  assert.equal(occurrences(sequential, invented), 0);
  assert.equal(occurrences(scheduled, invented), 0);

  const refused = await run(project, arguments_);

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.equal(occurrences(project.read(), invented), 0);
  assert.match(
    refused.stderr,
    /"## Near-future direction": the versions give it different text/,
  );

  // Neither branch is the one this tool keeps, so naming them the other way
  // round says exactly the same thing about exactly the same file.
  const backwards = await run(
    project,
    versions(project, ancestor, saying(scheduled), saying(sequential)),
  );

  assert.equal(backwards.code, 1);
  assert.equal(backwards.stderr, refused.stderr);
  assert.equal(project.read(), ancestor, "the destination was written");
});
