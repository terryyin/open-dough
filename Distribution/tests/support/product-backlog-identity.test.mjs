// What a recorded identity is, run through the real CLI: an entry records the
// identity it was given in full, and the link beside it is only where the
// canonical home is now. Renaming, moving, or re-anchoring that home never
// re-identifies the work, so the same identity addresses it.
import assert from "node:assert/strict";
import { test } from "node:test";
import { identityLine } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { makeMe } from "./makeMe.mjs";
import {
  addArguments,
  backlogOf,
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
  const relocated = makeMe.aBacklogEntry
    .with({
      identity: "SEED-002#publish-the-release-notes",
      title: "Publish the release notes with the tagged release",
      href: "seeds/release-the-guidance.md#tagged-release-notes",
    })
    .please();
  const line = `- [${relocated.title}](${relocated.href}) — ${relocated.identity}`;
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

${identityLine(relocated.identity)}

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

test("the retired adopt operation leaves the project untouched", async (t) => {
  const project = scratchProject(t);
  const before = project.read();

  const result = await run(project, ["adopt", "--all"]);

  assert.equal(result.code, 1, result.stdout);
  assert.match(result.stderr, /Unknown operation: adopt/);
  assert.doesNotMatch(result.stderr, /product-backlog\.mjs adopt/);
  assert.equal(project.read(), before);
});
