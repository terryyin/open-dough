// A follow-up started with Cursor over raw HTTP, with the real installed start
// (../../tests/support/cursorStart.ts) and the fixture `cursor-agent`:
// Cursor's first prompt has Claude's follow-up layout (expectFollowUpInput in
// ./followUpBoundaryCases.ts; Claude's: agent-launch-follow-up-boundary.spec.ts).
// A blank follow-up with a chosen model is admitted, because
// its context is a first prompt, and a start continued after the source
// record is gone sends the recorded context. Codex's:
// agent-launch-follow-up-codex.spec.ts.

import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "../../tests/agentLaunchBoundary.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import { expect, test } from "../../tests/support/cursorStart.ts";
import type { FakeCursor } from "../../tests/support/fakeCursor.ts";
import { followUpOf } from "../../tests/support/followUpSources.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import { isolatedSession } from "../../tests/support/startSessionLanding.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  answerOf,
  expectFollowUpInput,
  quiet,
  quietContext,
  reported,
  reportedContext,
  request,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

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

test("a blank follow-up with a chosen model on Default main starts on that model with the context and the reporting context", async ({
  dashboard,
  origin,
  cursor,
}) => {
  keepLaunchRecords(dashboard, [quiet]);

  const launched = await answerOf(
    launch(dashboard, {
      ...cursorRequest,
      model: "gpt-5.2",
      followUp: followUpOf(quiet),
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

test("with Isolated workspace, a start continued after the source record is gone prompts its block, the reporting context, the recorded context and the request", async ({
  dashboard,
  origin,
  cursor,
}) => {
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source]);
  const text = "Check the nightly build too";
  const slug = "check-the-nightly-build-too";
  const trunk = await originMain(origin);
  // The first create-chat prints no usable id, so nothing is prompted.
  cursor.queueCreateChatId("not-a-session-id");
  const unconfirmed = await answerOf(
    launch(dashboard, {
      ...cursorRequest,
      instruction: text,
      policy: isolated,
      followUp: followUpOf(source),
    }),
  );
  expect(unconfirmed.kind, JSON.stringify(unconfirmed)).toBe("uncertain");
  expect(cursor.attaches()).toEqual([]);
  const [attempt] = await attempts(dashboard);
  keepLaunchRecords(dashboard, []);

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
    context: reportedContext,
    own: text,
    session,
    request: record?.request,
    server: dashboard,
  });
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    followUp: { context: reportedContext },
  });
});
