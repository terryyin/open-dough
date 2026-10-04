import { launchResultSchema } from "../src/launchOutcome.ts";
import type { submitCompletion } from "../server/completionReporting.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "./support/cursorStart.ts";
import {
  launch,
  recordsOf,
  markDone as markDoneAtBoundary,
} from "./agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "./support/startOrigin.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { markDone } from "./support/markDone.ts";

const exec = promisify(execFile);

test("Cursor installed report offers local Done without a native stop capability and keeps terminal access", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120000);
  const answer = launchResultSchema.parse(
    JSON.parse(
      (
        await launch(dashboard, {
          source: "open-dough",
          host: "cursor",
          workflow: "execution",
          identity: queuedIdentity,
          title: queuedTitle,
        })
      ).body,
    ),
  );
  expect(answer.kind).toBe("launched");
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  if (record?.request.reporting === undefined)
    throw new Error("Missing Cursor context");
  const context = record.request.reporting;
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  const client = cursor.attaches()[0];
  expect(cursor.input(client?.pid ?? 0)).toContain(context.command);
  expect(client?.args.slice(0, 4)).toEqual([
    "--workspace",
    record.start?.workspace,
    "--resume",
    cursor.sessionId,
  ]);
  const message = path.join(origin.machine, "cursor-reminder.txt");
  writeFileSync(
    message,
    "Finished with a reminder: review the remaining native acceptance gap before release.",
  );
  const receipt = JSON.parse(
    (
      await exec(
        "bash",
        [
          "-c",
          `${context.command} --outcome completed --message-file '${message}'`,
        ],
        { cwd: origin.machine },
      )
    ).stdout,
  ) as Awaited<ReturnType<typeof submitCompletion>>;
  expect(receipt).toMatchObject({
    state: "recorded",
    session: { host: "cursor", sessionId: cursor.sessionId },
  });
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const card = parts(page).taken.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(card.locator(".session-attention-message pre")).toHaveText(
    readFileSync(message, "utf8"),
  );
  await expect(
    card.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Read attention message" }),
  ).toBeVisible();
  const before = cursor.calls().length;
  const listed = cardSessions(card);
  await card.getByRole("button", { name: "Mark as read" }).click();
  // Read, the session stays open on its card, now offering Mark as done.
  await expect(
    card.getByRole("button", { name: "Mark as done" }),
  ).toBeVisible();
  await expect(listed).toHaveCount(1);
  await expect(card.locator(".session-unread-report")).toHaveCount(0);
  const [read] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(read?.doneAt).toBeUndefined();
  expect(read?.reportRead).toBe(receipt.receipt);
  await markDone(card);
  await expect(listed).toHaveCount(0);
  expect(cursor.calls()).toHaveLength(before);
  const [done] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(done?.doneAt).toBeDefined();
  expect(done?.doneProblem).toBeUndefined();
  const recent = parts(page).recentSessions.getByRole("article");
  await expect(recent.locator(".session-state")).toContainText("Done");
  await expect(recent).not.toContainText("Named done-");
  expect(done?.completion?.receipt).toBe(receipt.receipt);
  expect(
    (
      await markDoneAtBoundary(dashboard, {
        source: "open-dough",
        host: "cursor",
        session: "unknown-session",
      })
    ).status,
  ).toBe(404);
});

test("Cursor explicit quiet completion is durable local Done without native stop", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120000);
  const answer = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "execution",
    identity: queuedIdentity,
    title: queuedTitle,
  });
  expect(launchResultSchema.parse(JSON.parse(answer.body)).kind).toBe(
    "launched",
  );
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  const command = record?.request.reporting?.command;
  if (command === undefined)
    throw new Error("Missing Cursor reporting context");
  expect(record?.doneAt).toBeUndefined();
  const before = cursor.calls().length;
  const receipt = JSON.parse(
    (
      await exec("bash", ["-c", `${command} --outcome completed`], {
        cwd: origin.machine,
      })
    ).stdout,
  ) as Awaited<ReturnType<typeof submitCompletion>>;
  const [done] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(done?.completion?.receipt).toBe(receipt.receipt);
  expect(done?.doneAt).toBe(receipt.receivedAt);
  expect(cursor.calls()).toHaveLength(before);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: cursor.sessionId });
  await expect(recent).toContainText("Done");
  await expect(recent.locator(".session-attention-message")).toHaveCount(0);
  await expect(
    recent.getByRole("button", { name: "Read attention message" }),
  ).toHaveCount(0);
});
