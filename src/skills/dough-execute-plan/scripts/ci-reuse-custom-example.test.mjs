import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  customAdapterResponse,
  scheduleCustomAttempt,
} from "./ci-reuse-custom-example.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { installCustomReuseProvider } from "./ci-reuse-custom-test-fixtures.mjs";
import { createCommandAcquisition } from "./ci-command-adapter.mjs";

test("provider publishes pending current facts before execution and direct proof only after the command exit", (t) => {
  const root = mkdtempSync(join(tmpdir(), "custom-pending-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const state = join(root, "journal.json");
  const observed = join(root, "observed");
  const job = {
    repo: "owner/project",
    workflow: "checks",
    ref: "trusted",
    event: "push",
    sha: "a".repeat(40),
    runId: "opaque:z",
    attemptId: "try:not-a-number",
    covered: [
      process.execPath,
      "-e",
      `const assert=require('node:assert/strict');const fs=require('node:fs');const j=require(${JSON.stringify(state)});assert.equal(j.entries[0].attempt.outcome,'pending');assert.equal(j.entries[0].fact.direct,false);assert.equal(j.entries[0].fact.order,1);fs.writeFileSync(${JSON.stringify(observed)},'pending observed');process.exit(1);`,
    ],
  };
  const result = scheduleCustomAttempt("source", state, job);
  assert.equal(result.attempt.outcome, "failure");
  assert.equal(readFileSync(observed, "utf8"), "pending observed");
  const fact = JSON.parse(readFileSync(state, "utf8")).entries[0].fact;
  assert.equal(fact.direct, false);
  assert.equal(fact.outcome, "failure");
});

test("provider ordering ignores opaque IDs, changed context validates fresh, and adapter filters repo/branch", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const provider = await installCustomReuseProvider(fixture);
  await provider.direct(fixture.candidateSha, { runId: "run/z:999" });
  const latest = await provider.direct(fixture.candidateSha, {
    runId: "run/a:001",
    ref: "main",
  });
  assert.equal(
    customAdapterResponse(provider.state, {
      operation: "discover",
      check: { repo: "owner/project", branch: "main" },
    }).attempts.length,
    0,
    "same-ref source-only success cannot cover target-only obligations",
  );
  const hit = await provider.target(fixture.candidateSha);
  assert.equal(hit.decision.reuse, true);
  assert.equal(hit.decision.source.runId, latest.runId);
  assert.equal(provider.count(fixture.candidateSha), 2);
  const source = customAdapterResponse(provider.state, {
    operation: "discover",
    check: { repo: "owner/project", branch: "exec/story" },
  });
  assert.equal(
    source.attempts.length,
    0,
    "adapter exposes target aggregates, not source-only records",
  );
  const acquisition = createCommandAcquisition({
    command: provider.command,
    repo: "owner/project",
    branch: "main",
    root: fixture.execution,
  });
  const runs = await acquisition.acquireRuns();
  assert.equal(runs.length, 1);
  assert.equal(runs[0].databaseId, hit.attempt.runId);
  assert.equal(
    customAdapterResponse(provider.state, {
      operation: "discover",
      check: { repo: "other/repo", branch: "main" },
    }).attempts.length,
    0,
  );
  await provider.direct(fixture.candidateSha, { runId: "context:old-inputs" });
  provider.policy.context = "changed-external-inputs";
  const changed = await provider.target(fixture.candidateSha);
  assert.equal(changed.decision.reason, "context-mismatch");
  assert.equal(provider.count(fixture.candidateSha), 4);
  provider.editJournal((journal) => {
    Object.assign(journal.entries.at(-1).fact, { validUntil: 0 });
  });
  const expired = await provider.target(fixture.candidateSha);
  assert.equal(expired.decision.reason, "expired-or-unknown-validity");
  assert.equal(provider.count(fixture.candidateSha), 5);
  writeFileSync(provider.state, "unreadable provider journal");
  const unreadable = await provider.target(fixture.candidateSha);
  assert.equal(unreadable.decision.reason, "incomplete-query");
  assert.equal(provider.count(fixture.candidateSha), 6);
});

test("unknown currentness and malformed provider facts cannot hide behind an older source success", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const provider = await installCustomReuseProvider(fixture);
  await provider.direct(fixture.candidateSha);
  provider.editJournal((journal) => {
    const newer = structuredClone(journal.entries[0]);
    newer.attempt.runId = "newer:opaque";
    newer.fact.runId = newer.attempt.runId;
    newer.fact.order += 1;
    delete newer.fact.current;
    journal.entries.push(newer);
  });
  const unknown = await provider.target(fixture.candidateSha);
  assert.equal(unknown.decision.reason, "unknown-current-attempt");
  assert.equal(provider.count(fixture.candidateSha), 2);
  provider.editJournal((journal) =>
    journal.entries.push({
      repo: provider.policy.repo,
      workflow: provider.policy.workflow,
    }),
  );
  const malformed = await provider.target(fixture.candidateSha);
  assert.equal(malformed.decision.reason, "incomplete-query");
  assert.equal(provider.count(fixture.candidateSha), 3);
});
