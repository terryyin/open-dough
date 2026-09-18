// Runs the real backlog CLI to reconcile three supplied versions of one
// backlog in a scratch project, observing the whole destination file's bytes:
// the changes both branches made combined once, the removals neither branch
// undid, and — where the two branches change one meaning differently — a
// diagnostic with the destination left exactly as it was.
//
// The tool being run here is not Git-aware. The three versions are ordinary
// files, which is the boundary the later Git slices will supply from index
// stages. One test below runs `git merge-file` itself, to observe what
// line-by-line text merging makes of the same three files; that is the test
// watching Git, not the tool asking it anything.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  addedLine,
  architecture,
  backlog,
  backlogOf,
  direction,
  occurrences,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";

const [trunk, retrospective, review] = queued;

// Where one of the three versions is named from, so that everything reading
// them names the same files as the helper that wrote them.
const versionPath = (name) => `.planning/versions/${name}.md`;

// Supplies only the starting precondition: the three versions as files beside
// the destination, and the arguments naming them. The destination's own
// content is supplied separately, because a merge never reads it as input.
function versions(project, ancestor, one, other) {
  const written = { ancestor, one, other };
  for (const [name, source] of Object.entries(written)) {
    projectFile(project, `versions/${name}.md`, source);
  }
  return [
    "merge",
    "--ancestor",
    versionPath("ancestor"),
    "--branch",
    versionPath("one"),
    "--branch",
    versionPath("other"),
  ];
}

