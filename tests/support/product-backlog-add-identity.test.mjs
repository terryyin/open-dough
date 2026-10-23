// Runs the real backlog CLI's `add` against a canonical home that already
// claims an identity of its own: the home a queued entry's link points at is
// opened and read before the entry is written, so a mistyped or wrong
// identity is refused rather than silently written and permanently kept.
// Relocation — a home whose own path spells none of the identity but whose
// explicit record still matches — is not a refusal; only a mismatch is. An
// identity a done record beside the backlog names belongs to completed work
// and is refused even when a recreated seed carries it again.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { recordText } from "./product-backlog-done-fixture.mjs";
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

test("add refuses an identity a done record names", async (t) => {
  const project = scratchProject(t);
  const identity = "SEED-075#story-1";
  // A recreated seed carries the identity again after cleanup removed the
  // completed story's own seed; only the done record remembers it.
  projectFile(
    project,
    "seeds/SEED-075-recreated.md",
    `---
id: SEED-075
---

# Recreated story home

<a id="story-1"></a>

### Story 1

Some body text.
`,
  );
  const record = recordText(
    identity,
    "Earlier story 1",
    "2026-10-20T08:30:00.000Z",
  );
  const recordPath = projectFile(project, "done/SEED-075_story-1.json", record);

  const result = await run(project, [
    "add",
    "--identity",
    identity,
    "--title",
    "New story 1",
    "--link",
    "seeds/SEED-075-recreated.md#story-1",
    "--position",
    "first",
  ]);

  assert.equal(result.code, 1, result.stderr);
  assert.match(
    result.stderr,
    /Identity "SEED-075#story-1" names completed work: done record done\/SEED-075_story-1\.json records "Earlier story 1", completed at 2026-10-20T08:30:00\.000Z\./,
  );
  assert.match(result.stderr, /allocate a different identity/);
  assert.match(result.stderr, /The backlog was not changed\./);
  assert.equal(project.read(), backlog);
  assert.equal(readFileSync(recordPath, "utf8"), record);
});

test("add refuses an identity whose done record cannot be read", async (t) => {
  const project = scratchProject(t);
  projectFile(project, "done/SEED-075_story-1.json", "{ not a record");

  const result = await run(project, [
    "add",
    "--identity",
    "SEED-075#story-1",
    "--title",
    "New story 1",
    "--link",
    "seeds/SEED-075-recreated.md#story-1",
    "--position",
    "first",
  ]);

  assert.equal(result.code, 1, result.stderr);
  assert.match(
    result.stderr,
    /Done record done\/SEED-075_story-1\.json for identity "SEED-075#story-1" cannot be read \(done record is not JSON\)/,
  );
  assert.equal(project.read(), backlog);
});
