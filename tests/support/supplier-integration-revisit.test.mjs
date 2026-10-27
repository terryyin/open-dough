import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  consumer,
  dependency,
  git,
  readDependencies,
  supplier,
  updateDependency,
} from "./supplier-dependency-fixture.mjs";
import {
  branchedSupplier,
  entryFor,
  identities,
  integrate,
  publishConsumers,
  recordJudgment,
  remoteMain,
  satisfied,
  seedBytes,
  selected,
  supplierBlocks,
  visitConsumers,
} from "./supplier-integration-visit-fixture.mjs";
import { cloneAsAnotherWriter } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";

test("a publication advance is revisited: changed agreements are rejudged and unresolved consumers stay explicit", async (t) => {
  const setup = await branchedSupplier(t);
  // A racing writer authors against trunk before the supplier's cleanup
  // arrives there, and publishes after the integration visit.
  const writer = join(setup.trunk.fixture, "another-writer");
  await cloneAsAnotherWriter(setup.trunk.origin, writer);
  const elsewhere = { directory: writer, inputDirectory: setup.trunk.fixture };
  const fractional = "The supplier delivers fractional-second retry intervals.";
  const changed = await updateDependency(
    elsewhere,
    setup.sibling,
    dependency(supplier, { condition: fractional }),
  );
  assert.equal(changed.code, 0, changed.stderr);
  const added = { identity: "SEED-D#d", link: "seeds/D.md#d" };
  writeFileSync(
    join(writer, ".planning/seeds/D.md"),
    '# Seed D\n\n<a id="d"></a>\n\n### Story D\n\n**Identity:** SEED-D#d\n\nConsume the endpoint.\n',
  );
  const addedRecord = await updateDependency(
    elsewhere,
    added,
    dependency(supplier),
  );
  assert.equal(addedRecord.code, 0, addedRecord.stderr);
  writeFileSync(
    join(writer, ".planning/seeds/broken.md"),
    "# Broken\n**Identity:** BROKEN\n```json dough-story-dependencies\n{}\n```\n",
  );
  await git(writer, "add", ".planning");
  await git(writer, "commit", "-q", "-m", "change and add consumers");

  const integrated = await integrate(setup, selected);
  assert.equal(integrated.code, 0, integrated.stderr);
  const { visit: first, acceptedSha } = integrated.json;
  assert.deepEqual(identities(first), [
    consumer.identity,
    setup.sibling.identity,
  ]);
  await git(writer, "pull", "-q", "--rebase", "origin", "main");
  await git(writer, "push", "-q", "origin", "main");

  const older = await recordJudgment(
    setup,
    entryFor(first, consumer.identity),
    acceptedSha,
    satisfied(setup, acceptedSha),
  );
  assert.equal(older.code, 0, older.stderr);
  const published = await publishConsumers(setup, "resolve consumer A");
  assert.equal(await remoteMain(setup), published);
  const olderBytes = (await readDependencies(setup.owned, consumer))
    .dependencies;

  const revisit = await visitConsumers(setup, acceptedSha);
  assert.equal(revisit.code, 0, revisit.stderr);
  const second = revisit.json;
  assert.equal(second.checkout.relation, "current");
  assert.equal(second.checkout.revision, published);
  assert.deepEqual(identities(second), [
    consumer.identity,
    setup.sibling.identity,
    added.identity,
  ]);
  assert.ok(
    second.problems.some((problem) => /broken\.md/.test(problem.path)),
    JSON.stringify(second.problems),
  );

  const beforeStale = seedBytes(setup.workspace);
  const stale = await recordJudgment(
    setup,
    entryFor(first, setup.sibling.identity),
    acceptedSha,
    satisfied(setup, acceptedSha),
  );
  assert.equal(stale.code, 1);
  assert.match(stale.stderr, /agreement changed/);
  assert.equal(seedBytes(setup.workspace), beforeStale);

  const missing =
    "Missing behavior: the supplier delivered whole-second retry intervals only; fractional-second intervals remain undelivered. Next action: deliver or replan fractional intervals before this consumer starts.";
  const waiting = await recordJudgment(
    setup,
    entryFor(second, setup.sibling.identity),
    acceptedSha,
    {
      state: "waiting",
      resolution: {
        ...satisfied(setup, acceptedSha).resolution,
        summary: missing,
      },
    },
  );
  assert.equal(waiting.code, 0, waiting.stderr);
  const question =
    "Which endpoint compatibility behavior does Story D promise?";
  const decision = await recordJudgment(
    setup,
    entryFor(second, added.identity),
    acceptedSha,
    {
      state: "decision-needed",
      decision: question,
      resolution: {
        ...satisfied(setup, acceptedSha).resolution,
        summary: `Unresolved product choice for the developer: ${question}`,
      },
    },
  );
  assert.equal(decision.code, 0, decision.stderr);
  const replayOlder = await recordJudgment(
    setup,
    entryFor(second, consumer.identity),
    acceptedSha,
    satisfied(setup, acceptedSha),
  );
  assert.equal(replayOlder.code, 0, replayOlder.stderr);
  const final = await publishConsumers(setup, "record unresolved consumers");
  assert.equal(await remoteMain(setup), final);

  const resolvedOlder = await readDependencies(setup.owned, consumer);
  assert.deepEqual(resolvedOlder.dependencies, olderBytes);
  assert.equal(supplierBlocks(resolvedOlder), 0);
  const stillWaiting = await readDependencies(setup.owned, setup.sibling);
  assert.equal(supplierBlocks(stillWaiting), 1);
  assert.equal(stillWaiting.dependencies[0].state, "waiting");
  assert.equal(stillWaiting.dependencies[0].condition, fractional);
  assert.ok(
    stillWaiting.dependencies[0].resolution.summary.startsWith(missing),
  );
  assert.match(
    stillWaiting.dependencies[0].resolution.summary,
    new RegExp(`Accepted integration: ${acceptedSha}`),
  );
  const needsDecision = await readDependencies(setup.owned, added);
  assert.equal(needsDecision.dependencies[0].state, "decision-needed");
  assert.equal(needsDecision.dependencies[0].decision, question);
  assert.equal(supplierBlocks(needsDecision), 1);
});
