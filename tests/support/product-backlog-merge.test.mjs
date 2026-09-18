// Runs the real backlog CLI to reconcile three supplied versions of one
// backlog in a scratch project, observing the whole destination file's bytes:
// the changes both branches made combined once, the removals neither branch
// undid, and — where the two branches change one meaning differently — a
// diagnostic with the destination left exactly as it was.
//
// Nothing here is Git-aware. The three versions are ordinary files, which is
// the boundary the later Git slices will supply from index stages.
import assert from "node:assert/strict";
import { test } from "node:test";
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

// The direction a branch chooses when one of them updates it, as the wrapped
// paragraph a project actually writes.
const chosen =
  "Make every ordinary backlog change a scripted, validated operation,\n" +
  "so no agent has to hand-edit the shared list to reprioritize work.";

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
    ".planning/versions/ancestor.md",
    "--branch",
    ".planning/versions/one.md",
    "--branch",
    ".planning/versions/other.md",
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

test("merge items carries a change neither branch touched across", async (t) => {
  const project = scratchProject(t);

  const merged = await run(
    project,
    versions(
      project,
      backlog,
      // One branch chose a new direction and closed the architecture story.
      backlogOf([takenEntry], [trunk, retrospective], chosen),
      // The other took the trunk-integration story and left the direction.
      backlogOf([takenEntry, trunk], [retrospective, review]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(
    project.read(),
    backlogOf([takenEntry, trunk], [retrospective], chosen),
  );
  assert.equal(occurrences(project.read(), direction), 0);
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

test("merge items refuses a different direction on each branch", async (t) => {
  const project = scratchProject(t);

  const refused = await run(
    project,
    versions(
      project,
      backlog,
      backlogOf([takenEntry], queued, chosen),
      backlogOf([takenEntry], queued, ""),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    /never writes, summarises, or chooses strategy text/,
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
    ".planning/versions/nowhere.md",
    "--branch",
    ".planning/versions/one.md",
    "--branch",
    ".planning/versions/other.md",
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
