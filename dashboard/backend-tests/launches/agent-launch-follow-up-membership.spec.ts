import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept, attempts } from "../../test-support/agentLaunchBoundary.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  publishFollowUpSources,
  request,
  sourceStory,
} from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });
test.beforeEach(publishFollowUpSources);

for (const { name, identity, claimed, status } of [
  { name: "unbound", identity: undefined, claimed: undefined, status: 404 },
  {
    name: "missing from the published project",
    identity: "SEED-other#story",
    claimed: undefined,
    status: 404,
  },
  {
    name: "supplied by the page",
    identity: undefined,
    claimed: sourceStory.identity,
    status: 400,
  },
]) {
  test(`a session binding ${name} starts no follow-up`, async ({
    dashboard,
    origin,
  }) => {
    const before = await originMain(origin);
    const source = makeMe.aLaunchRecord
      .adHoc({ title: "Previous work", storyIdentity: identity })
      .markedDone()
      .please();
    keepLaunchRecords(dashboard, [source]);
    dashboard.claudeScenario("launched");
    const followUp = makeMe.aFollowUp.ofSession(source).please();
    const response = await accept(dashboard, {
      ...request,
      followUp: {
        ...followUp,
        ...(claimed === undefined ? {} : { storyIdentity: claimed }),
      },
    });

    expect(response.status, response.body).toBe(status);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(0);
    expect(await attempts(dashboard)).toEqual([]);
    expect(await originMain(origin)).toBe(before);
  });
}
