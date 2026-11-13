// Only the exact accepted full comparable attempt can provide a verdict.
import {
  expect,
  queuedClaudeBoundaryTest as test,
} from "../../tests/support/landedCiHistoryTest.ts";
import { prepareAdapterRepeatScenario } from "../../tests/support/ciFollowUpAdapterScenario.ts";
import { followUpCards } from "../../tests/support/ciFollowUpScenario.ts";
import {
  ingest,
  retained,
  requestOf,
  type Scenario,
} from "../../tests/support/ciFollowUpAdapterAssertions.ts";
import type { CiProofEntry } from "../../src/ciProof.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test.use({ serverMode: "boundary" });
const proofFor = (attempt: Scenario["accepted"], entries: CiProofEntry[]) => ({
  summary: makeMe.aCiProofSummary
    .inRepository("terryyin/open-dough")
    .ofAdapterAttempt({
      attemptId: String(attempt.attemptId),
      revision: attempt.sha,
    })
    .withEntries(...entries)
    .please(),
});

const mismatches: readonly [
  string,
  Parameters<Scenario["setRepeat"]>[1],
  string,
][] = [
  [
    "another revision",
    { sha: "f".repeat(40) },
    "does not match the original check, context or revision",
  ],
  [
    "another check",
    { check: "unit-only" },
    "does not match the original check, context or revision",
  ],
  [
    "another context",
    { context: "pull-request" },
    "does not match the original check, context or revision",
  ],
  [
    "unaccepted identity",
    { attemptId: "attempt:unrelated" },
    "accepted repeat attempt has not been observed",
  ],
  ["failed repeat", { outcome: "failure" }, "observed repeat failed (failure)"],
  [
    "cancelled repeat",
    { outcome: "incomplete" },
    "observed repeat was cancelled",
  ],
  [
    "missing start",
    { without: ["startedAt"] },
    "missing or inconsistent attempt timing bounds",
  ],
  [
    "missing completion",
    { without: ["completedAt"] },
    "missing or inconsistent attempt timing bounds",
  ],
  [
    "invalid start",
    { startedAt: "invalid" },
    "missing or inconsistent attempt timing bounds",
  ],
  [
    "invalid completion",
    { completedAt: "invalid" },
    "missing or inconsistent attempt timing bounds",
  ],
  [
    "reversed bounds",
    { completedAt: "2026-11-10T06:59:59Z" },
    "missing or inconsistent attempt timing bounds",
  ],
  [
    "starts before original ends",
    { startedAt: "2026-11-10T06:01:44Z" },
    "missing or inconsistent attempt timing bounds",
  ],
  [
    "starts when original ends",
    { startedAt: "2026-11-10T06:01:45Z" },
    "missing or inconsistent attempt timing bounds",
  ],
];
for (const [condition, changes, explanation] of mismatches) {
  test(`${condition} remains unverified with no verdict or resend after restart`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareAdapterRepeatScenario(origin, github);
    const server = await ingest(scenario, startServer);
    scenario.setRepeat(106, changes);
    await retained(scenario, server, startServer, explanation);
  });
}

for (const condition of ["partial proof", "omitted original entry"] as const) {
  test(`${condition} is not comparable even when remaining proof is complete`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareAdapterRepeatScenario(origin, github);
    const tests = makeMe.aCiProofEntry
      .at("tests")
      .counting(3, "case")
      .inParts(1)
      .please();
    const integration = makeMe.aCiProofEntry
      .at("integration")
      .counting(2, "case")
      .inParts(1)
      .please();
    scenario.setProof(
      scenario.original.attemptId,
      proofFor(scenario.original, [tests, integration]),
    );
    const server = await ingest(scenario, startServer);
    const entries =
      condition === "partial proof"
        ? [
            makeMe.aCiProofEntry
              .at("tests")
              .counting(3, "case")
              .inParts(2, { missing: [2] })
              .please(),
            integration,
          ]
        : [tests];
    scenario.setProof(
      scenario.accepted.attemptId,
      proofFor(scenario.accepted, entries),
    );
    scenario.setRepeat(106);
    await retained(
      scenario,
      server,
      startServer,
      "Repeat measurement or comparable CI proof is incomplete",
    );
  });
}

test("text1 is not distinct from numeric1 when the original disappears from discovery", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareAdapterRepeatScenario(origin, github, {
    originalAttemptId: 1,
    repeatIdentity: { runId: "pipeline/repeat", attemptId: "1" },
  });
  scenario.holdRebuild();
  const server = await ingest(scenario, startServer);
  expect(scenario.adapter.rebuildRequests()[0]).toMatchObject({
    attempt: { attemptId: 1 },
  });
  scenario.omitOriginal();
  scenario.setRepeat(106);
  scenario.releaseRebuild();
  await retained(
    scenario,
    server,
    startServer,
    "does not identify a distinct repeat",
    true,
  );
  expect(requestOf(server)?.submission.attempt?.attemptId).toBe("1");
});

test("a distinct attempt under the same run with extra complete proof remains comparable", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareAdapterRepeatScenario(origin, github, {
    repeatIdentity: { runId: "pipeline/original", attemptId: "attempt:repeat" },
  });
  const server = await ingest(scenario, startServer);
  scenario.setProof(
    scenario.accepted.attemptId,
    proofFor(scenario.accepted, [
      makeMe.aCiProofEntry.at("tests").counting(3, "case").inParts(1).please(),
      makeMe.aCiProofEntry
        .at("integration")
        .counting(2, "case")
        .inParts(1)
        .please(),
    ]),
  );
  scenario.setRepeat(98);
  await expect
    .poll(() => followUpCards(server))
    .toMatchObject([{ kind: "recovered", repeatMs: 98000 }]);
  await server.close();
  await scenario.collectFollowUps(server);
  const restarted = await startServer();
  await expect
    .poll(() => followUpCards(restarted))
    .toMatchObject([{ kind: "recovered", repeatMs: 98000 }]);
  expect(scenario.adapter.rebuildRequests()).toHaveLength(1);
});
