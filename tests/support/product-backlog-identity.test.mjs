// What a recorded identity is, run through the real CLI: an entry records the
// identity it was given in full, and the link beside it is only where the
// canonical home is now. Renaming, moving, or re-anchoring that home never
// re-identifies the work, and an entry written in the older shorthand still
// names the work item it always named.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adopt,
  adoptedBacklog,
  headings,
  homes,
  identities,
  legacyBacklog,
  legacyProject,
  seedOne,
} from "./product-backlog-adoption-fixture.mjs";
import {
  addArguments,
  backlogOf,
  entries,
  occurrences,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";

test("add records an identity the link no longer spells", async (t) => {
  // The seed was renamed and the story's anchor changed after this identity
  // was allocated. The entry records the identity it was given; the link is
  // only where the canonical home is now, so neither the file name nor the
  // anchor has to spell the identity back — only the home's own explicit
  // record does, which is exactly what relocation looks like.
  const relocated = {
    identity: "SEED-002#publish-the-release-notes",
    title: "Publish the release notes with the tagged release",
    link: "seeds/release-the-guidance.md#tagged-release-notes",
  };
  const line = `- [${relocated.title}](${relocated.link}) — ${relocated.identity}`;
  const project = scratchProject(t);
  projectFile(
    project,
    "seeds/release-the-guidance.md",
    `---
id: SEED-002
---

# Release the guidance

<a id="tagged-release-notes"></a>

### Publish the release notes with the tagged release

**Identity:** ${relocated.identity}

Ship the notes once tagging completes.
`,
  );

  const added_ = await run(
    project,
    addArguments(relocated, ["--position", "last"]),
  );
  assert.equal(added_.code, 0, added_.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], [...queued, line]));
  assert.match(added_.stdout, new RegExp(`Added "${relocated.identity}"`));

  // The recorded identity, not the link, is what addresses the work after it.
  const placed = await run(project, [
    "place",
    "--identity",
    relocated.identity,
    "--position",
    "first",
  ]);
  assert.equal(placed.code, 0, placed.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], [line, ...queued]));
});

test("adopt identity: a legacy shorthand entry keeps the identity it already meant", async (t) => {
  const project = legacyProject(t);
  const shorthand = `#default-skip-process-retrospective) — SEED-001`;
  assert.ok(legacyBacklog.includes(shorthand), "the shorthand was not listed");

  const result = await run(project, adopt);
  assert.equal(result.code, 0, result.stderr);

  // The same work item, still fourth in the queue, now recording in full the
  // identity the shorthand named against the link's anchor.
  const after = project.read();
  assert.equal(
    entries(after, "Backlog list")[2],
    `- [Skip process retrospectives by default for new installations](${seedOne}#default-skip-process-retrospective) — ${identities.retrospective}`,
  );
  assert.equal(occurrences(after, `) — SEED-001\n`), 0);
  assert.match(
    result.stdout,
    new RegExp(`${identities.retrospective} — Skip process retrospectives`),
  );
});

test("adopt identity: an entry whose home has moved keeps its recorded identity", async (t) => {
  // The seed was renamed and the story re-anchored after this identity was
  // allocated, and the moved seed records the identity it was given. Adoption
  // reads that record; it does not spell a new identity from the new link.
  const moved = "seeds/SEED-001-install-open-dough.md";
  const movedLink = `${moved}#skip-process-retrospectives`;
  const relocated = homes[seedOne]
    .replace(
      '<a id="default-skip-process-retrospective">',
      '<a id="skip-process-retrospectives">',
    )
    .replace(
      `${headings.retrospective}\n`,
      `${headings.retrospective}\n\n**Identity:** ${identities.retrospective}\n`,
    );
  const backlog = legacyBacklog.replace(
    `${seedOne}#default-skip-process-retrospective) — SEED-001`,
    `${movedLink}) — ${identities.retrospective}`,
  );
  assert.notEqual(backlog, legacyBacklog, "the relocated entry was not listed");
  const project = legacyProject(t, { backlog, extra: { [moved]: relocated } });
  const before = project.snapshot();

  const result = await run(project, adopt);
  assert.equal(result.code, 0, result.stderr);

  // The entry is untouched, the moved home is untouched, and nothing was
  // allocated a second time under the anchor the link now carries.
  const after = project.read();
  assert.ok(after.includes(`](${movedLink}) — ${identities.retrospective}`));
  assert.equal(occurrences(after, "skip-process-retrospectives)"), 1);
  assert.equal(occurrences(after, "SEED-001#skip-process-retrospectives"), 0);
  assert.equal(project.readHome(moved), before[moved]);
  assert.match(result.stdout, /Recorded 4 identities for 4 active entries/);

  // And running it again records nothing and changes nothing.
  const settled = project.snapshot();
  const again = await run(project, adopt);
  assert.equal(again.code, 0, again.stderr);
  assert.match(again.stdout, /already record their identity/);
  assert.deepEqual(project.snapshot(), settled);
});

test("adopt identity: recording nothing new still writes the entries in full", async (t) => {
  // Every canonical home already records its identity; only the entries are
  // still written in the older shorthand. Adoption rewrites them and says so
  // rather than claiming the backlog is unchanged.
  const project = legacyProject(t);
  assert.equal((await run(project, adopt)).code, 0);
  const recorded = project.snapshot();
  project.write("PRODUCT-BACKLOG.md", legacyBacklog);

  const result = await run(project, adopt);
  assert.equal(result.code, 0, result.stderr);
  assert.match(
    result.stdout,
    /All 4 active entries already record their identity in their canonical homes\./,
  );
  assert.match(result.stdout, /Entries now naming their identity in/);
  assert.equal(project.read(), adoptedBacklog);
  assert.deepEqual(project.snapshot(), recorded);
});
