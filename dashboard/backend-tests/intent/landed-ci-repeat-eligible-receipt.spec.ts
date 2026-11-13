// What a fresh collecting dashboard saves when a landing starts with its
// kept unspent eligible receipt, for a published story, and the provider
// answers its rerun request. No receipt journey is replayed here.
import { keepRepeatLanding } from "../../tests/support/ciFollowUpKeptLanding.ts";
import {
  aWholePass,
  heldRequest,
  rerunRuns,
  savedRepeatRequest,
  waitingRequest,
} from "../../tests/support/ciFollowUpSavedRequests.ts";
import { followUpCards } from "../../tests/support/ciFollowUpScenario.ts";
import { startingFromKeptStory } from "../../tests/support/keptPublishedStory.ts";
import {
  expect,
  queuedClaudeBoundaryTest,
} from "../../tests/support/landedCiHistoryTest.ts";

const keptStoryTest = queuedClaudeBoundaryTest.extend(startingFromKeptStory);
keptStoryTest.use({ serverMode: "boundary" });

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

keptStoryTest(
  "a kept eligible receipt whose rerun request the provider refuses reads refused beside its original and average, and no later pass asks again",
  async ({ origin, github, startServer }) => {
    const kept = await keepRepeatLanding(origin, github, {
      ...eligible,
      beside: [heldRequest(waitingRequest)],
    });
    kept.provider(71).replyToRerun(403);
    const server = await startServer();
    await expect
      .poll(
        () => savedRepeatRequest(server, 71)?.submission.kind,
        "saved reply",
      )
      .toBe("refused");
    const replied = github.calls.length;
    const refused = {
      kind: "unverified",
      explanation: expect.stringContaining("refused"),
      ...beside120And100,
    };
    expect(await followUpCards(server), "refused card").toMatchObject([
      refused,
    ]);
    await aWholePass(github, replied);
    expect(rerunRuns(github), "rerun requests").toEqual([71]);
  },
);

keptStoryTest(
  "a kept eligible receipt whose rerun request gets no definitive reply stays unverified and shows the later 104 second passing repeat",
  async ({ origin, github, startServer }) => {
    const kept = await keepRepeatLanding(origin, github, eligible);
    kept.provider(71).replyToRerun(503);
    const server = await startServer();
    await expect
      .poll(
        () => savedRepeatRequest(server, 71)?.submission.kind,
        "saved reply",
      )
      .toBe("uncertain");
    kept.provider(71).setRepeat({ seconds: 104 });
    // The repeat is read after the reply; its measurement settles the request.
    await expect
      .poll(
        () => savedRepeatRequest(server, 71)?.outcome.settled,
        "repeat read",
      )
      .toBe(true);
    const unverified = {
      kind: "unverified",
      explanation: expect.stringContaining("uncertain"),
      repeatMs: 104000,
      ...beside120And100,
    };
    expect(await followUpCards(server), "stays unverified").toMatchObject([
      unverified,
    ]);
    expect(rerunRuns(github), "rerun requests").toEqual([71]);
  },
);
