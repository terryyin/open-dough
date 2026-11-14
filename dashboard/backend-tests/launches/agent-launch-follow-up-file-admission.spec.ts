// Landed-run file-anchored follow-up admission and refusals over raw HTTP,
// with a real bare origin and the synthetic `claude`: a reference admits the
// landed comparison; a file, line or side outside the comparison, or
// page-supplied context text, starts nothing. Published-completion launches
// and identity: agent-launch-follow-up-file.spec.ts.

import path from "node:path";
import { randomUUID } from "node:crypto";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept, launch } from "../../tests/agentLaunchBoundary.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import {
  fileFactsOf,
  fileFollowUpOf,
  publishedReviewOf,
  serveDoneAtTrunk,
} from "../../tests/support/followUpCompletedFile.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { queuedIdentity } from "../../tests/support/startOrigin.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { storyALaunch } from "../../tests/support/storyLaunchRecord.ts";
import {
  commitAll,
  git,
  writeAt,
} from "../../tests/support/storyReviewWorktree.ts";
import { push } from "../../tests/support/storyReviewTrunkCommits.ts";
import { doneStoryFiles } from "../../tests/support/followUpStories.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

const storyA = { identity: queuedIdentity, title: "Story A" };

test("a landed-run file follow-up admits by reference and names the landed comparison", async ({
  dashboard,
  origin,
}) => {
  const completedAt = "2026-11-08T09:05:00.000Z";
  const revision = await originMain(origin);
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({
      revision,
      files: doneStoryFiles([storyA], completedAt),
    }),
  );
  const base = git(origin.project, "rev-parse", "HEAD");
  writeAt(origin.project, "delivered.txt", "line one\nline two\n");
  commitAll(origin.project, "delivered file");
  push(origin.project);
  const tree = git(origin.project, "rev-parse", "HEAD");
  const reference = randomUUID();
  const record = storyALaunch()
    .onStoryBranch({
      workspace: path.join(dashboard.home, "retired", "landed-follow-up"),
      branch: "claude/landed-follow-up",
    })
    .reportingThrough({
      origin: dashboard.origin,
      reference,
      command: "claude",
    })
    .please();
  record.landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: origin.project,
      identity: queuedIdentity,
    })
    .forLaunch(reference)
    .comparing({ base, revision: tree })
    .please();
  keepLaunchRecords(dashboard, [record]);
  const file = {
    path: "delivered.txt",
    kind: "landed" as const,
    baseline: base,
    tree,
    reference,
    line: 2,
    side: "new" as const,
  };
  dashboard.claudeScenario("launched");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: "Inspect the delivered file",
      followUp: fileFollowUpOf(revision, file),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const input = dashboard.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
  expect(input).toContain(`- Path: ${file.path}`);
  expect(input).toContain(`Landed run ${file.baseline} → ${file.tree}`);
  expect(input).toContain("- Line: 2");
  expect(input).toContain("- Side: new");
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
    const followUp = {
      ...fileFollowUpOf(revision, { ...base, ...refused.change }),
      ...(refused.context === undefined ? {} : { context: refused.context }),
    };
    keepLaunchRecords(dashboard, []);
    dashboard.claudeScenario("launched");

    const response = await accept(dashboard, {
      ...request,
      followUp,
    });

    expect(response.status, response.body).toBe(refused.status);
    expect(dashboard.claudeCalls()).toEqual([]);
    expect(stored(dashboard.home)).toEqual([]);
  });
}
