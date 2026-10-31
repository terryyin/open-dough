// Accepted admission withdraws only the published contribution; sources edited
// or staged after drafting remain in the originating checkout.
import assert from "node:assert/strict";
import { chmodSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  admitArgs,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  holdFirstPush,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

function newDraft(trunk) {
  const identity = "SEED-N#slow";
  const link = "seeds/N.md#slow";
  const path = ".planning/seeds/N.md";
  const seed = withFacts(
    storySection("slow", identity, "Slow tests", "Speed up tests."),
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, path, seed);
  return {
    identity,
    path,
    seed,
    args: admitArgs(identity, link, "Slow tests"),
  };
}

test("a repeated accepted admission withdraws its draft after staged content is released", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const draft = newDraft(trunk);
  await git(trunk.integration, "add", draft.path);
  const index = (await git(trunk.integration, "ls-files", "--stage")).stdout;
  const first = await startCliResult(trunk, "trunk", draft.args);
  assert.equal(first.receipt.status, "published", JSON.stringify(first));
  assert.equal(
    (await git(trunk.integration, "ls-files", "--stage")).stdout,
    index,
  );
  assert.equal(
    readFileSync(join(trunk.integration, draft.path), "utf8"),
    draft.seed,
  );
  // The caller releases only its own staged fixture content before recovery.
  await git(trunk.integration, "reset", "-q", "HEAD", "--", draft.path);
  const repeated = await startCliResult(trunk, "trunk", draft.args);
  assert.equal(repeated.receipt.status, "existing", JSON.stringify(repeated));
  assert.equal(repeated.receipt.publishedSha, first.receipt.publishedSha);
  assert.equal(
    (await git(trunk.integration, "status", "--porcelain")).stdout,
    "",
  );
  assert.equal(
    readFileSync(join(trunk.integration, draft.path), "utf8"),
    draft.seed,
  );
});

for (const change of ["content", "mode"]) {
  test(`a draft's subsequent ${change} edit survives accepted publication`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const draft = newDraft(trunk);
    const barrier = await holdFirstPush(trunk);
    const pending = startProcess(trunk, "a", draft.identity, draft.args);
    await barrier.awaitArrival(pending);
    const later = draft.seed.replace(
      "Speed up tests.",
      "Preserve this later goal.",
    );
    if (change === "content") writeDraft(trunk, draft.path, later);
    else chmodSync(join(trunk.integration, draft.path), 0o755);
    barrier.release();
    const result = await pending.result;
    assert.equal(result.receipt.ok, true, JSON.stringify(result));
    assert.equal(existsSync(join(trunk.integration, draft.path)), true);
    assert.equal(
      readFileSync(join(trunk.integration, draft.path), "utf8"),
      change === "content" ? later : draft.seed,
    );
    assert.deepEqual(result.receipt.maintenance, {
      result: "deferred",
      reason: "pending-edit",
    });
    if (change === "mode")
      assert.match(
        (
          await git(
            trunk.integration,
            "diff",
            "--no-index",
            "/dev/null",
            draft.path,
          ).catch((error) => error)
        ).stdout,
        /new file mode 100755/,
      );
  });
}

test("a subsequent separator-only edit in an existing seed survives admission", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-A#later";
  const link = "seeds/A.md#later";
  const path = ".planning/seeds/A.md";
  const seed = withFacts(
    `${readFileSync(join(trunk.integration, path), "utf8")}\n${storySection("later", identity, "Later story", "Keep its separators.")}`,
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, path, seed);
  const barrier = await holdFirstPush(trunk);
  const pending = startProcess(
    trunk,
    "a",
    identity,
    admitArgs(identity, link, "Later story"),
  );
  await barrier.awaitArrival(pending);
  const later = `${seed}\n`;
  writeDraft(trunk, path, later);
  barrier.release();
  const result = await pending.result;
  assert.equal(result.receipt.ok, true, JSON.stringify(result));
  assert.equal(readFileSync(join(trunk.integration, path), "utf8"), later);
  assert.deepEqual(result.receipt.maintenance, {
    result: "deferred",
    reason: "pending-edit",
  });
});
