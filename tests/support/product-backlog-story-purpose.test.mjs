// Recorded Goal as purpose from a canonical home; missing Goal is Not recorded.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readStoryPurpose } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-purpose.mjs";

const seed = `---
id: SEED-075
---

# Seed

<a id="with-goal"></a>

### Story with a goal

**Identity:** SEED-075#with-goal

**Goal:** Deliver visible slice progress
without inventing completion.

**Scope:** Public cards and detail.

<a id="without-goal"></a>

### Story without a goal

**Identity:** SEED-075#without-goal

**Status:** Captured only.
`;

test("readStoryPurpose returns the recorded Goal and Not recorded when absent", () => {
  const recorded = readStoryPurpose(seed, "seeds/SEED-075.md#with-goal");
  assert.equal(recorded.status, "recorded");
  assert.equal(
    recorded.purpose,
    "Deliver visible slice progress\nwithout inventing completion.",
  );

  const missing = readStoryPurpose(seed, "seeds/SEED-075.md#without-goal");
  assert.equal(missing.status, "not-recorded");
});
