import { launchResultSchema } from "../src/launchOutcome.ts";
import type { submitCompletion } from "../server/completionReporting.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "./support/cursorStart.ts";
import { launch, recordsOf, markDone } from "./agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "./support/startOrigin.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";

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
  expect(cursor.calls().at(-1)?.args.at(-1)).toContain(context.command);
  expect(cursor.calls()[0]?.args).toEqual(["create-chat"]);
  expect(cursor.calls().at(-1)?.args.slice(0, 4)).toEqual([
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
  await card.getByRole("button", { name: "Mark as done" }).click();
  await expect(card.locator(".session-attention-message")).toHaveCount(0);
  expect(cursor.calls()).toHaveLength(before);
  const [done] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(done?.doneAt).toBeDefined();
  expect(done?.completion?.receipt).toBe(receipt.receipt);
  expect(
    (
      await markDone(dashboard, {
        source: "open-dough",
        host: "cursor",
        session: "unknown-session",
      })
    ).status,
  ).toBe(404);
});
