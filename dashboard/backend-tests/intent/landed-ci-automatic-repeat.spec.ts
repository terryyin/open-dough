// Full product admission and outcome loop, through real receipt ingestion.
// Receipt acceptance precedes collection; observe the actual rerun POST.
// What each provider reply to that POST saves is read from a landing the
// machine keeps with its unspent eligible receipt, and what provider facts
// decide after an accepted request from saved accepted requests: real
// collection observes both with no journey.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { keepRepeatLanding } from "../../tests/support/ciFollowUpKeptLanding.ts";
import {
  heldRequest,
  laterReadsOf,
  rerunRuns,
  saveRepeatRequests,
  savedRepeatComparison,
  savedRepeatRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
  readFollowUpLedger,
} from "../../tests/support/ciFollowUpScenario.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
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

// A landing the machine keeps with its unspent eligible receipt: Story A,
// published as completed, whose run 71 first passed in 120 s against five
// prior builds of 100 s each.
const eligible = {
  stage: "eligible receipt",
  run: 71,
  seconds: 120,
  averageSeconds: 100,
} as const;
const beside120And100 = { originalMs: 120000, averageMs: 100000 };
const cards = async (server: DashboardServer) =>
  (await followUpSettings(server)).body.cards;

test("a kept eligible receipt whose rerun request the provider refuses reads refused beside its original and average, and no later pass asks again", async ({
  origin,
  github,
  startServer,
}) => {
  // Another landing's accepted request whose repeat the provider has not
  // started: each collection pass reads its run 72 before it spends receipts.
  const waiting = { run: 72, seconds: 120, averageSeconds: 100 };
  const kept = await keepRepeatLanding(origin, github, {
    ...eligible,
    beside: [heldRequest({ ...waiting, submission: { kind: "accepted" } })],
  });
  kept.provider(71).replyToRerun(403);
  const server = await startServer();
  await expect
    .poll(() => savedRepeatRequest(server, 71)?.submission.kind, "saved reply")
    .toBe("refused");
  const replied = github.calls.length;
  const refused = {
    kind: "unverified",
    explanation: expect.stringContaining("refused"),
    ...beside120And100,
  };
  expect(await cards(server), "refused card").toMatchObject([refused]);
  // The second read of run 72 after the reply belongs to a pass that began
  // once a whole pass after the reply had ended.
  await expect
    .poll(() => laterReadsOf(github, 72, replied), "a whole later pass")
    .toBeGreaterThanOrEqual(2);
  expect(rerunRuns(github), "rerun requests").toEqual([71]);
  await followUpSettings(server, false);
  expect(await cards(server), "follow-up off").toMatchObject([refused]);
});

test("a kept eligible receipt whose rerun request gets no definitive reply stays unverified and shows the later 104 second passing repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const kept = await keepRepeatLanding(origin, github, eligible);
  kept.provider(71).replyToRerun(503);
  const server = await startServer();
  await expect
    .poll(() => savedRepeatRequest(server, 71)?.submission.kind, "saved reply")
    .toBe("uncertain");
  kept.provider(71).setRepeat({ seconds: 104 });
  // The repeat is read after the reply; its measurement settles the request.
  await expect
    .poll(() => savedRepeatRequest(server, 71)?.outcome.settled, "repeat read")
    .toBe(true);
  const unverified = {
    kind: "unverified",
    explanation: expect.stringContaining("uncertain"),
    repeatMs: 104000,
    ...beside120And100,
  };
  expect(await cards(server), "stays unverified").toMatchObject([unverified]);
  expect(rerunRuns(github), "rerun requests").toEqual([71]);
  await followUpSettings(server, false);
  expect(await cards(server), "follow-up off").toMatchObject([unverified]);
});

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
  for (const { run } of repeats)
    expect(savedRepeatComparison(server, run)).toEqual({
      run,
      attempt: 1,
      originalMs: 120000,
      averageMs: 100000,
    });
  expect(rerunRuns(github)).toEqual([]);
});
