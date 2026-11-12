// Full product admission and outcome loop, through real receipt ingestion.
// Receipt acceptance precedes collection; observe the actual rerun POST.
// What provider facts decide after an accepted request is read from saved
// accepted requests, which real collection observes with no journey.
import { historyWallTimeMs } from "../../src/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  saveRepeatRequests,
  savedRepeatRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
  readFollowUpLedger,
} from "../../tests/support/ciFollowUpScenario.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { postLanding } from "../../tests/support/startSessionLandingCapture.ts";

test.use({ serverMode: "boundary" });

test("new Done receipt at exactly105 seconds gets one full POST after sufficient prior collection, then106 seconds shows possible slowdown", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github);
  const first = await startServer();
  expect((await followUpSettings(first)).body.enabled).toBe(false);
  expect((await followUpSettings(first, true)).status).toBe(200);
  let release!: () => void;
  const reply = new Promise<void>((resolve) => {
    release = resolve;
  });
  let began!: () => void;
  const submitted = new Promise<void>((resolve) => {
    began = resolve;
  });
  scenario.holdSubmission(async () => {
    expect(
      Object.values(readFollowUpLedger(first).landings).find(
        (landing) => landing.request,
      )?.request?.submission.kind,
    ).toBe("intent");
    began();
    await reply;
  });
  const second = await startServer();
  const submission = await scenario.ingest(first);
  await submitted;
  expect(scenario.repeatCalls).toEqual([71]);
  expect(
    Object.values(readFollowUpLedger(first).landings).find(
      (landing) => landing.request,
    )?.request?.original.runId,
  ).toBe(71);
  expect((await postLanding(first, submission, false)).status).toBe(200);
  release();
  await expect
    .poll(
      () =>
        Object.values(readFollowUpLedger(first).landings).find(
          (landing) => landing.request,
        )?.request?.submission.kind,
    )
    .toBe("accepted");
  scenario.setRepeat({ status: "in_progress" });
  await expect
    .poll(() => followUpSettings(second))
    .toMatchObject({
      body: {
        cards: [{ kind: "progress", explanation: "CI rerun in progress" }],
      },
    });
  scenario.setRepeat({ seconds: 106 });
  await expect
    .poll(() => followUpSettings(first))
    .toMatchObject({
      body: {
        cards: [
          {
            kind: "slow",
            explanation: "Possible CI slowdown",
            originalMs: 105000,
            repeatMs: 106000,
            averageMs: 100000,
          },
        ],
      },
    });
  expect(scenario.repeatCalls).toEqual([71]);
  expect(await landedCiHistory(first)).toMatchObject({
    body: { reference: { selected: { key: "run/71/1", ms: 105000 } } },
  });
  await first.close();
  await second.close();
  const restarted = await startServer();
  expect((await followUpSettings(restarted)).body.cards[0]?.kind).toBe("slow");
  expect(scenario.repeatCalls).toEqual([71]);
});

for (const [outcome, expected] of [
  ["refused", "refused"],
  ["uncertain", "uncertain"],
] as const) {
  test(`collected repeat ${outcome} retains the original and its particular honest outcome`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareRepeatScenario(origin, github, 120);
    const submitted = new Promise<void>((resolve) => {
      scenario.holdSubmission(() => {
        resolve();
        return Promise.resolve();
      });
    });
    if (outcome === "refused") scenario.refuse(403);
    if (outcome === "uncertain") scenario.refuse(503);
    const server = await startServer();
    await followUpSettings(server, true);
    await scenario.ingest(server);
    await submitted;
    expect(scenario.repeatCalls).toEqual([71]);
    if (outcome === "uncertain") scenario.setRepeat({ seconds: 104 });
    await expect
      .poll(
        async () => (await followUpSettings(server)).body.cards[0]?.explanation,
      )
      .toContain(expected);
    if (outcome === "uncertain")
      await expect
        .poll(() => followUpSettings(server))
        .toMatchObject({
          body: { cards: [{ repeatMs: 104000, kind: "unverified" }] },
        });
    const card = (await followUpSettings(server)).body.cards[0];
    expect(card).toMatchObject({
      originalMs: 120000,
      averageMs: 100000,
      kind: "unverified",
    });
    expect(scenario.repeatCalls).toEqual([71]);
    await followUpSettings(server, false);
    expect((await followUpSettings(server)).body.cards[0]?.originalMs).toBe(
      120000,
    );
  });
}

test("saved accepted requests read the outcome their provider repeat decides beside the original and average", async ({
  origin,
  github,
  startServer,
}) => {
  const accepted = {
    seconds: 120,
    averageSeconds: 100,
    submission: { kind: "accepted" },
  } as const;
  const unverified = (naming: string) => ({
    kind: "unverified",
    explanation: expect.stringContaining(naming),
  });
  const repeats = [
    {
      run: 71,
      repeat: { seconds: 104 },
      reads: "recovered",
      outcome: {
        kind: "recovered",
        explanation: "CI timing returned to range",
      },
    },
    {
      run: 72,
      repeat: { conclusion: "failure" },
      reads: "failed",
      outcome: unverified("failed"),
    },
    {
      run: 73,
      repeat: { conclusion: "cancelled" },
      reads: "cancelled",
      outcome: unverified("cancelled"),
    },
    {
      run: 74,
      repeat: { full: false },
      reads: "partial proof",
      outcome: unverified("Full comparable repeat is unverified"),
    },
  ] as const;
  const provider = saveRepeatRequests(
    origin,
    github,
    repeats.map(({ run }) => ({ run, ...accepted })),
  );
  for (const { run, repeat } of repeats) provider(run).setRepeat(repeat);
  const server = await startServer();
  // One expectation per outcome, in the order the ledger holds the requests.
  for (const { run, reads, outcome } of repeats)
    await expect
      .poll(() => savedRepeatRequest(server, run)?.outcome, reads)
      .toMatchObject(outcome);
  for (const { run } of repeats) {
    const request = savedRepeatRequest(server, run);
    expect(request).toMatchObject({
      original: { runId: run, runAttempt: 1 },
      reference: { averageMs: 100000 },
    });
    expect(
      historyWallTimeMs(
        request?.original.startedAt,
        request?.original.completedAt,
      ),
    ).toBe(120000);
  }
  expect(
    github.calls.filter(
      ({ request }) => request.kind === "actions-workflow-rerun",
    ),
  ).toEqual([]);
});
