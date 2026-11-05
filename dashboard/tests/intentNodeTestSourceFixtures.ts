// Published files of an Open Dough-like project for the node:test Proof
// journey (`./intentNodeTestProofFixtures.ts`): a `src/skills` location with
// a describe suite, a top-level test, a loop-generated name, a parent that
// runs subtests, and a shell script for the other-kinds sentence.

export const locationPath = "src/skills";
export const scriptsPath = `${locationPath}/dough-story-refinement/scripts`;
export const landRerunPath = `${scriptsPath}/land-rerun.test.mjs`;
export const hostLoopPath = `${scriptsPath}/host-loop.test.mjs`;
export const withSubtestsPath = `${scriptsPath}/with-subtests.test.mjs`;
export const scriptPath = "scripts/check.sh";

const landRerunSource = `import assert from "node:assert/strict";
import test, { describe } from "node:test";

describe("land rerun", () => {
  test("keeps resources after a push conflict", () => {
    assert.equal(1, 1);
  });
  test("reruns after resolution once", () => {
    assert.equal(1, 1);
  });
});

test("reports a failed refresh", () => {
  assert.equal(1, 1);
});

test("needs a later pass", () => {
  assert.equal(1, 1);
});
`;

const hostLoopSource = `import assert from "node:assert/strict";
import test from "node:test";

const hosts = ["codex", "cursor"];
for (const host of hosts) {
  test(\`\${host}: records a focused pass\`, () => {
    assert.ok(host.length > 0);
  });
}

test("listed host check", () => {
  assert.equal(1, 1);
});
`;

const withSubtestsSource = `import assert from "node:assert/strict";
import test from "node:test";

test("parent folds subtests", async (t) => {
  await t.test("child alpha", () => {
    assert.ok(true);
  });
  await t.test("child beta", () => {
    assert.ok(true);
  });
});

test("sibling keeps its own row", () => {
  assert.ok(true);
});
`;

const shellSource = `#!/usr/bin/env bash
echo ok
`;

export const sources = {
  [landRerunPath]: landRerunSource,
  [hostLoopPath]: hostLoopSource,
  [withSubtestsPath]: withSubtestsSource,
  [scriptPath]: shellSource,
};
