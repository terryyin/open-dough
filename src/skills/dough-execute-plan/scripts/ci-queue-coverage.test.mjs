import assert from "node:assert/strict";
import { test } from "node:test";
import {
  freshPendingRevision,
  pendingFreshnessMs,
} from "./ci-mailbox-revision-records.mjs";
import {
  commandAttempt as attempt,
  createRevisionCoverageFixture,
  descendantRevision,
  queueEntry,
  queuePolicy as policy,
  revisionCoverage as coverage,
} from "./ci-revision-coverage-test-fixtures.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { recordedVerdict } from "./ci-mailbox-await.mjs";
import {
  customCiBranch as branch,
  git,
} from "./ci-revision-coverage-test-fixtures.mjs";

test("authoritative exact queue progresses queued → running → real attempt without inventing a verdict", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  for (const state of ["queued", "running", "retrying"]) {
    clock += 100;
    h.setSnapshot({
      attempts: [],
      queue: [queueEntry(a, state, { observedAt: 1e15 })],
    });
    await h.advancePoll();
    const r = coverage(h, a);
    assert.equal(r.state, "undiscovered");
    assert.deepEqual(r.queue, { sha: a, branch, state, observedAt: clock });
    assert.equal(r.checkedBy, undefined);
    assert.equal(recordedVerdict(h.directory, a), undefined);
    assert.equal(freshPendingRevision(r, clock).source, "queue");
  }
  h.setSnapshot({ attempts: [attempt(a, "pending")], queue: [] });
  await h.advancePoll();
  assert.equal(coverage(h, a).state, "pending");
  assert.equal(coverage(h, a).queue, undefined);
  assert.equal(freshPendingRevision(coverage(h, a), clock).source, "attempt");
  clock += 1;
  await h.advancePoll();
  assert.equal(
    coverage(h, a).observedAt,
    clock,
    "unchanged actual pending renews only on successful observation",
  );
  h.setSnapshot({ attempts: [attempt(a, "success")], queue: [] });
  await h.advancePoll();
  assert.equal(recordedVerdict(h.directory, a), "success");
  assert.equal(freshPendingRevision(coverage(h, a), clock), undefined);
  assert.deepEqual(h.mailbox.readMailboxEvents(h.directory), []);
});

