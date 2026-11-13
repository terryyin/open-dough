// Settled ledger facts compose with the real receipt/trigger backend proof.
import { expect, test } from "../support/preparationPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { keepFollowUpEntries } from "../support/ciFollowUpScenario.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import {
  ciFollowUpCard,
  openCiFollowUp,
  retainedCiFollowUpReading,
} from "../support/ciFollowUpReadingPage.ts";

test("both settled custom outcomes review exact attempts against the saved 100s average", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  publishIntentTrunk(origin.project);
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { interleaved: false },
  );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: story.completion,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const proofEntry = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .counting(1000, 0, 0)
        .inParts(1)
        .please(),
    )
    .please();
  const original = makeMe.aKeptBuild
    .with({
      revision: story.completion,
      state: "pass",
      adapterAttempt: {
        runId: "pipeline/original",
        attemptId: "attempt:original",
      },
      runUrl: "https://ci.invalid/original",
      startedAt: "2026-11-10T06:00:00Z",
      completedAt: "2026-11-10T06:01:45Z",
      proof: makeMe.aCiProof
        .forAdapter({
          revision: story.completion,
          attemptId: "attempt:original",
        })
        .entries([proofEntry])
        .please(),
    })
    .please();
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({
        identity: queuedIdentity,
        title: "Story A",
      })
      .launchedAt(new Date().toISOString())
      .landedAt(story.completion, {
        receipt: "cccccccc-0000-4000-8000-000000000001",
      })
      .please(),
  ]);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  for (const [kind, explanation, completion, wallTime, difference] of [
    [
      "slow",
      "Possible CI slowdown",
      "2026-11-10T07:01:46.000Z",
      "1 min 46 s",
      "+6.0 s (+6%)",
    ],
    [
      "recovered",
      "CI timing returned to range",
      "2026-11-10T07:01:38.000Z",
      "1 min 38 s",
      "−2.0 s (−2%)",
    ],
  ] as const) {
    const repeat = makeMe.aKeptBuild
      .with({
        revision: story.completion,
        state: "pass",
        adapterAttempt: {
          runId: "pipeline/repeat",
          attemptId: "attempt:repeat",
        },
        runUrl: "https://ci.invalid/repeat",
        startedAt: "2026-11-10T07:00:00Z",
        completedAt: completion,
        proof: makeMe.aCiProof
          .forAdapter({
            revision: story.completion,
            attemptId: "attempt:repeat",
          })
          .entries([proofEntry])
          .please(),
      })
      .please();
    await keepFollowUpEntries(dashboard, [
      makeMe.aCiFollowUpEntry
        .with({
          project: "open-dough",
          revision: story.completion,
          target: "refs/heads/main",
          identity: queuedIdentity,
          eligible: true,
          receipts: ["cccccccc-0000-4000-8000-000000000001"],
          request: makeMe.aCiRepeatRequest
            .with({
              provider: "adapter",
              repository: "terryyin/open-dough",
              branch: "main",
              check: "all-checks",
              context: "push",
              original,
              reference: {
                endpoint: story.completion,
                sampleCount: 5,
                averageMs: 100000,
                selected: {
                  key: buildKeyOf(original),
                  date: original.startedAt,
                  ms: 105000,
                },
                evidence: [],
              },
              rule: {
                percent: 5,
                provisional: true,
                timingBasis: "attempt-start",
              },
              requestedAt: "2026-11-10T06:02:00Z",
              submission: {
                kind: "accepted",
                attempt: {
                  runId: "pipeline/repeat",
                  attemptId: "attempt:repeat",
                  sha: story.completion,
                },
              },
              outcome: { kind, explanation, settled: true, repeat },
            })
            .please(),
        })
        .please(),
    ]);
    await page.goto(dashboard.baseURL);
    const card = ciFollowUpCard(page, "Story A");
    await expect(card).toContainText(explanation);
    await expect(card).toContainText("Done");
    await openCiFollowUp(card, "pointer");
    const {
      intent,
      comparison,
      original: first,
      repeat: second,
    } = retainedCiFollowUpReading(page);
    await expect(intent).toHaveAttribute("data-selected-story", queuedIdentity);
    await expect(comparison).toContainText(explanation);
    await expect(comparison).not.toContainText("Workflow");
    await expect(comparison).not.toContainText("GitHub");
    for (const attempt of [first, second]) {
      await expect(attempt).toContainText(story.completion);
      await expect(attempt).toContainText("Check all-checks · Context push");
      await expect(attempt).toContainText(
        "Proof completeness: Complete comparable proof",
      );
    }
    await expect(first).toContainText("Run pipeline/original");
    await expect(first).toContainText("Attempt attempt:original");
    await expect(first).toContainText(
      "Attempt start: 2026-11-10T06:00:00Z · Completion: 2026-11-10T06:01:45Z",
    );
    await expect(first).toContainText("Attempt wall time: 1 min 45 s");
    await expect(first).toContainText(
      "Difference from saved average: +5.0 s (+5%)",
    );
    await expect(second).toContainText("Run pipeline/repeat");
    await expect(second).toContainText("Attempt attempt:repeat");
    await expect(second).toContainText(
      `Attempt start: 2026-11-10T07:00:00Z · Completion: ${completion}`,
    );
    await expect(second).toContainText(`Attempt wall time: ${wallTime}`);
    await expect(second).toContainText(
      `Difference from saved average: ${difference}`,
    );
    await expect(
      attemptLink(first, "Attempt attempt:original"),
    ).toHaveAttribute("href", "https://ci.invalid/original");
    await expect(attemptLink(second, "Attempt attempt:repeat")).toHaveAttribute(
      "href",
      "https://ci.invalid/repeat",
    );
    await expect(comparison).toContainText("5 prior builds used");
    await expect(comparison).toContainText("1 min 40 s");
    await page.reload();
    await expect(comparison).toContainText(explanation);
    expect(ciCalls()).toHaveLength(before);
  }
});
