// A follow-up started with Codex over raw HTTP, with the real installed start
// (../../tests/support/codexStart.ts) and the protocol-only Codex fixture:
// Codex's first input has Claude's follow-up layout (expectFollowUpInput in
// ./followUpBoundaryCases.ts; Claude's: agent-launch-follow-up-boundary.spec.ts
// and, for a done story, agent-launch-follow-up-story.spec.ts), and a start
// retried after the source record is gone rebuilds that input from the
// recorded request.
// Cursor's: agent-launch-follow-up-cursor.spec.ts.

import {
  attempts,
  continued,
  launch,
} from "../../tests/agentLaunchBoundary.ts";
import { expect, stored, test } from "../../tests/support/codexStart.ts";
import type { FakeCodex } from "../../tests/support/fakeCodex.ts";
import { followUpOf } from "../../tests/support/followUpSources.ts";
import {
  doneStoryFiles,
  quietStorySessions,
  recoverStory,
  storyContextOf,
  storyFollowUpOf,
} from "../../tests/support/followUpStories.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import {
  git,
  isolatedSession,
} from "../../tests/support/startSessionLanding.ts";
import { keepLaunchRecords } from "../../tests/support/storyLaunchRecord.ts";
import {
  answerOf,
  expectFollowUpInput,
  reported,
  reportedContext,
  request,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const codex = { ...request, host: "codex" };
const isolated = { workspace: "isolated", landing: "review" };
const completedAt = "2026-11-08T09:05:00.000Z";

// The text of every input Codex was handed, in order.
const inputsOf = (native: FakeCodex) =>
  native.calls
    .filter((call) => call.method === "turn/start")
    .map((call) => {
      const { input } = call.params as {
        input: { type: string; text?: string }[];
      };
      expect(input.map(({ type }) => type)).toEqual(["text"]);
      return input[0]?.text;
    });

// E1.3: SEED-269's card, its done record published at the revision the page
// showed and its two quiet Done sessions kept.
test("a done story followed up with Codex on Isolated workspace · Wait for review opens a fresh worktree at fetched trunk with the story's context and the request", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const trunk = await originMain(origin);
  dashboard.github.serve(
    "terryyin/open-dough",
    publishes({
      revision: trunk,
      files: doneStoryFiles([recoverStory], completedAt),
    }),
  );
  const kept = quietStorySessions(dashboard.home, recoverStory, new Date());
  await keepLaunchRecords(dashboard, kept);
  const text = "Paste still drops the last line on iPad; investigate.";
  const context = storyContextOf(recoverStory, completedAt, "quiet sessions");

  const launched = await answerOf(
    launch(dashboard, {
      ...codex,
      instruction: text,
      policy: isolated,
      followUp: storyFollowUpOf(recoverStory, trunk),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const slug = "paste-still-drops-the-last-line-on-ipad-investig";
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    trunk,
    "codex",
  );
  expect(launched.record?.establishedSession).toEqual(session);
  expect(
    native.calls.find((call) => call.method === "thread/start")?.params,
  ).toMatchObject({ cwd: session.workspace });
  expect(git(session.workspace, "rev-parse", "HEAD")).toBe(trunk);
  const [input, ...others] = inputsOf(native);
  expect(others).toEqual([]);
  expectFollowUpInput(input, {
    context,
    own: text,
    session,
    request: launched.record?.request,
    server: dashboard,
  });
  expect(launched.record?.request).toMatchObject({
    instruction: text,
    followUp: { ...storyFollowUpOf(recoverStory, trunk), context },
  });
  // The story's sessions stay Done and unchanged.
  expect(stored(dashboard.home).slice(0, kept.length)).toEqual(kept);
});

test("on Default main · Wait for review, Codex's input is the context, then the request, then the reporting context", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const source = reported(dashboard.home);
  await keepLaunchRecords(dashboard, [source]);
  const text = "Is it still slow?";

  const launched = await answerOf(
    launch(dashboard, {
      ...codex,
      instruction: text,
      followUp: followUpOf(source),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record).not.toHaveProperty("establishedSession");
  expectFollowUpInput(inputsOf(native)[0], {
    context: reportedContext,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
});

test("Continue after Codex refused and the source record is gone rebuilds the input from the recorded context", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const source = reported(dashboard.home);
  await keepLaunchRecords(dashboard, [source]);
  const text = "Continue";
  const trunk = await originMain(origin);
  native.refuseCreation = true;
  const refused = await answerOf(
    launch(dashboard, {
      ...codex,
      instruction: text,
      policy: isolated,
      followUp: followUpOf(source),
    }),
  );
  expect(refused.kind, JSON.stringify(refused)).toBe("failed");
  expect(inputsOf(native)).toEqual([]);
  const [failed] = await attempts(dashboard);
  await keepLaunchRecords(dashboard, []);

  native.refuseCreation = false;
  const launched = await answerOf(continued(dashboard, failed?.id ?? ""));

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [input, ...others] = inputsOf(native);
  expect(others).toEqual([]);
  expectFollowUpInput(input, {
    context: reportedContext,
    own: text,
    session: isolatedSession(
      origin.project,
      "continue",
      "review",
      trunk,
      "codex",
    ),
    request: launched.record?.request,
    server: dashboard,
  });
  expect(launched.record?.request).toMatchObject({
    followUp: { context: reportedContext },
  });
});