test("merge items keeps both branches' closures", async (t) => {
  // Two items are taken; each branch closes one of them and leaves the other
  // exactly as the ancestor wrote it.
  const ancestor = backlogOf([takenEntry, trunk], [retrospective, review]);
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([trunk], [retrospective, review]),
      backlogOf([takenEntry], [retrospective, review]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  // Neither branch's untouched entry brought the other branch's removal back:
  // "## Taken" ends empty, keeping its heading, and the queue is untouched.
  assert.equal(project.read(), backlogOf([], [retrospective, review]));
  assert.match(
    merged.stdout,
    /removed "SEED-008#script-product-backlog-list-updates" from "## Taken"/,
  );
  assert.match(
    merged.stdout,
    /removed "SEED-008#same-machine-merge-queue" from "## Taken"/,
  );
});

test("merge items combines a claim on one branch with a closure on the other", async (t) => {
  const project = scratchProject(t);

  const merged = await run(
    project,
    versions(
      project,
      backlog,
      // One branch took the trunk-integration story.
      backlogOf([takenEntry, trunk], [retrospective, review]),
      // The other closed the architecture story it had nothing to do with.
      backlogOf([takenEntry], [trunk, retrospective]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([takenEntry, trunk], [retrospective]));
  // The claim is listed once, in "## Taken" only.
  assert.equal(occurrences(project.read(), trunk), 1);
  assert.equal(occurrences(project.read(), review), 0);
});

test("merge items gives the same result whichever branch is named first", async (t) => {
  const project = scratchProject(t);
  const claimed = backlogOf([takenEntry, trunk], [retrospective, review]);
  const closed = backlogOf([takenEntry], [trunk, retrospective]);

  const forwards = await run(
    project,
    versions(project, backlog, claimed, closed),
  );
  assert.equal(forwards.code, 0, forwards.stderr);
  const result = project.read();

  const backwards = await run(
    project,
    versions(project, backlog, closed, claimed),
  );
  assert.equal(backwards.code, 0, backwards.stderr);
  assert.equal(project.read(), result);
});

test("merge items applies an identical change on both branches once", async (t) => {
  const project = scratchProject(t);
  // Both branches closed the architecture story and queued the same new work.
  const both = backlogOf([takenEntry], [trunk, retrospective, addedLine]);

  const merged = await run(project, versions(project, backlog, both, both));

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), both);
  assert.equal(occurrences(project.read(), addedLine), 1);
  assert.equal(occurrences(project.read(), review), 0);
});

test("merge items reads one work item through its canonical home", async (t) => {
  // The ancestor entry carries no identity yet, so its identity is its link.
  // One branch adopts an identity for it; the other renames it. Both are
  // talking about one work item, and the merged entry carries both changes.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const before = `- [Publish the release notes](${home})`;
  const adopted = `- [Publish the release notes](${home}) — SEED-002`;
  const renamed = `- [Publish the release notes with the tag](${home})`;
  const ancestor = backlogOf([takenEntry], [before, retrospective]);
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([takenEntry], [adopted, retrospective]),
      backlogOf([takenEntry], [renamed, retrospective]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(
    project.read(),
    backlogOf(
      [takenEntry],
      [
        `- [Publish the release notes with the tag](${home}) — SEED-002`,
        retrospective,
      ],
    ),
  );
  assert.equal(occurrences(project.read(), home), 1);
});

test("merge items writes the destination without reading it", async (t) => {
  // The destination is where an integration left it: conflict markers no
  // backlog operation could parse. The result comes from the three supplied
  // versions alone, so it is written over whatever was there.
  const abandoned = `<<<<<<< HEAD\n${backlog}=======\nnonsense\n>>>>>>> branch\n`;
  const project = scratchProject(t, abandoned);

  const merged = await run(
    project,
    versions(
      project,
      backlog,
      backlogOf([takenEntry], [trunk, retrospective]),
      backlog,
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], [trunk, retrospective]));
});

test("merge items refuses two different changes to one work item", async (t) => {
  const project = scratchProject(t);
  const rename = (title) =>
    backlogOf(
      [takenEntry],
      [
        trunk,
        retrospective,
        review.replace(
          "Strengthen architectural review after using the lightweight guidance",
          title,
        ),
      ],
    );

  const refused = await run(
    project,
    versions(
      project,
      backlog,
      rename("Strengthen review one"),
      rename("Strengthen review two"),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(`"${architecture}": the versions give it different titles`),
  );
  assert.match(
    refused.stderr,
    /"Strengthen review one" and .* has "Strengthen review two"/,
  );
  assert.match(refused.stderr, /The backlog was not changed\./);
});

test("merge items refuses writing a version holds between the two lists", async (t) => {
  // A merge rewrites the run of sections from the direction to the end of the
  // queue, so a section wedged into that run is refused rather than dropped.
  const wedged = backlog.replace(
    "## Backlog list\n",
    "## Notes\n\nSomebody's working notes.\n\n## Backlog list\n",
  );
  const project = scratchProject(t);

  const refused = await run(
    project,
    versions(project, backlog, wedged, backlog),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    /do not come one after another, in that order\./,
  );
  assert.match(refused.stderr, /would not survive it/);
});

test("merge items refuses a closure against an explicit return to the queue", async (t) => {
  const project = scratchProject(t);

  const refused = await run(
    project,
    versions(
      project,
      backlog,
      // One branch closed the taken story.
      backlogOf([], queued),
      // The other returned it to the queue, carrying its line across.
      backlogOf([], [takenEntry, ...queued]),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    /removes it while .* changes it\. Removing work and changing it are different intentions/,
  );
});

test("merge items refuses a version it cannot read", async (t) => {
  const project = scratchProject(t);

  const prose = backlog.replace(
    "## Backlog list\n\n",
    "## Backlog list\n\nStories we might do next:\n\n",
  );
  const malformed = await run(
    project,
    versions(project, backlog, prose, backlog),
  );
  assert.equal(malformed.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    malformed.stderr,
    /the first branch version \(.*one\.md\) is not a backlog this tool can read/,
  );
  assert.match(malformed.stderr, /Unsupported text in "## Backlog list"/);

  const twice = backlogOf([takenEntry], [trunk, retrospective, trunk]);
  const duplicate = await run(
    project,
    versions(project, backlog, twice, backlog),
  );
  assert.equal(duplicate.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(duplicate.stderr, /already lists the same work twice/);

  const absent = await run(project, [
    "merge",
    "--ancestor",
    versionPath("nowhere"),
    "--branch",
    versionPath("one"),
    "--branch",
    versionPath("other"),
  ]);
  assert.equal(absent.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    absent.stderr,
    /Not found: .*nowhere\.md \(the ancestor version\)/,
  );
});

test("merge items refuses one branch saying two things about one work item", async (t) => {
  // The entry is listed once on each side, but the branch's refreshed link and
  // its re-added old home are the same work: across the versions they chain
  // together, and no merge rule establishes which of the two it meant.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const moved =
    "seeds/SEED-009-release-the-guidance.md#publish-the-release-notes";
  const ancestor = backlogOf([takenEntry], [`- [Notes](${home}) — SEED-002`]);
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(
        [takenEntry],
        [`- [Notes](${moved}) — SEED-002`, `- [Notes](${home})`],
      ),
      ancestor,
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    /separately, but across the supplied versions they name one work item/,
  );
});

test("merge items requires the ancestor and exactly two branch versions", async (t) => {
  const project = scratchProject(t);
  const written = versions(project, backlog, backlog, backlog);

  const unanchored = await run(
    project,
    written.slice(0, 1).concat(written.slice(3)),
  );
  assert.equal(unanchored.code, 1);
  assert.match(unanchored.stderr, /Missing ancestor: supply --ancestor\./);
  assert.match(
    unanchored.stderr,
    /names the version both branches started from/,
  );

  const alone = await run(project, written.slice(0, 5));
  assert.equal(alone.code, 1);
  assert.match(
    alone.stderr,
    /Supply --branch <path> exactly twice, once for each branch's version of the backlog; found 1\./,
  );
  assert.equal(project.read(), backlog, "the destination was written");
});

// Entries named by a single letter, so a list's order reads as its letters and
// the lexical tie-break the Taken rule uses is visible in the expectation
// rather than hidden in a real story title.
const item = (letter) =>
  `- [Story ${letter}](seeds/SEED-003-ordering.md#story-${letter.toLowerCase()}) — SEED-003`;
const named = (letter) => `SEED-003#story-${letter.toLowerCase()}`;
const list = (letters) => [...letters].map(item);

test("merge order places each branch's addition where that branch put it", async (t) => {
  // The queue both branches started from is A, B, C. One queued X between A
  // and B; the other queued Y between B and C. Both placements are explicit
  // priority decisions, and both survive.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("AXBC")),
      backlogOf([], list("ABYC")),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("AXBYC")));
});

test("merge order keeps a reprioritization the other branch left alone", async (t) => {
  // One branch moved C to the front of the queue. The other branch wrote the
  // queue out exactly as the ancestor had it, which says nothing about C.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(project, ancestor, backlogOf([], list("CAB")), ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("CAB")));
});

test("merge order does not read an untouched order as undoing a reprioritization", async (t) => {
  // One branch reprioritized B above A; the other left that order alone and
  // completed C. Leaving an order alone is not an instruction to restore it,
  // so the reprioritization stands and the removal still applies.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("BAC")),
      backlogOf([], list("AB")),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("BA")));
  assert.equal(occurrences(project.read(), item("C")), 0);
});

