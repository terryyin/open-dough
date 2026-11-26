import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
// A kept Claude Code conversation whose first input is unconfirmed
// (../../dashboard/server/nativeSessionRun.ts): Claude Code writes no first-input evidence and has
// no native recovery, so only legacy or hand-edited launch evidence reaches
// this. A launch matching it starts no other conversation and answers what is
// known and what to check, read as formed under Startup recovery. The
// evidence is forged in this machine's records, as
// ./agent-launch-codex-creation.spec.ts forges legacy evidence.

import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { recoveryOf } from "../../dashboard/test-support/responsiveRecovery.ts";
import { changeLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";

const request = makeMe.aLaunchRequest
  .adHoc({ instruction: "why is the CI slow on main?" })
  .please();
const unconfirmed =
  "This launch's recorded conversation has a first input that is not confirmed, so no other conversation was started. Check the recorded conversation for that input.";
test.use({ projectFolders: ["open-dough"] });

test("a launch matching a kept conversation with unconfirmed first input starts nothing and says what to check, as Startup recovery shows it", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  changeLaunchStore(dashboard, (document) => {
    const [kept] = document["open-dough"] ?? [];
    if (kept === undefined || !("session" in kept))
      throw new Error("Missing saved Claude record.");
    return {
      ...document,
      "open-dough": [
        {
          ...kept,
          firstInput: { state: "uncertain", instruction: request.instruction },
        },
      ],
    };
  });

  expect(JSON.parse((await launch(dashboard, request)).body)).toEqual({
    kind: "uncertain",
    reason: "unconfirmed",
    explanation: unconfirmed,
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);

  await openTakenBacklog(page, launchJourney);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(`Its last answer: ${unconfirmed}`);
  await expect(recovery).not.toContainText(/start(ing)? again/i);
});
