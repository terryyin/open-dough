// With the settings view open on a quiet machine, the feedback-maintenance
// check sends the revision it holds. A second check is answered unchanged
// (under 1 KiB) and the feedback-maintenance status line stays shown.

import type { Page, Response } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { sessionsRevisionHeader } from "../src/machineSessionsRevision.ts";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough"] });

const section = (page: Page) =>
  page.getByRole("region", { name: "Feedback maintenance", exact: true });

const maintenanceLine = (page: Page) =>
  section(page)
    .getByRole("status")
    .filter({ hasText: "Last automatic launch" });

test("a second feedback-maintenance check on a quiet machine is answered unchanged under 1 KiB", async ({
  page,
}) => {
  await pausePageClockAt(page, new Date());
  await page.goto("/?view=settings");
  await expect(maintenanceLine(page)).toBeVisible();
  const shown = await maintenanceLine(page).innerText();
  await page.waitForLoadState("networkidle");

  const answers: {
    readonly held: boolean;
    readonly unchanged: boolean;
    readonly bytes: number;
  }[] = [];
  const noted = async (response: Response) => {
    const request = response.request();
    if (
      request.method() !== "GET" ||
      new URL(request.url()).pathname !== agentLaunchEndpoint
    )
      return;
    const body = await response.text();
    const answer = JSON.parse(body) as { unchanged?: true };
    answers.push({
      held: request.headers()[sessionsRevisionHeader] !== undefined,
      unchanged: answer.unchanged === true,
      bytes: Buffer.byteLength(body),
    });
  };
  page.on("response", noted);
  try {
    await page.clock.runFor(checkIntervalMs);
    await givePageItsTurns(page);
    await expect.poll(() => answers.length).toBeGreaterThan(0);
    await page.waitForLoadState("networkidle");
  } finally {
    page.off("response", noted);
  }

  expect(answers.length).toBeGreaterThan(0);
  for (const answered of answers) {
    expect(answered.held).toBe(true);
    expect(answered.unchanged).toBe(true);
    expect(answered.bytes).toBeLessThan(1_024);
  }
  await expect(maintenanceLine(page)).toHaveText(shown);
});
