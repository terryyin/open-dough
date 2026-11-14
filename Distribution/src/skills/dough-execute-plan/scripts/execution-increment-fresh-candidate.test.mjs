// Exact candidate and proof-governed reconciliation through deployed owners.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  freshApi,
  localFixture,
} from "./execution-increment-fresh-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const targetRef = "refs/heads/main";

test("a branch advance before managed delivery refuses the changed candidate while retaining the successful receipt", async (t) => {
  const f = await localFixture(t);
  const d = await freshApi(f, {}, async (request) => {
    const receiptSha = request.validatedCandidate;
    assert.equal(receiptSha, await revParse(f.workspace, "HEAD"));
    writeFileSync(join(f.workspace, "later.txt"), "later branch tip\n");
    await git(f.workspace, "add", "later.txt");
    await git(f.workspace, "commit", "-m", "later local commit");
    return f.deliverManagedExecutionIncrement(request);
  });
  assert.equal(d.status, "candidate-mismatch");
  assert.notEqual(d.commit.sha, await revParse(f.workspace, "HEAD"));
  assert.equal(d.recovery.candidateSha, d.commit.sha);
  assert.equal(d.recovery.suffixBase, f.trunkSha);
  assert.equal(await lsRemoteSha(f.origin, targetRef), f.trunkSha);
  assert.deepEqual(readRevisionCoverage(d.observation.directory), []);
});

test("a refused changed candidate retains the full base ID its abbreviation names", async (t) => {
  const f = await localFixture(t);
  const d = await freshApi(
    f,
    { previouslyPublishedBase: f.trunkSha.slice(0, 10) },
    async (request) => {
      writeFileSync(join(f.workspace, "later.txt"), "later branch tip\n");
      await git(f.workspace, "add", "later.txt");
      await git(f.workspace, "commit", "-m", "later local commit");
      return f.deliverManagedExecutionIncrement(request);
    },
  );
  assert.equal(d.status, "candidate-mismatch");
  assert.equal(d.previouslyPublishedBase, f.trunkSha);
  assert.equal(d.recovery.suffixBase, f.trunkSha);
  assert.equal(await lsRemoteSha(f.origin, targetRef), f.trunkSha);
});

test("advancing the branch at the existing beforePush boundary still publishes only the committed receipt", async (t) => {
  const f = await localFixture(t);
  const d = await freshApi(f, {
    beforePush: async ({ candidate }) => {
      assert.equal(candidate, await revParse(f.workspace, "HEAD"));
      writeFileSync(join(f.workspace, "later.txt"), "later local bytes\n");
      await git(f.workspace, "add", "later.txt");
      await git(f.workspace, "commit", "-m", "later local commit");
    },
  });
  assert.equal(d.ok, true);
  assert.equal(d.receipt.sha, d.commit.sha);
  assert.notEqual(await revParse(f.workspace, "HEAD"), d.receipt.sha);
  assert.equal(await lsRemoteSha(f.origin, targetRef), d.commit.sha);
  assert.deepEqual(
    readRevisionCoverage(d.observation.directory).map(({ sha }) => sha),
    [d.commit.sha],
  );
});

test("fresh reconciliation obtains renewed proof for the actual combination before registering its rewritten SHA", async (t) => {
  const f = await localFixture(t);
  const other = await advanceOriginFromAnotherWriter(f.origin);
  let validated;
  const d = await freshApi(f, {
    validate: async (candidate, context) => {
      validated = candidate;
      assert.equal(context.suffixBase, other);
      assert.equal(
        (await git(f.workspace, "show", `${candidate}:work.txt`)).stdout,
        "owned work\n",
      );
      assert.equal(
        (await git(f.workspace, "show", `${candidate}:other-writer.txt`))
          .stdout,
        "their work\n",
      );
      return { ok: true };
    },
  });
  assert.equal(d.ok, true);
  assert.equal(d.receipt.sha, validated);
  assert.notEqual(d.commit.sha, validated);
  assert.equal(d.recovery.candidateSha, validated);
  assert.equal(d.recovery.suffixBase, other);
  assert.equal(await lsRemoteSha(f.origin, targetRef), validated);
  assert.deepEqual(
    readRevisionCoverage(d.observation.directory).map(({ sha }) => sha),
    [validated],
  );
});

test("thrown renewed validation retains the rewritten candidate/base without publishing it", async (t) => {
  const f = await localFixture(t);
  const other = await advanceOriginFromAnotherWriter(f.origin);
  const d = await freshApi(f, {
    validate: () => {
      throw new Error("proof interrupted");
    },
  });
  assert.equal(d.status, "validation-failed");
  assert.equal(d.publication, "stopped");
  assert.deepEqual(d.validation, {
    interrupted: true,
    error: "proof interrupted",
  });
  assert.notEqual(d.commit.sha, d.recovery.candidateSha);
  assert.equal(d.recovery.candidateSha, await revParse(f.workspace, "HEAD"));
  assert.equal(d.recovery.suffixBase, other);
  assert.equal(await lsRemoteSha(f.origin, targetRef), other);
});
