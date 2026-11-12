// Automatic CI repeat admission, through the one real receipt journey: a
// receipt is ingested over prior builds the machine keeps measured, and the
// actual rerun POST, the request saved around it and its card are observed.
// What each provider reply to that POST saves is read from a landing the
// machine keeps with its unspent eligible receipt, and what provider facts
// decide after an accepted request from saved accepted requests
// (a published story's: ./landed-ci-repeat-accepted-request.spec.ts): real
// collection observes both with no journey.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { keepRepeatLanding } from "../../tests/support/ciFollowUpKeptLanding.ts";
import { keepRecordedPriorsMeasured } from "../../tests/support/ciFollowUpKeptPriors.ts";
import {
  aWholePass,
  heldRequest,
  repeatCards,
  rerunRuns,
  saveRepeatRequests,
  savedRepeatComparison,
  savedRepeatRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
} from "../../tests/support/ciFollowUpScenario.ts";
import { postLanding } from "../../tests/support/startSessionLandingCapture.ts";

test.use({ serverMode: "boundary" });

// Another landing's accepted request whose repeat the provider has not
// started. No story published that landing and the history keeps no build of
// it, so no pass can spend on it: a pass reads its run 72 once and no more.
const waiting = {
  run: 72,
  seconds: 120,
  averageSeconds: 100,
  submission: { kind: "accepted" },
} as const;

test("a Done receipt at exactly 105 seconds against five kept 100 second prior builds gets one rerun request, saved as intent before it is sent and as accepted after the reply, and reads as a card", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareRepeatScenario(origin, github, 105);
  // The five landings the scenario published and recorded before the story's,
  // already measured: collection has no prior build left to ask about.
  await keepRecordedPriorsMeasured(
    origin,
    scenario.prior.map((run) => run.headSha),
    100,
  );
  // The waiting request, kept before follow-up is enabled, and the scenario's
  // provider served again over the one that answers its run.
  await saveRepeatRequests(origin, github, [waiting]);
  scenario.serve();
  const server = await startServer();
  expect((await followUpSettings(server)).body.enabled, "off").toBe(false);
  expect((await followUpSettings(server, true)).status).toBe(200);
  let release!: () => void;
  const reply = new Promise<void>((resolve) => {
    release = resolve;
  });
  let began!: () => void;
  const submitted = new Promise<void>((resolve) => {
    began = resolve;
  });
  // What the ledger holds of the request while the provider holds its reply.
  let heldAs: string | undefined;
  scenario.holdSubmission(async () => {
    heldAs ??=
      savedRepeatRequest(server, 71)?.submission.kind ?? "nothing saved";
    began();
    await reply;
  });
  const submission = await scenario.ingest(server);
  await submitted;
  expect(heldAs, "intent saved before the request is sent").toBe("intent");
  expect(rerunRuns(github), "one rerun request").toEqual([71]);
  expect((await postLanding(server, submission, false)).status).toBe(200);
  release();
  await expect
    .poll(
      () => savedRepeatRequest(server, 71)?.submission.kind,
      "accepted saved after the reply",
    )
    .toBe("accepted");
  const replied = github.calls.length;
  await aWholePass(github, waiting.run, replied);
  expect(rerunRuns(github), "rerun requests").toEqual([71]);
  expect(await repeatCards(server), "accepted request's card").toMatchObject([
    {
      kind: "unverified",
      explanation: "No later attempt of the original run has been observed",
      reviewable: true,
      originalMs: 105000,
      averageMs: 100000,
    },
  ]);
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

test("a kept eligible receipt whose rerun request the provider refuses reads refused beside its original and average, and no later pass asks again", async ({
  origin,
  github,
  startServer,
}) => {
  const kept = await keepRepeatLanding(origin, github, {
    ...eligible,
    beside: [heldRequest(waiting)],
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
  expect(await repeatCards(server), "refused card").toMatchObject([refused]);
  await aWholePass(github, waiting.run, replied);
  expect(rerunRuns(github), "rerun requests").toEqual([71]);
  await followUpSettings(server, false);
  expect(await repeatCards(server), "follow-up off").toMatchObject([refused]);
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
  expect(await repeatCards(server), "stays unverified").toMatchObject([
    unverified,
  ]);
  expect(rerunRuns(github), "rerun requests").toEqual([71]);
  await followUpSettings(server, false);
  expect(await repeatCards(server), "follow-up off").toMatchObject([
    unverified,
  ]);
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
  const provider = await saveRepeatRequests(
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
