// Exact receipt and recovery use deployed fresh/managed owners with real Git.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { armStream } from "./execution-increment-managed-delivery-codex-test-fixtures.mjs";
import {
  freshApi,
  localFixture,
} from "./execution-increment-fresh-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const targetRef = "refs/heads/main";

test("a stopped fresh publication resumes its retained candidate without another preparation or commit", async (t) => {
  const f = await localFixture(t);
  // A withheld proof after a real remote advance produces an existing
  // needs-validation stop, with a rewritten candidate owned by the publisher.
  const other = await advanceOriginFromAnotherWriter(f.origin);
  f.preparation.formatting = f.logged("formatter");
  const d = await freshApi(f);
  assert.equal(d.status, "needs-validation");
  assert.equal(await lsRemoteSha(f.origin, targetRef), other);
  assert.equal(d.recovery.candidateSha, d.candidate);
  assert.equal(d.recovery.suffixBase, other);
  assert.equal(readRevisionCoverage(d.observation.directory).length, 0);
  const head = await revParse(f.workspace, "HEAD");
  // Renew proof for the changed combination; existing-candidate managed
  // delivery accepts that exact SHA without invoking any fresh local work.
  const resumed = await f.deliverManagedExecutionIncrement({
    ...f.requestBase,
    ...d.recovery,
    previouslyPublishedBase: d.recovery.suffixBase,
    validatedCandidate: d.recovery.candidateSha,
    validate: async () => ({ ok: true }),
  });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.receipt.sha, head);
  assert.equal(await revParse(f.workspace, "HEAD"), head);
  assert.equal(readFileSync(f.operations, "utf8"), "formatter\n");
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.equal(resumed.observation.directory, d.observation.directory);
});

test("a thrown post-commit delivery retains a usable pre-push candidate/base for resume", async (t) => {
  const f = await localFixture(t);
  const d = await freshApi(f, {
    beforePush: () => {
      throw new Error("interrupted before transport");
    },
  });
  assert.equal(d.status, "delivery-interrupted");
  assert.equal(d.recovery.candidateSha, d.commit.sha);
  assert.equal(d.recovery.suffixBase, f.trunkSha);
  assert.equal(await lsRemoteSha(f.origin, targetRef), f.trunkSha);
  const head = await revParse(f.workspace, "HEAD");
  const resumed = await f.resumeManagedExecutionIncrement({
    ...f.requestBase,
    ...d.recovery,
  });
  assert.equal(resumed.receipt.sha, head);
  assert.equal(resumed.pushCount, 1);
  assert.equal(await revParse(f.workspace, "HEAD"), head);
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
});

test("lost fresh acceptance response resumes after a later remote tip with no duplicate push or commit", async (t) => {
  const f = await localFixture(t);
  const pushLog = join(f.fixture, "push.log");
  writeFileSync(
    join(f.origin, "hooks/pre-receive"),
    `#!/bin/sh\ncat >/dev/null\necho push >> '${pushLog}'\n`,
    { mode: 0o755 },
  );
  const d = await freshApi(f, {
    register: () => {
      throw new Error("lost acceptance response");
    },
  });
  assert.equal(d.status, "delivery-interrupted");
  assert.equal(await lsRemoteSha(f.origin, targetRef), d.commit.sha);
  assert.equal(d.recovery.candidateSha, d.commit.sha);
  const later = await advanceOriginFromAnotherWriter(f.origin, {
    file: "later.txt",
  });
  const pushes = readFileSync(pushLog, "utf8");
  const resumed = await f.resumeManagedExecutionIncrement({
    ...f.requestBase,
    ...d.recovery,
  });
  assert.equal(resumed.receipt.sha, d.commit.sha);
  assert.equal(resumed.pushCount, 0);
  assert.equal(await lsRemoteSha(f.origin, targetRef), later);
  assert.equal(readFileSync(pushLog, "utf8"), pushes);
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.deepEqual(
    readRevisionCoverage(resumed.observation.directory).map(({ sha }) => sha),
    [d.commit.sha],
  );
});

test("fresh owned repair attaches to the caller-supplied Codex stream", async (t) => {
  const f = await localFixture(t);
  const coordinator = "fresh-repair-coordinator";
  const stream = await armStream(f, { coordinator });
  const d = await freshApi(f, {
    host: "codex",
    coordinator,
    observerDirectory: stream.directory,
  });
  assert.equal(d.ok, true);
  assert.equal(d.observation.directory, stream.directory);
  assert.equal(d.recovery.coordinator, coordinator);
  assert.equal(d.recovery.host, "codex");
  assert.deepEqual(
    readRevisionCoverage(stream.directory).map(({ sha }) => sha),
    [d.commit.sha],
  );
});