test("merge order appends concurrent claims to Taken and will not order a queue that way", async (t) => {
  // Taken holds M. One branch claimed P; the other claimed N and then Z.
  // Survivors keep their order, each branch's additions keep theirs, and the
  // lexically smallest waiting identity goes next: M, N, P, Z.
  const ancestor = backlogOf(list("M"), list("NPZK"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(list("MP"), list("NZK")),
      backlogOf(list("MNZ"), list("PK")),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf(list("MNPZ"), list("K")));

  // The same two additions in the queue are two priority decisions in one
  // place, so the interleaving rule is not applied to them.
  const queued = backlogOf([], list("KM"));
  const project2 = scratchProject(t, queued);
  const refused = await run(
    project2,
    versions(
      project2,
      queued,
      backlogOf([], list("KMP")),
      backlogOf([], list("KMN")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project2.read(), queued, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(`puts "${named("P")}" and .* puts "${named("N")}"`),
  );
  assert.match(refused.stderr, /in the same place, after "SEED-003#story-m"/);
});

test("merge order refuses two branches moving one entry different ways", async (t) => {
  // The case an ordinary text merge accepts and then duplicates: each branch
  // moved B, to a different place. Neither move is the ancestor's order, so
  // nothing establishes which one holds.
  const ancestor = backlogOf([], list("ABCD"));
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("ACBD")),
      backlogOf([], list("ACDB")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    /"## Backlog list": the versions put the entries they share in different orders/,
  );
});

test("merge order refuses a queue position the versions do not determine", async (t) => {
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  // Both branches queued new work into the same gap, between B and C.
  const gap = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("ABXC")),
      backlogOf([], list("ABYC")),
    ),
  );
  assert.equal(gap.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    gap.stderr,
    /in the same place, after "SEED-003#story-b", and nothing in the versions says which of them comes first/,
  );
  assert.match(gap.stderr, /which is a decision for a human/);

  // The same branch moved one entry to two different places.
  const apart = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("AXBC")),
      backlogOf([], list("ABXC")),
    ),
  );
  assert.equal(apart.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    apart.stderr,
    new RegExp(
      `puts "${named("X")}" after "${named("A")}" and .* puts it after ` +
        `"${named("B")}"`,
    ),
  );

  // Both branches queued the same two entries into the same gap, in opposite
  // order. They agree about where the pair sits and disagree about which of
  // the two is the more important, which is the same decision to hand back.
  const swapped = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("AXYBC")),
      backlogOf([], list("AYXBC")),
    ),
  );
  assert.equal(swapped.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    swapped.stderr,
    new RegExp(
      `puts "${named("X")}", "${named("Y")}" and .* puts "${named("Y")}", ` +
        `"${named("X")}" in the same place, after "${named("A")}"`,
    ),
  );
});

