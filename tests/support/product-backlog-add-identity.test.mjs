// Runs the real backlog CLI's `add` against a canonical home that already
// claims an identity of its own: the home a queued entry's link points at is
// opened and read before the entry is written, so a mistyped or wrong
// identity is refused rather than silently written and permanently kept.
// Relocation — a home whose own path spells none of the identity but whose
// explicit record still matches — is not a refusal; only a mismatch is.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  backlog,
  backlogOf,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";

test("add refuses an identity its canonical home does not name", async (t) => {
  const project = scratchProject(t);
  // The seed's own "id:" plus the story's anchor compose "SEED-001#an-actual-
  // story"; nothing in the home names "SEED-999#an-actual-story".
  projectFile(
    project,
    "seeds/SEED-001-real.md",
    `---
id: SEED-001
---

# Real story home

<a id="an-actual-story"></a>

### An actual story

Some body text.
`,
  );

  const result = await run(project, [
    "add",
    "--identity",
    "SEED-999#an-actual-story",
    "--title",
    "Bogus",
    "--link",
    "seeds/SEED-001-real.md#an-actual-story",
    "--position",
    "last",
  ]);

  assert.equal(result.code, 1, result.stderr);
  assert.match(
    result.stderr,
    /seeds\/SEED-001-real\.md#an-actual-story names identity "SEED-001#an-actual-story", not "SEED-999#an-actual-story"/,
  );
  assert.match(result.stderr, /The backlog was not changed\./);
  assert.equal(project.read(), backlog);
});

test("add accepts a home whose recorded identity matches although its own path spells none of it", async (t) => {
  const project = scratchProject(t);
  // The link's own anchor, "new-anchor-name", spells none of "SEED-777#
  // renamed-story"; only the home's explicit record does. This is relocation,
  // the case a link-agreement rule would have wrongly refused.
  projectFile(
    project,
    "seeds/relocated-story.md",
    `---
id: SEED-321
---

# Relocated story home

<a id="new-anchor-name"></a>

### Renamed story

**Identity:** SEED-777#renamed-story

Some body text.
`,
  );

  const result = await run(project, [
    "add",
    "--identity",
    "SEED-777#renamed-story",
    "--title",
    "Renamed story",
    "--link",
    "seeds/relocated-story.md#new-anchor-name",
    "--position",
    "last",
  ]);

  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    project.read(),
    backlogOf(
      [takenEntry],
      [
        ...queued,
        "- [Renamed story](seeds/relocated-story.md#new-anchor-name) — SEED-777#renamed-story",
      ],
    ),
  );
});
