// A follow-up of a done story over raw HTTP, with a real bare origin
// (../../tests/support/startOrigin.ts), a synthetic `gh` answering from the
// fake GitHub, and the synthetic `claude`: the request names the story and
// the revision the page showed, and the server reads its published done
// record at that revision and the Done sessions this machine keeps for it,
// sending the story's facts and each session's context as the first input's
// own block before the request. Two stories with the same words are two
// launches; repeating one resumes its kept start. A story that revision does
// not publish, or whose record cannot be read, refuses the follow-up. The
// page journey is ../../../e2e/stories/recently-done-follow-up.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { attempts, launch, accept } from "../../tests/agentLaunchBoundary.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import { failsWith } from "../../tests/support/fakeGitHub.ts";
import {
  doneStoryFiles,
  otherStory,
  quietStorySessions,
  recoverStory,
  storyContextOf,
  storyFollowUpOf,
} from "../../tests/support/followUpStories.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import type { StartOrigin } from "../../tests/support/startOrigin.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  answerOf,
  expectFollowUpInput,
  partsOf,
  request,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const completedAt = "2026-11-08T09:05:00.000Z";
const repository = "terryyin/open-dough";

// Publishes the done records of SEED-269 and SEED-267 at the origin's main,
// as the revision the page showed; answers that revision.
async function publishDoneStories(
  dashboard: DashboardServer,
  origin: StartOrigin,
): Promise<string> {
  const revision = await originMain(origin);
  dashboard.github.serve(
    repository,
    publishes({
      revision,
      files: doneStoryFiles([recoverStory, otherStory], completedAt),
    }),
  );
  return revision;
}

test("a done story's follow-up sends its published facts and each Done session it holds, then the request, and leaves the records unchanged", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishDoneStories(dashboard, origin);
  const doneAt = new Date();
  const kept = [
    ...quietStorySessions(dashboard.home, recoverStory, doneAt),
    // Still open, so not on the done story's card.
    makeMe.aLaunchRecord
      .refining(recoverStory)
      .inClaudeSession({ sessionId: "still-open", shortId: "still-op" })
      .please(),
    ...quietStorySessions(dashboard.home, otherStory, doneAt),
  ];
  keepLaunchRecords(dashboard, kept);
  dashboard.claudeScenario("launched");
  const text = "Paste still drops the last line on iPad; investigate.";
  const context = storyContextOf(recoverStory, completedAt, "quiet sessions");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: text,
      followUp: storyFollowUpOf(recoverStory, revision),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call, ...others] = dashboard.claudeLaunchCalls();
  expect(others).toEqual([]);
  expectFollowUpInput(call?.argv.at(-1), {
    context,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    instruction: text,
    followUp: { ...storyFollowUpOf(recoverStory, revision), context },
  });
  // Its facts are the done record published at the revision shown.
  expect(dashboard.github.calls.map(({ request }) => request)).toContainEqual(
    expect.objectContaining({
      kind: "content",
      path: `.planning/${doneRecordPath(recoverStory.identity)}`,
      revision,
    }),
  );
  // The story's sessions stay Done and unchanged.
  expect(stored(dashboard.home).slice(0, kept.length)).toEqual(kept);
});

test("a done story with no session kept sends its facts and that no session context is retained", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishDoneStories(dashboard, origin);
  dashboard.claudeScenario("launched");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: "Continue",
      followUp: storyFollowUpOf(otherStory, revision),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call] = dashboard.claudeLaunchCalls();
  const { after } = partsOf(
    call?.argv.at(-1),
    storyContextOf(otherStory, completedAt, "no session"),
  );
  expect(after[0]).toBe("Continue");
});

test("follow-ups of two stories with the same words and choices are two launches, and repeating one resumes its kept start", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishDoneStories(dashboard, origin);
  const followUpStart = (story: typeof recoverStory) => ({
    ...request,
    instruction: "Continue",
    policy: { workspace: "isolated", landing: "review" },
    followUp: storyFollowUpOf(story, revision),
  });
  dashboard.claudeScenario("refused");
  const refused = await answerOf(
    launch(dashboard, followUpStart(recoverStory)),
  );
  expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
  const [failed] = await attempts(dashboard);

  dashboard.claudeScenario("launched");
  const other = await answerOf(launch(dashboard, followUpStart(otherStory)));
  const resumed = await answerOf(
    launch(dashboard, followUpStart(recoverStory)),
  );

  expect(other.kind, JSON.stringify(other)).toBe("launched");
  expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
  const kept = await attempts(dashboard);
  expect(kept).toHaveLength(2);
  expect(kept).toContainEqual(
    expect.objectContaining({
      id: failed?.id,
      acceptedAt: failed?.acceptedAt,
    }),
  );
  const calls = dashboard.claudeLaunchCalls();
  expect(calls).toHaveLength(3);
  expect(calls[1]?.argv.at(-1)).toContain(
    storyContextOf(otherStory, completedAt, "no session"),
  );
  expect(calls[2]?.argv.at(-1)).toContain(
    storyContextOf(recoverStory, completedAt, "no session"),
  );
});

for (const refused of [
  {
    request: "naming a story the revision shown does not publish",
    status: 404,
    serve: (dashboard: DashboardServer, origin: StartOrigin) =>
      publishDoneStories(dashboard, origin),
    identity: "SEED-270#never-completed",
  },
  {
    request: "whose done record cannot be read",
    status: 502,
    serve: async (dashboard: DashboardServer, origin: StartOrigin) => {
      dashboard.github.serve(repository, failsWith("connection reset"));
      return originMain(origin);
    },
    identity: recoverStory.identity,
  },
]) {
  test(`refuses a follow-up ${refused.request} before starting claude`, async ({
    dashboard,
    origin,
  }) => {
    const revision = await refused.serve(dashboard, origin);
    const kept = quietStorySessions(dashboard.home, recoverStory, new Date());
    keepLaunchRecords(dashboard, kept);
    dashboard.claudeScenario("launched");

    const response = await accept(dashboard, {
      ...request,
      followUp: { story: { identity: refused.identity, revision } },
    });

    expect(response.status, response.body).toBe(refused.status);
    expect(dashboard.claudeCalls()).toEqual([]);
    expect(stored(dashboard.home)).toEqual(kept);
  });
}
