// What a production dashboard reads after an accepted rerun request for a
// published completion, with no receipt journey: the origin starts from the
// kept published story (../../tests/support/keptPublishedStory.ts), the
// machine keeps the landing with that request
// (../../tests/support/ciFollowUpKeptLanding.ts),
// a fresh server collects, and each read follows what collection saved of
// the provider's repeat.
import { keepRepeatLanding } from "../../tests/support/ciFollowUpKeptLanding.ts";
import {
  aWholePass,
  heldRequest,
  rerunRuns,
  savedRepeatRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";
import { followUpCards } from "../../tests/support/ciFollowUpScenario.ts";
import { startingFromKeptStory } from "../../tests/support/keptPublishedStory.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";
import {
  expect,
  queuedClaudeBoundaryTest,
} from "../../tests/support/landedCiHistoryTest.ts";

const test = queuedClaudeBoundaryTest.extend(startingFromKeptStory);
test.use({ serverMode: "boundary" });

test("a kept accepted request asks for no rerun, reads its repeat in progress, then a possible slowdown at 106 seconds beside the 105 second original and 100 second average, and keeps the original in history", async ({
  origin,
  github,
  startServer,
}) => {
  // Another landing's accepted request whose repeat the provider never
  // starts. No story published that landing and the history keeps no build
  // of it, so no pass can spend on it: a pass reads its run 72 once.
  const waiting = heldRequest({
    run: 72,
    seconds: 120,
    averageSeconds: 100,
    submission: { kind: "accepted" },
  });
  // Story A, published as completed, whose run 71 first passed in 105 s
  // against five prior builds of 100 s each, its rerun request accepted.
  const kept = await keepRepeatLanding(origin, github, {
    stage: "accepted request",
    run: 71,
    seconds: 105,
    averageSeconds: 100,
    beside: [waiting],
  });
  const server = await startServer();
  // The repeat of run 71 has not started.
  await aWholePass(github, waiting.run);
  expect(rerunRuns(github), "no second request").toEqual([]);
  kept.provider(71).setRepeat({ status: "in_progress" });
  await expect
    .poll(() => savedRepeatRequest(server, 71)?.outcome.kind, "progress read")
    .toBe("progress");
  expect(await followUpCards(server), "progress card").toMatchObject([
    { kind: "progress", explanation: "CI rerun in progress" },
  ]);
  kept.provider(71).setRepeat({ seconds: 106 });
  // The pass that reads the finished repeat settles the request.
  await expect
    .poll(() => savedRepeatRequest(server, 71)?.outcome.settled, "repeat read")
    .toBe(true);
  expect(await followUpCards(server), "slow card").toMatchObject([
    {
      kind: "slow",
      explanation: "Possible CI slowdown",
      originalMs: 105000,
      repeatMs: 106000,
      averageMs: 100000,
    },
  ]);
  expect(await landedCiHistory(server), "original kept").toMatchObject({
    body: { reference: { selected: { key: "run/71/1", ms: 105000 } } },
  });
  expect(rerunRuns(github), "rerun requests").toEqual([]);
});
