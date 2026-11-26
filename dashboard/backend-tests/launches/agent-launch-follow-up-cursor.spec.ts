// A follow-up started with Cursor over raw HTTP, with the real installed start
// (../../test-support/support/cursorStart.ts) and the fixture `cursor-agent`:
// Cursor's first prompt has the follow-up layout (expectFollowUpInput in
// ./followUpBoundaryCases.ts). A start continued after the source record is
// gone sends the recorded context. A blank request with a chosen model is
// agent-launch-follow-up-established-input.spec.ts. Codex's:
// agent-launch-follow-up-codex.spec.ts.

import { realpathSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../../Distribution/tests/support/published-backlog.mjs";
import { publishCommittedOrigin } from "../../test-support/committedOrigin.ts";
import { keepMoreAttemptsBesideServer } from "../../test-support/acceptedAttempts.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import { expect, test } from "../../test-support/support/cursorStart.ts";
import type { FakeCursor } from "../../test-support/support/fakeCursor.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  doneStoryFiles,
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import { publishes } from "../../test-support/support/publishedRepository.ts";
import { isolatedSession } from "../../test-support/support/startSessionLanding.ts";
import {
  answerOf,
  expectFollowUpInput,
  request,
  publishFollowUpSources,
  sourceStory,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });
test.beforeEach(publishFollowUpSources);

const cursorRequest = { ...request, host: "cursor" };
const isolated = { workspace: "isolated", landing: "review" };

// The one kept client and the prompt it submitted.
async function promptOf(cursor: FakeCursor) {
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const client = cursor.attaches()[0];
  if (client === undefined) throw new Error("Cursor started no client.");
  // The client records the prompt once its return submits it.
  await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
  return { client, prompt: cursor.input(client.pid).replace(/\r$/u, "") };
}

test("with Isolated workspace, Continue sends the saved story follow-up message after the source record is gone", async ({
  dashboard,
  origin,
  cursor,
}) => {
  const text = "Check the nightly build too";
  const slug = "check-the-nightly-build-too";
  const trunk = await originMain(origin);
  const completedAt = "2026-11-08T09:05:00.000Z";
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({
      revision: trunk,
      files: doneStoryFiles([recoverStory], completedAt),
    }),
  );
  // The first create-chat prints no usable id, so nothing is prompted.
  cursor.queueCreateChatId("not-a-session-id");
  const unconfirmed = await answerOf(
    launch(dashboard, {
      ...cursorRequest,
      instruction: text,
      policy: isolated,
      followUp: makeMe.aFollowUp.ofStory(recoverStory, trunk).please(),
    }),
  );
  expect(unconfirmed.kind, JSON.stringify(unconfirmed)).toBe("uncertain");
  expect(cursor.attaches()).toEqual([]);
  const [attempt] = await attempts(dashboard);
  const message = storyContextOf(recoverStory, completedAt, "no session", text);
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({ revision: trunk, files: {} }),
  );

  const launched = await answerOf(continued(dashboard, attempt?.id ?? ""));

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    trunk,
    "cursor",
  );
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record?.establishedSession).toEqual(session);
  expect(cursor.calls().at(-1)?.cwd).toBe(realpathSync(session.workspace));
  expectFollowUpInput((await promptOf(cursor)).prompt, {
    context: message,
    session,
    request: record?.request,
    server: dashboard,
  });
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    followUp: { context: { message } },
  });
});

test("Continue reads a legacy story follow-up attempt and preserves its separate instruction", async ({
  dashboard,
  cursor,
  origin,
}) => {
  const trunk = await origin.publishRevision({
    message: "Publish the historical follow-up's source",
    files: {
      ...doneStoryFiles([recoverStory], "2026-11-08T09:05:00.000Z"),
      ".planning/PRODUCT-BACKLOG.md": renderPublishedBacklog({
        taken: [sourceStory],
      }),
    },
  });
  await publishCommittedOrigin(dashboard.github, {
    repoDir: origin.origin,
    revision: trunk,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const context =
    "Done story “SEED-269#recover-terminal-insert”: prior context";
  const text = "Continue the previous start";
  const kept = makeMe.anAcceptedAttempt
    .adHoc({
      host: "cursor",
      instruction: text,
      followUp: makeMe.aFollowUp
        .ofStory(recoverStory, trunk)
        .withContext(context)
        .please(),
    })
    .reportingTo(dashboard.origin)
    .please();
  await keepMoreAttemptsBesideServer(dashboard, [kept]);

  const launched = await answerOf(continued(dashboard, kept.id));

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.request).toHaveProperty(
    "storyIdentity",
    recoverStory.identity,
  );
  expectFollowUpInput((await promptOf(cursor)).prompt, {
    context,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
});
