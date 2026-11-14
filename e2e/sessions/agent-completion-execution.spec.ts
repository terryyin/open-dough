// The execution-to-wrap-up continuation uses the installed report and real retained card.
import { launchResultSchema } from "../../dashboard/src/launchOutcome.ts";
import type { submitCompletion } from "../../dashboard/server/completionReporting.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test, expect } from "../../dashboard/tests/support/cursorStart.ts";
import {
  launch,
  recordsOf,
} from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  queuedIdentity,
  queuedTitle,
} from "../../dashboard/tests/support/startOrigin.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import {
  parts,
  sessionUnreadReportOf,
} from "../../dashboard/tests/dashboardPage.ts";
import { markDone } from "../../dashboard/tests/support/markDone.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/tests/pageRequestNotes.ts";
import { openTerminalControl } from "../../dashboard/tests/terminalScreenPage.ts";

const exec = promisify(execFile);

test("execution completion keeps its Taken terminal available until wrap-up, through reload", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
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
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await openUntilRead(page);
  const card = parts(page).taken.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const terminal = openTerminalControl(card);
  await expect(terminal).toBeVisible();
  const before = cursor.calls().length;
  const receipt = JSON.parse(
    (
      await exec("bash", ["-c", `${command} --outcome completed`], {
        cwd: origin.machine,
      })
    ).stdout,
  ) as Awaited<ReturnType<typeof submitCompletion>>;
  await reloadUntilRead(page);
  await expect(terminal).toBeVisible();
  const [reported] = (await recordsOf(
    dashboard,
    "open-dough",
  )) as LaunchRecord[];
  expect(reported?.completion?.receipt).toBe(receipt.receipt);
  expect(reported?.doneAt).toBeUndefined();
  await expect(sessionUnreadReportOf(card)).toHaveCount(0);
  expect(cursor.calls()).toHaveLength(before);
  await reloadUntilRead(page);
  await expect(terminal).toBeVisible();
  // Explicit developer Done remains authoritative before wrap-up.
  await markDone(card);
  await expect(terminal).toHaveCount(0);
  expect(cursor.calls()).toHaveLength(before);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: cursor.sessionId });
  await expect(recent).toContainText("Done");
});
