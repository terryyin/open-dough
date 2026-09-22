// Slice 2 refusal proof: duplicate blocks, wrong identity, unsupported schema,
// and legacy absence leave files unchanged and stay distinct outcomes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { run, scratchProject } from "./product-backlog-fixture.mjs";
import {
  backlogBytes,
  first,
  plantSeed,
  readArgs,
  recordArgs,
  second,
  seedBytes,
  twoStorySeed,
} from "./story-state-fixture.mjs";

test("story-state: duplicate blocks and wrong identity refuse without writes", async (t) => {
  const project = scratchProject(t);
  const duplicate = twoStorySeed.replace(
    "Goal, scope, and examples for the first story.",
    `\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
\`\`\`

\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planless"}
\`\`\`

Goal, scope, and examples for the first story.`,
  );
  plantSeed(project, duplicate);
  const before = seedBytes(project);
  const backlogBefore = backlogBytes(project);

  const refused = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
    }),
  );
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /holds 2 story-state blocks/);
  assert.match(refused.stderr, /Nothing was written/);
  assert.equal(seedBytes(project), before);
  assert.equal(backlogBytes(project), backlogBefore);

  const wrongIdentity = await run(
    project,
    recordArgs(
      { ...second, identity: "SEED-021#missing-story" },
      { refinement: "refined", approach: "unselected" },
    ),
  );
  assert.equal(wrongIdentity.code, 1);
  assert.match(wrongIdentity.stderr, /names identity "SEED-021#second-story"/);
  assert.match(wrongIdentity.stderr, /Nothing was written/);
  assert.equal(seedBytes(project), before);
});

test("story-state: unsupported version and legacy absence are distinct", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);

  const legacy = await run(project, readArgs(first));
  assert.equal(legacy.code, 0, legacy.stderr);
  const legacyState = JSON.parse(legacy.stdout);
  assert.equal(legacyState.status, "not-recorded");
  assert.equal(legacyState.refinement, undefined);
  assert.equal(legacyState.approach, undefined);

  const withUnsupported = twoStorySeed.replace(
    "Goal, scope, and examples for the first story.",
    `\`\`\`json dough-story-state
{"schemaVersion":99,"refinement":"refined","approach":"unselected"}
\`\`\`

Goal, scope, and examples for the first story.`,
  );
  plantSeed(project, withUnsupported);
  const before = seedBytes(project);

  const unsupportedRead = await run(project, readArgs(first));
  assert.equal(unsupportedRead.code, 0, unsupportedRead.stderr);
  const unsupportedState = JSON.parse(unsupportedRead.stdout);
  assert.equal(unsupportedState.status, "unsupported-version");
  assert.equal(unsupportedState.schemaVersion, 99);
  assert.notEqual(unsupportedState.status, legacyState.status);

  const refused = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
    }),
  );
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /schema version 99/);
  assert.match(refused.stderr, /Nothing was written/);
  assert.equal(seedBytes(project), before);

  const neighbor = JSON.parse((await run(project, readArgs(second))).stdout);
  assert.equal(neighbor.status, "not-recorded");
});
