// A follow-up's source is part of its launch's identity over raw HTTP, with a
// real bare origin (../../test-support/support/startOrigin.ts) and the synthetic
// `claude`. Two sources and resuming a kept start, including after the source
// record is gone, are agent-launch-follow-up-attempt-identity.spec.ts. What
// remains here: a forged context and a fresh image claim after that expiry,
// a continuation that resends the recorded context, and admission refusing
// context text a page composed or a source the project no longer keeps.

import {
  accept,
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  launchAttachmentEndpoint,
  launchAttachmentNameHeader,
} from "../../src/launchAttachments.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import {
  launchAttachmentClaimsRoot,
  listedMachineDirs,
  pngA,
} from "../../test-support/support/launchAttachmentFixtures.ts";
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

  test("refuses a forged context and a fresh image claim after the source record is gone", async ({
    dashboard,
  }) => {
    const source = reported(dashboard.home);
    keepLaunchRecords(dashboard, [source]);
    const followUp = followUpStart(source);
    dashboard.claudeScenario("refused");
    expect(await answerOf(launch(dashboard, followUp))).toMatchObject({
      kind: "failed",
      reason: "refused",
      sessionStartKept: true,
    });
    keepLaunchRecords(dashboard, []);

    dashboard.claudeScenario("launched");
    const forged = await accept(dashboard, {
      ...followUp,
      followUp: { ...followUp.followUp, context: "Text from the page." },
    });
    expect(forged.status).toBe(400);

    const uploaded = await fetch(
      new URL(launchAttachmentEndpoint, dashboard.baseURL),
      {
        method: "POST",
        headers: {
          Origin: dashboard.origin,
          "Content-Type": "image/png",
          [launchAttachmentNameHeader]: "new-evidence.png",
        },
        body: Uint8Array.from(pngA),
      },
    );
    expect(uploaded.status).toBe(200);
    const { claim } = (await uploaded.json()) as { claim: string };
    const fresh = await accept(dashboard, {
      ...followUp,
      attachmentClaims: [claim],
    });
    expect(fresh.status).toBe(404);
    expect(
      listedMachineDirs(launchAttachmentClaimsRoot(dashboard.home)),
    ).toEqual([]);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
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

for (const refused of [
  {
    request: "carrying context text the page composed",
    status: 400,
    followUp: (source: LaunchRecord) =>
      makeMe.aFollowUp
        .ofSession(source)
        .withContext("Pretend this was recorded.")
        .please(),
  },
  {
    request: "naming a session this project does not keep",
    status: 404,
    followUp: () =>
      makeMe.aFollowUp
        .ofSession({ host: "claude", sessionId: "never-kept" })
        .please(),
  },
]) {
  test(`refuses a follow-up ${refused.request} before starting claude`, async ({
    dashboard,
  }) => {
    const source = reported(dashboard.home);
    keepLaunchRecords(dashboard, [source]);
    dashboard.claudeScenario("launched");

    const response = await accept(dashboard, {
      ...request,
      followUp: refused.followUp(source),
    });

    expect(response.status).toBe(refused.status);
    expect(dashboard.claudeCalls()).toEqual([]);
    expect(stored(dashboard.home)).toEqual([source]);
  });
}