test("a coalesced descendant queue needs matching declared target and locally proved ancestry", async (t) => {
  const h = await createRevisionCoverageFixture(t, {
    now: () => 1000,
    integratedPolicy: policy,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  const b = await descendantRevision(h);
  const valid = queueEntry(b, "queued", policy);
  for (const bad of [
    { ...valid, branch: "foreign" },
    { ...valid, check: "other" },
    { ...valid, context: "pull_request" },
    queueEntry(b),
    queueEntry("e".repeat(40), "running", policy),
  ]) {
    h.setSnapshot({ attempts: [], queue: [bad] });
    await h.advancePoll();
    assert.equal(coverage(h, a).queue, undefined, JSON.stringify(bad));
  }
  h.setSnapshot({ attempts: [], queue: [valid] });
  await h.advancePoll();
  assert.deepEqual(coverage(h, a).queue, {
    ...valid,
    observedAt: 1000,
    ancestry: {
      ancestor: a,
      descendant: b,
      basis: "git merge-base --is-ancestor",
    },
  });
  assert.equal(coverage(h, a).checkedBy, undefined);
  assert.equal(recordedVerdict(h.directory, a), undefined);
  assert.equal(coverage(h, a).integrated.state, "unresolved");
  // A known local ancestor is not a queued descendant of accepted B.
  h.mailbox.registerPushedRevision(h.directory, b);
  h.setSnapshot({ attempts: [], queue: [queueEntry(a, "retrying", policy)] });
  await h.advancePoll();
  assert.equal(coverage(h, b).queue, undefined);
});

test("queue candidates never fetch missing descendant objects even from a usable remote", async (t) => {
  const h = await createRevisionCoverageFixture(t, {
    now: () => 1000,
    integratedPolicy: policy,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  const writer = join(h.fixture, "writer");
  await git(h.fixture, "clone", "--branch", branch, h.remote, writer);
  await git(writer, "config", "user.name", "Queue Fixture");
  await git(writer, "config", "user.email", "queue@example.test");
  writeFileSync(join(writer, "application.txt"), "remote B\n");
  await git(writer, "commit", "-am", "remote descendant");
  const b = (await git(writer, "rev-parse", "HEAD")).stdout.trim();
  await git(writer, "push", "origin", branch);
  h.setSnapshot({ attempts: [], queue: [queueEntry(b, "queued", policy)] });
  await h.advancePoll();
  assert.equal(coverage(h, a).queue, undefined);
  await assert.rejects(git(h.project, "cat-file", "-e", b));
});

test("empty, unsupported and failed discovery withdraw pending queue facts without an integrated policy", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  for (const replacement of [
    { attempts: [], queue: [] },
    { attempts: [] },
    { attempts: [], queue: [queueEntry("d".repeat(40))] },
    { attempts: [], queue: [queueEntry(a, "queued", { branch: "foreign" })] },
    "not JSON",
    { attempts: [], queue: [queueEntry(a, "invalid")] },
  ]) {
    h.setSnapshot({ attempts: [], queue: [queueEntry(a)] });
    await h.advancePoll();
    const queued = coverage(h, a);
    assert.ok(freshPendingRevision(queued, clock + pendingFreshnessMs));
    assert.equal(
      freshPendingRevision(queued, clock + pendingFreshnessMs + 1),
      undefined,
    );
    assert.equal(freshPendingRevision(queued, clock - 1), undefined);
    h.setSnapshot(replacement);
    await h.advancePoll();
    assert.equal(coverage(h, a).queue, undefined);
    assert.equal(freshPendingRevision(coverage(h, a), clock), undefined);
    clock += 100;
  }
  const b = await descendantRevision(h);
  h.setSnapshot({ attempts: [], queue: [queueEntry(b, "queued", policy)] });
  await h.advancePoll();
  assert.equal(
    coverage(h, a).queue,
    undefined,
    "descendant queue has no authority without policy",
  );
});

test("containing pending attempts need fresh current policy-compatible facts and withdraw on the next poll", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
    integratedPolicy: policy,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  const b = await descendantRevision(h);
  const valid = attempt(b, "pending", policy);
  const other = (
    await git(h.project, "commit-tree", "HEAD^{tree}", "-m", "unrelated")
  ).stdout.trim();
  for (const replacement of [
    { attempts: [] },
    "not JSON",
    { attempts: [{ ...valid, branch: "foreign" }] },
    { attempts: [{ ...valid, branch: undefined }] },
    { attempts: [{ ...valid, check: "other" }] },
    { attempts: [{ ...valid, context: "pull_request" }] },
    { attempts: [{ ...valid, sha: other }] },
    { attempts: [{ ...valid, sha: "e".repeat(40) }] },
    {
      attempts: [
        {
          ...valid,
          outcome: "failure",
          attemptId: "new",
          time: "2026-10-25T01:00:00Z",
        },
        valid,
      ],
    },
    { attempts: [valid, { ...valid, attemptId: "ambiguous" }] },
    {
      attempts: [
        { ...valid, time: undefined },
        { ...valid, time: undefined, attemptId: "ambiguous" },
      ],
    },
  ]) {
    h.setSnapshot({ attempts: [valid] });
    await h.advancePoll();
    const pending = coverage(h, a);
    assert.equal(pending.state, "undiscovered");
    assert.equal(pending.integrated.state, "unresolved");
    assert.equal(freshPendingRevision(pending, clock).sha, b);
    assert.ok(freshPendingRevision(pending, clock + pendingFreshnessMs));
    assert.equal(
      freshPendingRevision(pending, clock + pendingFreshnessMs + 1),
      undefined,
    );
    assert.equal(freshPendingRevision(pending, clock - 1), undefined);
    assert.equal(recordedVerdict(h.directory, a), undefined);
    h.setSnapshot(replacement);
    await h.advancePoll();
    assert.equal(
      freshPendingRevision(coverage(h, a), clock),
      undefined,
      JSON.stringify(replacement),
    );
    assert.equal(recordedVerdict(h.directory, a), undefined);
    clock += 100;
  }
  h.setSnapshot({ attempts: [attempt(a, "failure"), valid] });
  await h.advancePoll();
  assert.equal(recordedVerdict(h.directory, a), "failure");
  assert.equal(freshPendingRevision(coverage(h, a), clock), undefined);
});

test("a containing pending attempt has no progress authority without an integrated policy", async (t) => {
  const h = await createRevisionCoverageFixture(t, { now: () => 1000 });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  const b = await descendantRevision(h);
  h.setSnapshot({ attempts: [attempt(b, "pending", policy)] });
  await h.advancePoll();
  assert.equal(freshPendingRevision(coverage(h, a), 1000), undefined);
  assert.equal(recordedVerdict(h.directory, a), undefined);
});
