// An unattached Cursor session whose launch establishes its session, with
// the real installed start (../support/cursorStart.ts) and the fixture
// `cursor-agent`: existing changes in default main are confirmed before
// create-chat, and the first prompt is the "Established session" block, then
// the reporting context, with no skill line and nothing of the developer's;
// an isolated session starts with its new worktree as Cursor's workspace.
// ../agent-launch-ad-hoc-cursor.spec.ts stays the proof of the unattached
// Cursor session that establishes none, and of the blank start with a chosen
// model that is refused.

import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch, recordsOf } from "../agentLaunchBoundary.ts";
import { expect, test } from "../support/cursorStart.ts";
import { dirty, status } from "../support/defaultCheckoutChanges.ts";
import { expectReportingBlock } from "../support/reportingInputAssertions.ts";
import {
  defaultMainSession,
  isolatedSession,
  sessionBlock,
} from "../support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("existing changes are confirmed before Cursor creates anything, and an established session's block and reporting context are the whole first prompt", async ({
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  dirty(origin.project);
  const changes = status(origin.project);
  const asked = {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
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
  const session = defaultMainSession(origin.project, "auto-land", revision);
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
  expect(extra).toEqual([]);
  expectReportingBlock(reporting, record?.request, dashboard);
  expect(prompt).not.toContain("dough-execute-plan ");
  expect(status(origin.project)).toBe(changes);
});

test("with no text and a chosen model, a session that lands automatically starts on that model with its block, while the default choices stay refused", async ({
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const blank = {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    model: "gpt-5.2",
  };
  // The default choices have no first prompt to apply the model with.
  expect(JSON.parse((await launch(dashboard, blank)).body)).toMatchObject({
    kind: "failed",
    reason: "refused",
    explanation:
      "Cursor applies a chosen model with the first instruction. Add an instruction, or use your Cursor setting. Nothing was launched.",
  });
  expect(cursor.calls()).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);

  // The established session's block is a first prompt.
  const policy = { workspace: "default-checkout", landing: "auto-land" };
  expect(
    JSON.parse((await launch(dashboard, { ...blank, policy })).body),
  ).toMatchObject({ kind: "launched" });
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record?.request).toMatchObject({ model: "gpt-5.2", policy });
  expect(record?.request).not.toHaveProperty("instruction");
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const client = cursor.attaches()[0];
  if (client === undefined) throw new Error("Cursor started no client.");
  expect(client.args).toEqual([
    "--workspace",
    origin.project,
    "--resume",
    cursor.sessionId,
    "--model",
    "gpt-5.2",
  ]);
  await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
  expect(cursor.input(client.pid).split("\n\n")[0]).toBe(
    sessionBlock(defaultMainSession(origin.project, "auto-land", revision)),
  );
});

test("an isolated session starts Cursor with the new worktree as its workspace and the same block", async ({
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const revision = (await origin.originGit("rev-parse", "main")).trim();
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
