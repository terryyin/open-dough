import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  installCustomReuseProvider,
  publishCustomTarget,
} from "./ci-reuse-custom-test-fixtures.mjs";
import {
  completeTarget,
  ignoreInstalledSkills,
} from "./ci-reuse-journey-test-fixtures.mjs";
import { retireWorktree } from "../../dough-land/scripts/worktree-retirement.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import "./ci-reuse-custom-current-target-case.mjs";

for (const [mode, platform] of [
  ["story", ".agents"],
  ["trunk", ".claude"],
]) {
  for (const scenario of [
    "hit",
    "missing",
    "contradictory",
    "target failure",
    "legacy",
  ]) {
    test(`custom ${mode} ${scenario}: accepted SHA, real commands, installed adapter and completion/resource gate`, async (t) => {
      const fixture = await createManagedFixture({ platforms: [platform] });
      t.after(fixture.cleanup);
      await ignoreInstalledSkills(fixture);
      const provider = await installCustomReuseProvider(fixture);
      const sha = fixture.candidateSha;
      const source =
        scenario === "missing"
          ? undefined
          : await provider.direct(sha, { noPolicy: scenario === "legacy" });
      if (scenario === "contradictory")
        provider.editJournal((journal) =>
          journal.entries.push({
            ...journal.entries[0],
            fact: { ...journal.entries[0].fact, outcome: "failure" },
          }),
        );
      const publication = await publishCustomTarget(fixture, mode);
      assert.equal(publication.receipt.sha, sha);
      assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/main"), sha);
      const target = await provider.target(sha, {
        targetFailed: scenario === "target failure",
        noPolicy: scenario === "legacy",
      });
      const hit = ["hit", "target failure"].includes(scenario);
      assert.equal(target.decision.reuse, hit);
      assert.equal(
        provider.count(sha),
        hit || scenario === "missing" ? 1 : 2,
        "covered command execution count at the actual accepted SHA",
      );
      assert.equal(provider.count(sha, "target-only"), 1);
      assert.notEqual(target.attempt.runId, source?.runId);
      const report = JSON.parse(
        readFileSync(new URL(target.attempt.url), "utf8"),
      );
      assert.equal(report.target.runId, target.attempt.runId);
      assert.equal(report.target.sha, sha);
      assert.equal(report.decision.reason, target.decision.reason);
      if (hit) {
        assert.equal(report.decision.source.runId, source.runId);
        assert.equal(report.decision.source.attemptId, source.attemptId);
        assert.equal(report.decision.source.ref, "exec/story");
        assert.equal(report.decision.source.context, provider.policy.context);
        assert.equal(report.decision.source.url, source.url);
      }
      if (scenario === "contradictory")
        assert.equal(target.decision.reason, "contradictory-attempts");
      if (scenario === "legacy")
        assert.equal(target.decision.reason, "invalid-policy");
      const completion = await completeTarget(
        fixture,
        publication.directory,
        target,
      );
      const failed = scenario === "target failure";
      assert.equal(completion.verdict, failed ? "failure" : "success");
      assert.equal(
        completion.shutdown.status,
        failed ? "retained" : "confirmed",
      );
      assert.equal(
        checkMailboxWorkerLiveness(
          readWorkerIdentity(publication.directory),
          publication.directory,
        ),
        failed ? "alive" : "dead",
      );
      const retirement = await retireWorktree({
        repository: fixture.integration,
        worktree: fixture.execution,
        branch: "exec/story",
        createdForWork: true,
        contained: [sha],
        holdReason: () =>
          completion.verdict === "success" &&
          completion.shutdown.status === "confirmed"
            ? null
            : "completion unresolved",
      });
      assert.equal(retirement.worktree, failed ? "preserved" : "removed");
      assert.equal(retirement.branch, failed ? "preserved" : "removed");
      assert.equal(existsSync(fixture.execution), failed);
    });
  }
}
