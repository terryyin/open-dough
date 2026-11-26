// Continue resends the recorded context after the source record is gone, over
// raw HTTP with a real bare origin (../../test-support/support/startOrigin.ts)
// and the synthetic `claude`. Two sources, resuming a kept start, and the
// refusals that precede a host are agent-launch-follow-up-attempt-identity.spec.ts
// and agent-launch-follow-up-refusal.spec.ts.

import {
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  answerOf,
  partsOf,
  reported,
  reportedContext,
  request,
  publishFollowUpSources,
  sourceStory,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });
test.beforeEach(publishFollowUpSources);

test.describe("a follow-up whose established start is kept after the host refused", () => {
  const followUpStart = (source: LaunchRecord) => ({
    ...request,
    instruction: "Continue",
    policy: { workspace: "isolated", landing: "review" },
    followUp: makeMe.aFollowUp.ofSession(source).please(),
  });

  test("sends the recorded context on Continue after the source record is gone", async ({
    dashboard,
  }) => {
    const source = reported(dashboard.home);
    keepLaunchRecords(dashboard, [source]);
    dashboard.claudeScenario("refused");
    await answerOf(launch(dashboard, followUpStart(source)));
    const [failed] = await attempts(dashboard);
    keepLaunchRecords(dashboard, []);

    dashboard.claudeScenario("launched");
    const launched = await answerOf(continued(dashboard, failed?.id ?? ""));

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    const call = dashboard.claudeLaunchCalls().at(-1);
    const { after } = partsOf(call?.argv.at(-1), reportedContext);
    expect(after).toEqual(["Continue"]);
    expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
      followUp: { context: reportedContext },
      storyIdentity: sourceStory.identity,
    });
  });
});
