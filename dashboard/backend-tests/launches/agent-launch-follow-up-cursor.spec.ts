// A follow-up started with Cursor over raw HTTP, with the real installed start
// (../../test-support/support/cursorStart.ts) and the fixture `cursor-agent`:
// Cursor's first prompt has Claude's follow-up layout (expectFollowUpInput in
// ./followUpBoundaryCases.ts; Claude's: agent-launch-follow-up-boundary.spec.ts).
// A blank follow-up with a chosen model is admitted, because
// its context is a first prompt, and a start continued after the source
// record is gone sends the recorded context. Codex's:
// agent-launch-follow-up-codex.spec.ts.

import { realpathSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
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
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  answerOf,
  expectFollowUpInput,
  quiet,
  quietContext,
  request,
  publishFollowUpSources,
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

test("a blank follow-up with a chosen model on the execution checkout starts on that model with the context and the reporting context", async ({
  dashboard,
  origin,
  cursor,
}) => {
  keepLaunchRecords(dashboard, [quiet]);

  const launched = await answerOf(
    launch(dashboard, {
      ...cursorRequest,
      model: "gpt-5.2",
      followUp: makeMe.aFollowUp.ofSession(quiet).please(),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.request).toMatchObject({ model: "gpt-5.2" });
  expect(launched.record?.request).not.toHaveProperty("instruction");
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  const { client, prompt } = await promptOf(cursor);
  expect(client.args).toEqual([
    "--workspace",
    origin.project,
    "--resume",
    cursor.sessionId,
    "--model",
    "gpt-5.2",
  ]);
  expectFollowUpInput(prompt, {
    context: quietContext,
    request: launched.record?.request,
    server: dashboard,
  });
});

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
}) => {
  const context =
    "Done story “SEED-269#recover-terminal-insert”: prior context";
  const text = "Continue the previous start";
  const kept = makeMe.anAcceptedAttempt
    .adHoc({
      host: "cursor",
      instruction: text,
      followUp: makeMe.aFollowUp
        .ofStory(recoverStory, "a".repeat(40))
        .withContext(context)
        .please(),
    })
    .reportingTo(dashboard.origin)
    .please();
  await keepMoreAttemptsBesideServer(dashboard, [kept]);

  const launched = await answerOf(continued(dashboard, kept.id));

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expectFollowUpInput((await promptOf(cursor)).prompt, {
    context,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
});
