// Automatic CI repeat admission through the one receipt journey: an ingested
// Done receipt over kept measured priors yields a rerun POST, its saved
// intent and accepted reply, and the resulting card. Kept eligible receipts
// start in ./landed-ci-repeat-eligible-receipt.spec.ts; saved accepted
// requests start in ./landed-ci-repeat-verdict.spec.ts.
import {
  expect,
  queuedClaudeBoundaryTest as test,
} from "../../tests/support/landedCiHistoryTest.ts";
import { keepRecordedPriorsMeasured } from "../../tests/support/ciFollowUpKeptPriors.ts";
import {
  aWholePass,
  rerunRuns,
  saveRepeatRequests,
  savedRepeatRequest,
  waitingRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";
import {
  followUpCards,
  prepareRepeatScenario,
} from "../../tests/support/ciFollowUpScenario.ts";
import { postLanding } from "../../tests/support/startSessionLandingCapture.ts";

test.use({ serverMode: "boundary" });

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
  // The waiting request, and the scenario's provider served again over the
  // one that answers its run.
  await saveRepeatRequests(origin, github, [waitingRequest]);
  scenario.serve();
  const server = await startServer();
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
  await aWholePass(github, replied);
  expect(rerunRuns(github), "rerun requests").toEqual([71]);
  expect(await followUpCards(server), "accepted request's card").toMatchObject([
    {
      kind: "unverified",
      explanation: "No later attempt of the original run has been observed",
      reviewable: true,
      originalMs: 105000,
      averageMs: 100000,
    },
  ]);
});
