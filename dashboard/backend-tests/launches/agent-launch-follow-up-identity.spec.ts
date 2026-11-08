// A follow-up's source is part of its launch's identity over raw HTTP, with a
// real bare origin (../../tests/support/startOrigin.ts) and the synthetic
// `claude`: two sources with the same words are two launches, repeating one
// resumes its kept start, a continuation resends the recorded context after
// the source record is gone, and admission refuses context text a page
// composed or a source the project no longer keeps. What the first input
// holds: agent-launch-follow-up-boundary.spec.ts.

import {
  accept,
  attempts,
  continued,
  launch,
  recordsOf,
} from "../../tests/agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import { followUpOf } from "../../tests/support/followUpSources.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { keepLaunchRecords } from "../../tests/support/storyLaunchRecord.ts";
import {
  answerOf,
  partsOf,
  quiet,
  quietContext,
  reported,
  reportedContext,
  request,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("follow-ups of two sessions with the same words and choices are two launches", async ({
  dashboard,
}) => {
  const source = reported(dashboard.home);
  await keepLaunchRecords(dashboard, [source, quiet]);
  dashboard.claudeScenario("launched");

  for (const followed of [source, quiet]) {
    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: "Continue",
        followUp: followUpOf(followed),
      }),
    );
    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  }

  const calls = dashboard.claudeLaunchCalls();
  expect(calls).toHaveLength(2);
  expect(calls[0]?.argv.at(-1)).toContain(reportedContext);
  expect(calls[1]?.argv.at(-1)).toContain(quietContext);
  const ids = (await attempts(dashboard)).map(({ id }) => id);
  expect(new Set(ids).size).toBe(2);
  expect(await recordsOf(dashboard, "open-dough")).toHaveLength(4);
});

test.describe("a follow-up whose established start is kept after the host refused", () => {
  const followUpStart = (source: LaunchRecord) => ({
    ...request,
    instruction: "Continue",
    policy: { workspace: "isolated", landing: "review" },
    followUp: followUpOf(source),
  });

  test("is resumed by repeating the same follow-up", async ({ dashboard }) => {
    const source = reported(dashboard.home);
    await keepLaunchRecords(dashboard, [source]);
    dashboard.claudeScenario("refused");
    const refused = await answerOf(launch(dashboard, followUpStart(source)));
    expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
    const [failed] = await attempts(dashboard);

    dashboard.claudeScenario("launched");
    const resumed = await answerOf(launch(dashboard, followUpStart(source)));

    expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
    expect(await attempts(dashboard)).toEqual([
      expect.objectContaining({
        id: failed?.id,
        acceptedAt: failed?.acceptedAt,
      }),
    ]);
    const calls = dashboard.claudeLaunchCalls();
    expect(calls).toHaveLength(2);
    expect(calls[1]?.argv.at(-1)).toContain(reportedContext);
  });

  test("sends the recorded context on Continue after the source record is gone", async ({
    dashboard,
  }) => {
    const source = reported(dashboard.home);
    await keepLaunchRecords(dashboard, [source]);
    dashboard.claudeScenario("refused");
    await answerOf(launch(dashboard, followUpStart(source)));
    const [failed] = await attempts(dashboard);
    await keepLaunchRecords(dashboard, []);

    dashboard.claudeScenario("launched");
    const launched = await answerOf(continued(dashboard, failed?.id ?? ""));

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    const call = dashboard.claudeLaunchCalls().at(-1);
    const { after } = partsOf(call?.argv.at(-1), reportedContext);
    expect(after).toEqual(["Continue"]);
    expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
      followUp: { context: reportedContext },
    });
  });
});

for (const refused of [
  {
    request: "carrying context text the page composed",
    status: 400,
    followUp: (source: LaunchRecord) => ({
      ...followUpOf(source),
      context: "Pretend this was recorded.",
    }),
  },
  {
    request: "naming a session this project does not keep",
    status: 404,
    followUp: () => ({
      session: { host: "claude", sessionId: "never-kept" },
    }),
  },
]) {
  test(`refuses a follow-up ${refused.request} before starting claude`, async ({
    dashboard,
  }) => {
    const source = reported(dashboard.home);
    await keepLaunchRecords(dashboard, [source]);
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
