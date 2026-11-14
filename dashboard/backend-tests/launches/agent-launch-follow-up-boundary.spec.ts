// A follow-up of a retained Done session over raw HTTP, with a real bare
// origin (../../tests/support/startOrigin.ts) and the synthetic `claude`: the
// request names only its source, and the server resolves the context from the
// kept record and sends it as its own first input block beside the request
// and reporting context, keeping it on the request; the source record is
// unchanged. Identity, retries and refusals:
// agent-launch-follow-up-identity.spec.ts. The page journey is
// ../../../e2e/launches/agent-launch-follow-up-session.spec.ts.

import { realpathSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launch } from "../../tests/agentLaunchBoundary.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import { followUpOf } from "../../tests/support/followUpSources.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import {
  isolatedSession,
  worktree,
} from "../../tests/support/startSessionLanding.ts";
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

test("Default main · Wait for review sends the context, then the request, then the reporting context, keeps it on the request and leaves the source unchanged", async ({
  dashboard,
  origin,
}) => {
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source, quiet]);
  dashboard.claudeScenario("launched");
  const text = "Is it still slow?";

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: text,
      followUp: followUpOf(source),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call, ...others] = dashboard.claudeLaunchCalls();
  expect(others).toEqual([]);
  expect(call?.cwd).toBe(realpathSync(origin.project));
  expectFollowUpInput(call?.argv.at(-1), {
    context: reportedContext,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    title: text,
    instruction: text,
    followUp: { ...followUpOf(source), context: reportedContext },
  });
  expect(launched.record).not.toHaveProperty("establishedSession");
  // The source stays Done and unchanged.
  expect(stored(dashboard.home).slice(0, 2)).toEqual([source, quiet]);
});

test("a blank follow-up on Default main sends the context and the reporting context, labelled by its launch time", async ({
  dashboard,
}) => {
  keepLaunchRecords(dashboard, [quiet]);
  dashboard.claudeScenario("launched");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: "  ",
      followUp: followUpOf(quiet),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call] = dashboard.claudeLaunchCalls();
  expectFollowUpInput(call?.argv.at(-1), {
    context: quietContext,
    request: launched.record?.request,
    server: dashboard,
  });
  expect(launched.record?.request.title).toMatch(
    /^\d{1,2} [A-Z][a-z]{2}, \d{2}:\d{2}$/,
  );
});

test("Isolated workspace sends its block and the reporting context, then the context and the request", async ({
  dashboard,
  origin,
}) => {
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source]);
  dashboard.claudeScenario("launched");
  const text = "Check the nightly build too";
  const slug = "check-the-nightly-build-too";
  const before = await originMain(origin);

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: text,
      policy: { workspace: "isolated", landing: "review" },
      followUp: followUpOf(source),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const session = isolatedSession(origin.project, slug, "review", before);
  expect(launched.record?.establishedSession).toEqual(session);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, slug)));
  expectFollowUpInput(call?.argv.at(-1), {
    context: reportedContext,
    own: text,
    session,
    request: launched.record?.request,
    server: dashboard,
  });
});

test("a final report longer than the instruction field's limit is sent whole beside a request at that limit", async ({
  dashboard,
}) => {
  const long = "r".repeat(16_000);
  const source = makeMe.aLaunchRecord
    .adHoc({ instruction: "Write it all down", title: "Write it all down" })
    .inClaudeSession({ sessionId: "long-report", shortId: "long" })
    .completedWith({ message: long })
    .markedDoneAt(new Date().toISOString())
    .please();
  keepLaunchRecords(dashboard, [source]);
  dashboard.claudeScenario("launched");
  const text = "q".repeat(4_000);

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: text,
      followUp: followUpOf(source),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const input = dashboard.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
  expect(input).toContain(`- Final report (Completed with attention): ${long}`);
  expect(input.split("\n\n")).toContain(text);
});