test("merge order lists an entry that moved exactly once", async (t) => {
  // One branch moved B to the end of the queue; the other queued X after A.
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  const moved = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("ACB")),
      backlogOf([], list("AXBC")),
    ),
  );

  assert.equal(moved.code, 0, moved.stderr);
  assert.equal(project.read(), backlogOf([], list("AXCB")));
  assert.equal(occurrences(project.read(), item("B")), 1);

  // One branch claimed B, moving it between the lists; the other left it in
  // the queue and queued X after A.
  const claimed = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(list("B"), list("AC")),
      backlogOf([], list("AXBC")),
    ),
  );

  assert.equal(claimed.code, 0, claimed.stderr);
  assert.equal(project.read(), backlogOf(list("B"), list("AXC")));
  assert.equal(occurrences(project.read(), item("B")), 1);
});

test("merge order gives the same bytes whichever branch is named first", async (t) => {
  const ancestor = backlogOf(list("M"), list("ABCNPZK"));
  const project = scratchProject(t, ancestor);
  // One branch queued X after A and claimed P; the other queued Y after B,
  // reprioritized C to the front, and claimed N and then Z.
  const one = backlogOf(list("MP"), list("AXBCNZK"));
  const other = backlogOf(list("MNZ"), list("CABYPK"));

  const forwards = await run(project, versions(project, ancestor, one, other));
  assert.equal(forwards.code, 0, forwards.stderr);
  const result = project.read();
  assert.equal(result, backlogOf(list("MNPZ"), list("CAXBYK")));

  const backwards = await run(project, versions(project, ancestor, other, one));
  assert.equal(backwards.code, 0, backwards.stderr);
  assert.equal(project.read(), result);
});

test("merge order queues work at the head of the list the branch that put it there wanted", async (t) => {
  // The ordinary "this comes first now" reprioritization: one branch queued X
  // above everything, and the other wrote the queue out as the ancestor had
  // it. An untouched queue says nothing about a place it never named, so X
  // keeps the head, and nothing else in the file moves.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(project, ancestor, backlogOf([], list("XAB")), ancestor),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([], list("XAB")));
});

test("merge order refuses two branches both queuing work at the head", async (t) => {
  // Each branch decided its own work was the most important thing in the
  // queue. Nothing in the three versions orders the two decisions.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("XAB")),
      backlogOf([], list("YAB")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(
      `puts "${named("X")}" and .* puts "${named("Y")}" in the same place, ` +
        `at the start of the list, and nothing in the versions says which of ` +
        `them comes first`,
    ),
  );
});

test("merge order refuses one entry queued at the head on one branch and below it on the other", async (t) => {
  // The head is a place like any other, so putting one entry there and
  // putting the same entry after A are two different priority decisions.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("XAB")),
      backlogOf([], list("AXB")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(
      `puts "${named("X")}" at the start of the list and .* puts it after ` +
        `"${named("A")}"`,
    ),
  );
});

// The direction is one value, and the same one rule decides it. These
// establish that the rule reaches it, that the report tells a caller when it
// moved, and that two different directions are handed back rather than run
// together — including where line-by-line text merging would run them
// together silently.

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
