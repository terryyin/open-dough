// Guidance structure (not Git mechanics, and not proof an agent follows the
// text): planned, planless/contextual, bug-repair, and retrospective-correction
// entry points name one increment and repair publication owner.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const owner = "trunk-publication.md#publish-an-execution-increment-or-repair";
const skill = read("dough-execute-plan/SKILL.md");
const trunk = read("dough-execute-plan/references/trunk-publication.md");
const wrapUp = read("dough-execute-plan/references/wrap-up.md");
const location = read("dough-execute-plan/references/execution-location.md");
const monitor = read("dough-execute-plan/references/ci-monitor.md");
const publisher = read(
  "dough-execute-plan/references/publish-the-candidate.md",
);
const bug = read("dough-bug-fixing/SKILL.md");
const retrospective = read("dough-execution-retrospective/SKILL.md");
const optimization = read("dough-test-optimization/SKILL.md");

test("execution entry routes name the same increment and repair owner", () => {
  assert.match(trunk, /## Publish an execution increment or repair/);
  assert.match(
    trunk,
    /Planned slices, planless and contextual work, bug repair, and a retrospective/,
  );
  assert.match(trunk, /do not add a second\s+repair push/);
  assert.match(trunk, /## Publish a queue claim/);
  assert.match(trunk, /publish that claim SHA to remote trunk/);
  assert.match(trunk, /before\s+implementation/);
  assert.equal(trunk.match(/does not push the execution branch/g).length, 1);
  assert.equal(trunk.match(/recorded remote execution branch/g).length, 1);
  assert.equal(trunk.match(/does not push it to remote trunk/g).length, 1);
  assert.equal(
    (trunk.match(/A pre-rebase unpublished SHA\s+is not the receipt/g) ?? [])
      .length,
    1,
  );

  const ownerPattern = new RegExp(owner.replaceAll(".", "\\."));
  for (const route of [
    skill,
    wrapUp,
    location,
    bug,
    retrospective,
    optimization,
    monitor,
  ]) {
    assert.match(route, ownerPattern);
  }
  assert.doesNotMatch(skill, /recorded remote execution branch/);
  assert.doesNotMatch(skill, /does not push them to remote trunk/);
  assert.doesNotMatch(wrapUp, /does not push the execution branch/);
  assert.doesNotMatch(wrapUp, /recorded remote execution branch/);
  assert.doesNotMatch(location, /does not push the execution branch/);
  assert.doesNotMatch(location, /recorded remote execution branch/);
  assert.doesNotMatch(location, /exclusive-turn/);
  assert.match(
    location,
    /select or reuse the owned workspace from\s+fetched remote trunk before the Taken claim/,
  );

  assert.match(monitor, /git stash push/);
  assert.match(monitor, /git stash apply --index STASH_OID/);
  assert.match(monitor, /never nest stash\/repair cycles/);
  assert.match(monitor, /Do not use a second repair push/);

  assert.match(publisher, /authorized remote target/);
  assert.match(publisher, /<fetched-remote-target>/);
  assert.match(publisher, /The receipt is that accepted SHA and the target/);
  assert.match(publisher, /Do not register a pre-rebase SHA/);
});
