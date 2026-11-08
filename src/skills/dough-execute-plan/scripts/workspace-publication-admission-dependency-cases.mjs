// Published dependency agreements gate admission as well as queued starts.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { updateDependency } from "../../../../tests/support/story-dependencies-fixture.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import { draftLateStory } from "./workspace-publication-admission-fixtures.mjs";
import {
  consumer,
  projectOf,
  publishDependency,
  supplier,
} from "./workspace-publication-dependency-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";

test("a canonical story admitted with a drafted dependency refuses before Take", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const late = draftLateStory(trunk);
  const result = await updateDependency(
    projectOf(trunk),
    { identity: late.identity, href: "seeds/A.md#late" },
    makeMe.aSupplierAgreement.with({ supplier, state: "waiting" }).please(),
  );
  assert.equal(result.code, 0, result.stderr);
  const start = await startCliResult(trunk, "story-branch", late.args, {
    identity: late.identity,
  });
  assert.equal(start.code, 1, JSON.stringify(start));
  assert.match(start.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(start.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("published unlisted admission dependency cannot be bypassed by an older draft", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const late = draftLateStory(trunk);
  const path = join(trunk.integration, late.seedPath);
  const stale = readFileSync(path, "utf8");
  const tip = await publishDependency(
    trunk,
    makeMe.aSupplierAgreement.with({ supplier, state: "waiting" }).please(),
    {
      identity: late.identity,
      href: "seeds/A.md#late",
    },
  );
  writeFileSync(path, stale);
  const start = await startCliResult(trunk, "story-branch", late.args, {
    identity: late.identity,
  });
  assert.equal(start.code, 1, JSON.stringify(start));
  assert.match(start.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(start.workspace), false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
});

test("carrying a queued one-shot attempt into admission preserves the published start gate", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const tip = await publishDependency(
    trunk,
    makeMe.aSupplierAgreement.with({ supplier, state: "waiting" }).please(),
  );
  const start = await startCliResult(trunk, "story-branch", [
    "--admit",
    "--carry",
    "--link",
    consumer.href,
    "--title",
    "Story A",
  ]);
  assert.equal(start.code, 1, JSON.stringify(start));
  assert.match(start.receipt.error, /execution is blocked by SEED-B#b/);
  assert.equal(existsSync(start.workspace), false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
});
