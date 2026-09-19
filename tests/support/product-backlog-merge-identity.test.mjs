// Runs the real backlog CLI to reconcile three supplied versions in which one
// work item's recorded identity and its canonical home have come apart. A
// move is recorded on one branch while the other branch changes the same work,
// and the reconciliation has to publish one item that is still the work it
// was. Where two recorded identities have instead come to name one link, the
// run is handed back to a human: which work that entry is is a decision these
// versions do not establish. Where the two branches simply gave the same work
// two different identities outright — no shared link making either look like
// the same recorded name — that is the ordinary changed-on-both-sides
// disagreement every other value gets, decided by the same identity rule.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adoptedBacklog,
  correctionLink,
  headings,
  identities,
} from "./product-backlog-adoption-fixture.mjs";
import {
  backlogOf,
  occurrences,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { branchFrom, versions } from "./product-backlog-merge-fixture.mjs";
import {
  afterMove,
  backlogWith,
  lines,
  movedCorrection,
  recording,
  refresh,
} from "./product-backlog-refresh-fixture.mjs";

// One branch's version of the backlog, made the way a branch really makes one:
// the correction plan has been moved to another directory and the branch has
// recorded that move. Its entry now records the identity beside a link that no
// longer spells it, where the ancestor's entry records nothing at all because
// its link spelled the identity exactly.
async function recordedRelocation(t) {
  const project = afterMove(
    t,
    correctionLink,
    movedCorrection,
    recording(correctionLink, [[headings.correction, identities.correction]]),
  );
  const moved = await run(
    project,
    refresh(identities.correction, "--link", movedCorrection),
  );
  assert.equal(moved.code, 0, moved.stderr);
  return project.read();
}

test("merge identity reconciles a relocated canonical home as the same work", async (t) => {
  // The other branch retitles the same work, which is a compatible change:
  // one branch says where the work now lives, the other what it is called.
  const relocated = await recordedRelocation(t);
  const retitled = "Finish the hook-registration corrections";
  const renamed = await branchFrom(
    t,
    adoptedBacklog,
    refresh(identities.correction, "--title", retitled),
  );
  assert.notEqual(relocated, renamed);

  const reconciled = backlogWith(
    lines.correction,
    `- [${retitled}](${movedCorrection}) — ${identities.correction}`,
  );
  const project = scratchProject(t, adoptedBacklog);
  for (const sides of [
    [relocated, renamed],
    [renamed, relocated],
  ]) {
    const merged = await run(
      project,
      versions(project, adoptedBacklog, ...sides),
    );

    assert.equal(merged.code, 0, merged.stderr);
    // Exactly one item, carrying the identity it was recorded under, the home
    // the move gave it, and the title the other branch gave it. Every other
    // line, both lists' order, and the direction come across untouched.
    assert.equal(project.read(), reconciled);
    assert.equal(occurrences(project.read(), identities.correction), 1);
    assert.equal(occurrences(project.read(), movedCorrection), 1);
  }
});

test("merge identity refuses two recorded identities whose links coincide", async (t) => {
  // One branch records the move. The other closes that work and queues
  // different, identified work at exactly the home the move went to. The two
  // recorded identities reach each other only through that one link, which
  // establishes nothing about which of them the surviving entry is.
  const relocated = await recordedRelocation(t);
  const successor = "SEED-008#gate-and-deliver-scripted-backlog";
  const replaced = await branchFrom(
    t,
    adoptedBacklog,
    ["complete", "--identity", identities.correction],
    [
      "add",
      "--identity",
      successor,
      "--title",
      "Gate Git backlog conflicts",
      "--link",
      movedCorrection,
      "--position",
      "last",
    ],
  );

  const project = scratchProject(t, adoptedBacklog);
  const refused = await run(
    project,
    versions(project, adoptedBacklog, relocated, replaced),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), adoptedBacklog, "the destination was written");
  // Both competing identities are named, and the reason given is that their
  // links have come to coincide rather than that either work item changed.
  assert.ok(
    refused.stderr.includes(`"${identities.correction}"`),
    refused.stderr,
  );
  assert.ok(refused.stderr.includes(`"${successor}"`), refused.stderr);
  assert.match(
    refused.stderr,
    /do not become one work item by their links coming to coincide/,
  );
  assert.match(refused.stderr, /The backlog was not changed\./);
});

test("merge identity refuses two branches giving one work item different identities outright", async (t) => {
  // Neither branch's recorded identity is contradicted by a link some other
  // recorded identity has come to share — that is the coincidence case above.
  // Here the two branches simply named the same home two different things, an
  // ordinary changed-on-both-sides disagreement, decided the same way any
  // other value's is.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const before = `- [Publish the release notes](${home})`;
  const ancestor = backlogOf([takenEntry], [before]);
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(
        [takenEntry],
        [`- [Publish the release notes](${home}) — SEED-100`],
      ),
      backlogOf(
        [takenEntry],
        [`- [Publish the release notes](${home}) — SEED-200`],
      ),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    /the versions give it different identities — the first branch version has "SEED-100#publish-the-release-notes" and the second branch version has "SEED-200#publish-the-release-notes"/,
  );
  assert.match(refused.stderr, /The backlog was not changed\./);
});
