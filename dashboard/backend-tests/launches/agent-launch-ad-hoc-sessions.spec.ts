// What a default ad hoc launch keeps of where it started, over raw HTTP at
// the boundary server: launched in the project's default checkout with the
// default choices, with an instruction or blank, its kept record names that
// checkout and the revision its `HEAD` named when the launch began. A real
// bare origin (../../test-support/support/startOrigin.ts) and the synthetic
// `claude`. The launch itself is ./agent-launch-ad-hoc-boundary.spec.ts; a
// session its start established keeps its own start
// (./agent-launch-start-session-kept.spec.ts).

import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  launch,
  machineSessions,
} from "../../test-support/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

for (const [asked, choices] of [
  ["with an instruction", { instruction: "Explain how launch records work" }],
  ["with no instruction", {}],
] as const) {
  test(`a default launch ${asked} keeps the default checkout and its starting revision`, async ({
    dashboard,
    origin,
  }) => {
    const startingRevision = git(origin.project, "rev-parse", "HEAD");
    dashboard.claudeScenario("launched");

    const response = await launch(
      dashboard,
      makeMe.aLaunchRequest.adHoc(choices).please(),
    );

    expect(response.status).toBe(200);
    const answer = JSON.parse(response.body) as {
      kind: string;
      record?: LaunchRecord;
    };
    expect(answer.kind).toBe("launched");
    const started = answer.record?.defaultStart;
    expect(started?.startingRevision).toBe(startingRevision);
    const [call] = dashboard.claudeLaunchCalls();
    expect(realpathSync(started?.workspace ?? "")).toBe(call?.cwd);
    expect(await machineSessions(dashboard)).toContainEqual(
      expect.objectContaining({ defaultStart: started }),
    );
  });
}
