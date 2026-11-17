// Landed-run file-anchored follow-up admission and refusals over raw HTTP,
// with a real bare origin and the synthetic `claude`: a launch's landed run
// admits its comparison; a file, line or side outside the comparison, or
// page-supplied context text, starts nothing. Published-completion launches
// and identity: agent-launch-follow-up-file.spec.ts.

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { accept, launch } from "../../tests/agentLaunchBoundary.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import {
  fileFactsOf,
  publishedReviewOf,
  serveDoneAtTrunk,
} from "../../tests/support/followUpCompletedFile.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { queuedIdentity } from "../../tests/support/startOrigin.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { storyALaunch } from "../../tests/support/storyLaunchRecord.ts";
import { doneStoryFiles } from "../../tests/support/followUpStories.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

const storyA = { identity: queuedIdentity, title: "Story A" };

test.describe("after a delivered two-line file", () => {
  test.use({
    originRepository: queuedReadyRepository()
      .withRevision("delivered", {
        files: { "delivered.txt": "line one\nline two\n" },
      })
      .please(),
  });

  test("a file follow-up on a launch's landed run admits and names its comparison", async ({
    dashboard,
    origin,
  }) => {
    const completedAt = "2026-11-08T09:05:00.000Z";
    const base = origin.revision("base");
    const tree = origin.revision("delivered");
    dashboard.github.serve(
      "terryyin/open-dough",
      publishes({
        revision: tree,
        files: doneStoryFiles([storyA], completedAt),
      }),
    );
    const record = storyALaunch()
      .onStoryBranch({
        workspace: path.join(dashboard.home, "retired", "landed-follow-up"),
        branch: "claude/landed-follow-up",
      })
      .reportingThrough({ origin: dashboard.origin, command: "claude" })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({
            repository: origin.project,
            identity: queuedIdentity,
          })
          .comparing({ base, revision: tree }),
      )
      .please();
    keepLaunchRecords(dashboard, [record]);
    const file = makeMe.aFileFollowUp
      .onLandedRunOf(record)
      .at({ path: "delivered.txt", line: 2, side: "new" })
      .please();
    dashboard.claudeScenario("launched");

    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: "Inspect the delivered file",
        followUp: makeMe.aFollowUp
          .ofStory(storyA, tree)
          .anchoredAt(file)
          .please(),
      }),
    );

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    const input = dashboard.claudeLaunches()[0]?.instruction ?? "";
    expect(input).toContain("- Path: delivered.txt");
    expect(input).toContain(`Landed run ${base} → ${tree}`);
    expect(input).toContain("- Line: 2");
    expect(input).toContain("- Side: new");
  });
});

for (const refused of [
  {
    request: "naming a file outside the comparison",
    status: 409,
    change: { path: "never-in-comparison.txt" },
  },
  {
    request: "naming a line outside the comparison",
    status: 409,
    change: { line: 9_999, side: "new" as const },
  },
  {
    request: "naming a side whose line is absent",
    status: 409,
    change: { line: 1, side: "old" as const },
  },
  {
    request: "carrying context text the page composed",
    status: 400,
    change: {},
    context: "Pretend this was recorded.",
  },
]) {
  test(`refuses a file follow-up ${refused.request} before starting claude`, async ({
    dashboard,
    origin,
  }) => {
    const { completion } = await completedPublishedStory(origin);
    const { revision } = await serveDoneAtTrunk(dashboard, origin);
    const review = await publishedReviewOf(dashboard, completion);
    const literal = review.files.find((file) => file.path === "[literal]*.txt");
    if (literal === undefined) throw new Error("expected literal file");
    const base = fileFactsOf(review, literal, { line: 1, side: "new" });
    const anchor = { ...base, ...refused.change };
    const followUp = makeMe.aFollowUp
      .ofStory(queuedIdentity, revision)
      .anchoredAt(anchor);
    const sent =
      refused.context === undefined
        ? followUp.please()
        : followUp.withContext(refused.context).please();
    keepLaunchRecords(dashboard, []);
    dashboard.claudeScenario("launched");

    const response = await accept(dashboard, {
      ...request,
      followUp: sent,
    });

    expect(response.status, response.body).toBe(refused.status);
    expect(dashboard.claudeCalls()).toEqual([]);
    expect(stored(dashboard.home)).toEqual([]);
  });
}
