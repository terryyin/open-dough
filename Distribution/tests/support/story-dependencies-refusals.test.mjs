import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { run, scratchProject } from "./product-backlog-fixture.mjs";
import {
  readDependencies,
  updateDependency,
} from "./story-dependencies-fixture.mjs";
import { first, plantSeed, second, seedBytes } from "./story-state-fixture.mjs";

test("dependency CLI refuses stale writes and invalid or ambiguous endpoints without partial changes", async (t) => {
  const project = scratchProject(t);
  const path = plantSeed(project);
  const initial = await readDependencies(project, first);
  assert.equal(
    (
      await updateDependency(
        project,
        first,
        makeMe.aSupplierAgreement
          .with({ supplier: second, state: "waiting" })
          .please(),
      )
    ).code,
    0,
  );
  const held = seedBytes(project);
  const stale = await updateDependency(
    project,
    first,
    makeMe.aSupplierAgreement
      .with({
        supplier: second,
        state: "waiting",
        rationale: "Old proposed replacement",
      })
      .please(),
    initial.basis,
  );
  assert.equal(stale.code, 1);
  assert.match(stale.stderr, /changed since it was read/);
  assert.equal(seedBytes(project), held);
  const valid = makeMe.aSupplierAgreement
    .with({ supplier: second, state: "waiting" })
    .please();
  for (const entry of [
    { ...valid, condition: "" },
    { ...valid, supplier: { identity: first.identity, href: first.href } },
    { ...valid, supplier: { identity: "WRONG", href: second.href } },
    {
      ...valid,
      supplier: { identity: "MISSING", href: "seeds/absent.md#missing" },
    },
    { ...valid, state: "satisfied" },
    { ...valid, state: "decision-needed" },
  ]) {
    const result = await updateDependency(project, first, entry);
    assert.equal(result.code, 1, JSON.stringify(entry));
    assert.equal(seedBytes(project), held);
  }
  const ambiguous = held.replace(
    `**Identity:** ${second.identity}`,
    `**Identity:** ${second.identity}\n**Identity:** ${second.identity}`,
  );
  writeFileSync(path, ambiguous);
  const result = await updateDependency(project, first, valid);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /identity 2 times/);
  assert.equal(seedBytes(project), ambiguous);
});

for (const block of [
  "```json dough-story-dependencies\n{}\n```",
  "```json dough-story-dependencies\nnot json\n```",
  "```json dough-story-dependencies\n{}",
  `\`\`\`json dough-story-dependencies\n${JSON.stringify({ schemaVersion: 1, identity: first.identity })}\n\`\`\``,
  `\`\`\`json dough-story-dependencies\n${JSON.stringify({ schemaVersion: 99, identity: first.identity, dependencies: [] })}\n\`\`\``,
  `\`\`\`json dough-story-dependencies\n${JSON.stringify({ schemaVersion: 1, identity: first.identity, dependencies: [] })}\n\`\`\`\n\`\`\`json dough-story-dependencies\n{}\n\`\`\``,
]) {
  test(`a malformed present dependency block refuses reads: ${block.slice(0, 55)}`, async (t) => {
    const project = scratchProject(t);
    plantSeed(project, seedBytesForBlock(block));
    const result = await run(project, [
      "read-dependencies",
      "--link",
      first.href,
    ]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Story dependencies/);
  });
}

function seedBytesForBlock(block) {
  return `---\nid: SEED-021\n---\n# Seed\n<a id="first-story"></a>\n### First\n**Identity:** ${first.identity}\n${block}\n`;
}
