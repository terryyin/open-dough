// The real startup command checks published dependency agreements before
// creating a workspace/claim. No native process can be launched on refusal.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  queuedReadyRepository,
  queuedSeedWithDependency,
  readyStoryState,
  storyA,
  storySeed,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { run } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  readDependencies,
  resolution,
} from "../../../../tests/support/story-dependencies-fixture.mjs";
import {
  readState,
  recordArgs,
} from "../../../../tests/support/story-state-fixture.mjs";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

import {
  consumer,
  projectOf,
  publishDependency,
  supplier,
} from "./workspace-publication-dependency-fixtures.mjs";
import "./workspace-publication-startup-dependency-recovery-cases.mjs";

// The consumer's recorded story-state block as published at `rev`.
async function publishedStoryState(trunk, rev) {
  const seed = (await git(trunk.origin, "show", `${rev}:.planning/seeds/A.md`))
    .stdout;
  return seed.match(/```json dough-story-state\n[^]*?\n```/)[0];
}

// Records the consumer Ready over its current digests through the real
// record-state command, after its dependencies, as record-preparation orders,
// and publishes that assessment.
async function publishReadyAssessment(trunk) {
  const { basis } = await readState(projectOf(trunk), consumer);
  const recorded = await run(
    projectOf(trunk),
    recordArgs(consumer, {
      ...readyStoryState(storyA),
      expectedBasis: basis,
    }),
  );
  assert.equal(recorded.code, 0, recorded.stderr);
  await git(trunk.integration, "commit", "-am", "assess A ready");
  await git(trunk.integration, "push", "origin", "main");
}

for (const oneShot of [false, true]) {
  test(`published blocker refuses ${oneShot ? "queued one-shot" : "ordinary"} start beside a stale ready local copy`, async (t) => {
    const seedPath = ".planning/seeds/A.md";
    const waiting = makeMe.aSupplierAgreement
      .with({ supplier, state: "waiting" })
      .please();
    const trunk = await materializeRepository(
      queuedReadyRepository()
        .withRevision("published blocker", {
          message: "record prerequisite",
          files: { [seedPath]: queuedSeedWithDependency(storyA, waiting) },
        })
        .please(),
    );
    t.after(trunk.cleanup);
    const { stdout: stale } = await git(
      trunk.origin,
      "show",
      `${trunk.revisions.base}:${seedPath}`,
    );
    const facts = await readDependencies(projectOf(trunk), consumer);
    assert.equal(facts.blocking[0].supplier.identity, identityB);
    writeFileSync(join(trunk.integration, seedPath), stale);
    const result = await startCliResult(
      trunk,
      "story-branch",
      oneShot ? ["--one-shot"] : [],
    );
    assert.equal(result.code, 1, JSON.stringify(result));
    assert.equal(result.receipt.status, "source-refused");
    assert.match(result.receipt.error, /execution is blocked by SEED-B#b/);
    assert.match(result.receipt.error, /normal reconciliation cannot supply/);
    assert.match(result.receipt.error, /completion condition/);
    assert.equal(existsSync(result.workspace), false);
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      trunk.trunkSha,
    );
    assert.deepEqual(
      takenIdentities(
        (await git(trunk.origin, "show", "main:.planning/PRODUCT-BACKLOG.md"))
          .stdout,
      ),
      [],
    );
    assert.equal(
      (
        await git(
          trunk.origin,
          "ls-tree",
          "--name-only",
          "main",
          ".planning/agents/",
        )
      ).stdout,
      "",
    );
    assert.equal(
      await lsRemoteSha(trunk.origin, `refs/heads/${result.branch}`),
      "",
    );
  });
}

test("all dependencies must be satisfied before a ready story starts", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  const third = { identity: "SUPPLIER-3", href: "seeds/third.md" };
  writeFileSync(
    join(trunk.integration, ".planning/seeds/third.md"),
    `# Third supplier\n**Identity:** ${third.identity}\n`,
  );
  await publishDependency(
    trunk,
    makeMe.aSupplierAgreement.with({ supplier, state: "waiting" }).please(),
  );
  await publishDependency(
    trunk,
    makeMe.aSupplierAgreement
      .with({ supplier: third, state: "waiting" })
      .please(),
  );
  await publishReadyAssessment(trunk);
  await publishDependency(
    trunk,
    makeMe.aSupplierAgreement
      .with({ supplier, state: "satisfied", resolution })
      .please(),
  );
  const partial = await startCliResult(trunk, "story-branch");
  assert.equal(partial.code, 1);
  assert.match(partial.receipt.error, /SUPPLIER-3/);
  assert.doesNotMatch(partial.receipt.error, /SEED-B#b/);
  assert.equal(existsSync(partial.workspace), false);
  const resolved = await publishDependency(
    trunk,
    makeMe.aSupplierAgreement
      .with({ supplier: third, state: "satisfied", resolution })
      .please(),
  );
  const complete = await startCliResult(trunk, "story-branch");
  assert.equal(complete.code, 0, JSON.stringify(complete));
  assert.equal(complete.receipt.ok, true);
  assert.equal(complete.receipt.changedSinceReview, false);
  assert.equal(existsSync(complete.workspace), true);
  // Resolution alone made the story eligible: no readiness write between.
  assert.equal(
    takenIdentities(
      (
        await git(
          trunk.origin,
          "show",
          `${complete.receipt.publishedSha}:.planning/PRODUCT-BACKLOG.md`,
        )
      ).stdout,
    ).includes(consumer.identity),
    true,
  );
  assert.equal(
    await publishedStoryState(trunk, complete.receipt.publishedSha),
    await publishedStoryState(trunk, resolved),
  );
});

test("one start refusal names a waiting dependency and a not-ready assessment", async (t) => {
  const seedPath = ".planning/seeds/A.md";
  const notReady = { assessment: "not-ready", reasons: ["Scope unresolved"] };
  const waiting = makeMe.aSupplierAgreement
    .with({ supplier, state: "waiting" })
    .please();
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("assess A not-ready", {
        storyStates: [{ ...readyStoryState(storyA), ...notReady }],
      })
      .withRevision("publish waiting prerequisite", {
        message: "record prerequisite",
        files: {
          [seedPath]: queuedSeedWithDependency(storyA, waiting, notReady),
        },
      })
      .please(),
  );
  t.after(trunk.cleanup);
  const result = await startCliResult(trunk, "story-branch");
  assert.equal(result.code, 1, JSON.stringify(result));
  assert.equal(result.receipt.status, "source-refused");
  assert.match(result.receipt.error, /execution is blocked by SEED-B#b/);
  assert.match(result.receipt.error, /published preparation is not-ready/);
  assert.equal(existsSync(result.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
  assert.deepEqual(
    takenIdentities(
      (await git(trunk.origin, "show", "main:.planning/PRODUCT-BACKLOG.md"))
        .stdout,
    ),
    [],
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, `refs/heads/${result.branch}`),
    "",
  );
});

test("a malformed published dependency cannot look like no blockers", async (t) => {
  const malformed = "\n```json dough-story-dependencies\n{}\n```\n";
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("malformed prerequisite", {
        files: {
          ".planning/seeds/A.md": storySeed(storyA, "Execute A.") + malformed,
        },
        storyStates: [readyStoryState(storyA)],
      })
      .please(),
  );
  t.after(trunk.cleanup);
  for (const extra of [[], ["--one-shot"]]) {
    const result = await startCliResult(trunk, "story-branch", extra);
    assert.equal(result.code, 1);
    assert.match(result.receipt.error, /dependency schema version/);
    assert.equal(existsSync(result.workspace), false);
  }
});
