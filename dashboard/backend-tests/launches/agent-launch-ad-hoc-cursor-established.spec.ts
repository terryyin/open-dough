// An unattached Cursor session whose launch establishes its session, with
// the real installed start (../../test-support/support/cursorStart.ts) and the fixture
// `cursor-agent`: existing changes in the execution checkout are confirmed before
// create-chat, and the first prompt is the "Established session" block, then
// the reporting context and developer instruction, with no skill line;
// an isolated session starts with its new worktree as Cursor's workspace.
// ../../../e2e/launches/agent-launch-ad-hoc-cursor.spec.ts stays the proof of the unattached
// Cursor session that establishes none, and of the blank start with a chosen
// model that is refused.

import { launchStoryIdentity } from "../../test-support/support/unattachedLaunchAssertions.ts";
import { existsSync, realpathSync, rmSync } from "node:fs";
import path from "node:path";
import type { LaunchResult } from "../../src/agentLaunch.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { expect, test } from "../../test-support/support/cursorStart.ts";
import {
  dirty,
  status,
} from "../../test-support/support/executionCheckoutChanges.ts";
import { expectReportingBlock } from "../../test-support/support/reportingInputAssertions.ts";
import {
  executionCheckoutSession,
  isolatedSession,
  sessionBlock,
} from "../../test-support/support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("existing changes are confirmed before Cursor creates anything, then the established session's block precedes the developer's instruction", async ({
  dashboard,
  origin,
  cursor,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  dirty(origin.project);
  const changes = status(origin.project);
  const asked = {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: "Explain these changes",
    policy: { workspace: "default-checkout", landing: "auto-land" },
  };
  const found = JSON.parse((await launch(dashboard, asked)).body) as {
    kind: string;
    count: number;
    fingerprint: string;
  };
  expect(found).toMatchObject({ kind: "existing-changes", count: 4 });
  expect(cursor.calls()).toEqual([]);

  expect(
    JSON.parse(
      (
        await launch(dashboard, {
          ...asked,
          existingChanges: found.fingerprint,
        })
      ).body,
    ),
  ).toMatchObject({ kind: "launched" });
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  const session = executionCheckoutSession(
    origin.project,
    "auto-land",
    revision,
  );
  expect(record?.establishedSession).toEqual(session);
  expect(record?.request).toMatchObject({ policy: asked.policy });
  expect(JSON.stringify(record)).not.toContain("existingChanges");

  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  expect(cursor.calls()[0]?.cwd).toBe(realpathSync(origin.project));
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const client = cursor.attaches()[0];
  if (client === undefined) throw new Error("Cursor started no client.");
  expect(client.args.slice(0, 2)).toEqual(["--workspace", origin.project]);
  // The client records the prompt once its return submits it.
  await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
  const prompt = cursor.input(client.pid).replace(/\r$/u, "");
  const [block, reporting, ...extra] = prompt.split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expect(extra).toEqual([
    `Taken story: ${launchStoryIdentity(record)}`,
    asked.instruction,
  ]);
  expectReportingBlock(reporting, record?.request, dashboard);
  expect(prompt).not.toContain("dough-execute-plan ");
  expect(status(origin.project)).toBe(changes);
});

test("Cursor refuses a chosen model on a blank start with either landing policy", async ({
  dashboard,
  origin,
  cursor,
}) => {
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const blank = {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    model: "gpt-5.2",
  };
  const policy = { workspace: "default-checkout", landing: "auto-land" };
  for (const request of [blank, { ...blank, policy }])
    expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
      kind: "failed",
      reason: "refused",
      explanation:
        "Cursor applies a chosen model with the first instruction. Add an instruction, or use your Cursor setting. Nothing was launched.",
    });
  expect(cursor.calls()).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(before);
});

test("an isolated session starts Cursor with the new worktree as its workspace and the same block", async ({
  dashboard,
  origin,
  cursor,
}) => {
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const slug = "tidy-the-readme-wording";
  expect(
    JSON.parse(
      (
        await launch(dashboard, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          instruction: "Tidy the README wording",
          policy: { workspace: "isolated", landing: "review" },
        })
      ).body,
    ),
  ).toMatchObject({ kind: "launched" });
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  expect(revision).not.toBe(before);
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    revision,
    "cursor",
  );
  expect(record?.establishedSession).toEqual(session);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  expect(cursor.calls()[0]?.cwd).toBe(realpathSync(session.workspace));
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const client = cursor.attaches()[0];
  if (client === undefined) throw new Error("Cursor started no client.");
  expect(client.args.slice(0, 2)).toEqual(["--workspace", session.workspace]);
  await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
  expect(cursor.input(client.pid).split("\n\n")[0]).toBe(sessionBlock(session));
});

test("a missing Cursor workspace is reported with its path instead of cursor-agent missing", async ({
  dashboard,
  origin,
  cursor,
}) => {
  // The real start establishes its workspace, but invalid external output
  // keeps the native launch unconfirmed without opening a client.
  cursor.queueCreateChatId("not-a-session-id");
  expect(
    JSON.parse(
      (
        await launch(dashboard, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          policy: { workspace: "isolated", landing: "review" },
        })
      ).body,
    ),
  ).toMatchObject({ kind: "uncertain", reason: "unconfirmed" });
  const [attempt] = await attempts(dashboard);
  const workspace = path.join(origin.project, ".worktrees/session");
  expect(existsSync(workspace)).toBe(true);
  rmSync(workspace, { recursive: true });
  const answer = JSON.parse(
    (await continued(dashboard, attempt?.id ?? "")).body,
  ) as Extract<LaunchResult, { kind: "failed" }>;
  expect(answer).toMatchObject({
    kind: "failed",
    reason: "folder-not-found",
    sessionStartKept: true,
  });
  expect(answer.explanation).toContain(workspace);
  expect(answer.explanation).not.toContain("Install and authenticate");
  expect(existsSync(workspace)).toBe(false);
  expect(cursor.calls()).toHaveLength(1);
});
