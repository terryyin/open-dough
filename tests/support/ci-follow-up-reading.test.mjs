import test from "node:test";
import assert from "node:assert/strict";
import { makeMe } from "./makeMe.mjs";
import { repeatLedgerFacts } from "./ciFollowUpLedgerFacts.mjs";
import { retainedFollowUpOf } from "../../dashboard/server/ciFollowUpReading.ts";
import {
  exactAttemptUrl,
  observedAttemptUrl,
} from "../../dashboard/src/ciRunAttemptUrl.ts";
import { ciFollowUpReadingSchema } from "../../dashboard/src/ciFollowUpReading.ts";

for (const verdict of ["failure", "cancelled", null]) {
  test(`retained ${verdict} keeps the observed bounds and identity without comparable success`, () => {
    const facts = repeatLedgerFacts();
    const request = makeMe.aCiRepeatRequest
      .with({
        ...facts.request,
        outcome: {
          kind: "unverified",
          explanation: "Timing is unverified",
          observed: {
            runId: 71,
            runAttempt: 2,
            revision: facts.landing.revision,
            workflowId: 7,
            status: "completed",
            conclusion: verdict,
            runUrl: "https://github.com/example/project/actions/runs/71",
            startedAt: "2026-11-10T01:00:00Z",
            completedAt: "2026-11-10T01:01:40Z",
          },
        },
      })
      .please();
    const reading = retainedFollowUpOf(
      makeMe.aCiFollowUpEntry
        .with({
          project: "project",
          identity: "SEED-X#story",
          revision: facts.landing.revision,
          at: "2026-11-10T00:02:30Z",
          target: "refs/heads/main",
          eligible: true,
          receipts: [facts.landing.receipt],
          request,
        })
        .please(),
    );
    assert.equal(ciFollowUpReadingSchema.safeParse(reading).success, true);
    assert.equal(reading.at, "2026-11-10T00:02:30Z");
    assert.equal(reading.repeat.ms, 100000);
    assert.equal(reading.repeat.comparableMs, undefined);
    assert.equal(reading.repeat.workflowId, 7);
    assert.equal(reading.repeat.verdict, verdict ?? "unverified");
    assert.equal(
      reading.repeat.runUrl,
      "https://github.com/example/project/actions/runs/71/attempts/2",
    );
    assert.equal(reading.kind, "unverified");
  });
}

test("attempt links never execute unsafe URLs or misidentify another run or attempt", () => {
  for (const url of [
    "javascript:alert(1)",
    "https://evil.invalid/example/project/actions/runs/71",
    "https://github.com/example/project/actions/runs/72",
    "https://github.com/example/project/actions/runs/71/attempts/3",
    "http://github.com/example/project/actions/runs/71",
  ])
    assert.equal(exactAttemptUrl("example/project", 71, 2, url), undefined);
  assert.equal(
    exactAttemptUrl(
      "example/project",
      71,
      2,
      "https://github.com/example/project/actions/runs/71",
    ),
    "https://github.com/example/project/actions/runs/71/attempts/2",
  );
});

test("ordinary observed-attempt links share exact GitHub identity and preserve other providers", () => {
  const original = repeatLedgerFacts().request.original;
  assert.equal(
    observedAttemptUrl({
      ...original,
      runUrl: "https://github.com/example/project/actions/runs/71",
    }),
    "https://github.com/example/project/actions/runs/71/attempts/1",
  );
  assert.equal(
    observedAttemptUrl({ ...original, runUrl: "https://ci.invalid/runs/71" }),
    "https://ci.invalid/runs/71",
  );
  assert.equal(
    observedAttemptUrl({ ...original, runUrl: "ci-provider://observed/71" }),
    "ci-provider://observed/71",
  );
  assert.equal(
    observedAttemptUrl({
      ...original,
      adapterAttempt: { runId: "opaque", attemptId: "chosen" },
      runUrl: "https://github.com/example/project/actions/runs/71",
    }),
    "https://github.com/example/project/actions/runs/71",
  );
  assert.equal(
    observedAttemptUrl({
      runId: "opaque",
      attemptId: "chosen",
      branch: "main",
      revision: original.revision,
      runUrl: "https://github.com/example/project/actions/runs/71",
    }),
    "https://github.com/example/project/actions/runs/71",
  );
  assert.equal(
    observedAttemptUrl({
      ...original,
      runUrl: "https://github.com/example/project/actions/runs/72",
    }),
    undefined,
  );
});

for (const retained of ["repeat", "observed"]) {
  test(`custom ${retained} keeps listed original and repeat links and leaves absent links absent`, () => {
    const facts = repeatLedgerFacts();
    for (const listed of [true, false]) {
      const original = makeMe.aKeptBuild
        .with({
          revision: facts.landing.revision,
          state: "pass",
          adapterAttempt: { runId: "pipeline/original", attemptId: "original" },
          ...(listed ? { runUrl: "https://ci.invalid/original" } : {}),
        })
        .please();
      const repeat = makeMe.aKeptBuild
        .with({
          revision: facts.landing.revision,
          state: "pass",
          adapterAttempt: { runId: "pipeline/repeat", attemptId: "repeat" },
          ...(listed ? { runUrl: "https://ci.invalid/repeat" } : {}),
        })
        .please();
      const request = makeMe.aCiRepeatRequest
        .with({
          provider: "adapter",
          repository: "example/project",
          branch: "main",
          check: "all-checks",
          context: "push",
          original,
          reference: facts.request.reference,
          rule: facts.request.rule,
          requestedAt: facts.request.requestedAt,
          submission: { kind: "accepted" },
          outcome: {
            kind: "unverified",
            explanation: "Timing is unverified",
            [retained]: repeat,
          },
        })
        .please();
      const reading = retainedFollowUpOf(
        makeMe.aCiFollowUpEntry
          .with({
            project: "project",
            identity: "SEED-X#story",
            revision: facts.landing.revision,
            at: "2026-11-10T00:02:30Z",
            target: "refs/heads/main",
            eligible: true,
            receipts: [facts.landing.receipt],
            request,
          })
          .please(),
      );
      assert.equal(ciFollowUpReadingSchema.safeParse(reading).success, true);
      assert.equal(
        reading.original.runUrl,
        listed ? "https://ci.invalid/original" : undefined,
      );
      assert.equal(
        reading.repeat.runUrl,
        listed ? "https://ci.invalid/repeat" : undefined,
      );
      assert.deepEqual(reading.repeat.adapterAttempt, {
        runId: "pipeline/repeat",
        attemptId: "repeat",
      });
      assert.equal(reading.workflow, undefined);
    }
  });
}
