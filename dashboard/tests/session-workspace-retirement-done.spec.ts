// Report observation preserves done intent; only deliberate marking changes it.
import { existsSync } from "node:fs";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { machineSessions } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  notRefinedStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { codexAttaches } from "./support/codexTerminal.ts";
import { report, save, retained } from "./support/retainedReport.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());

test("lookup error and result refusal stay uncertain; retry uses the same identity and deliberate done survives polling and concurrent update", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { workspace } = await retained(dashboard, native, true);
  const since = native.calls.length;
  const { card } = await openStoryStagesJourney(page, journey);
  const entry = cardSessions(card(notRefinedStory));
  await expect(entry).toContainText("availability could not be established");
  await expect(entry).not.toContainText("workspace is missing");
  await expect(entry).toContainText("Ready for review");
  const protocol = native;
  protocol.readError = true;
  await entry.getByRole("button", { name: "Read final report" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(
    panel.getByRole("button", { name: "Retry report" }),
  ).toBeVisible();
  await expect(panel.locator(".session-final-report")).toHaveCount(0);
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  protocol.readError = false;
  await panel.getByRole("button", { name: "Retry report" }).click();
  await expect(panel.locator(".session-final-report")).toHaveText(report);
  // A separate record arrives while this result is open; viewing cannot rewrite it.
  const records = stored(dashboard.home);
  const first = records[0];
  if (first === undefined) throw new Error("Missing record");
  save(dashboard.home, [
    ...records,
    {
      ...first,
      session: { ...first.session, sessionId: "concurrent-record" },
      doneAt: "2026-10-01T00:00:00Z",
    },
  ]);
  await panel.getByRole("button", { name: "Mark as done" }).click();
  await expect(panel).toHaveCount(0);
  await expect(entry).toHaveCount(0);
  const doneAt = stored(dashboard.home)[0]?.doneAt;
  expect(doneAt).toBeDefined();
  await machineSessions(dashboard);
  await page.reload();
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: native.threadId });
  await expect(recent).toContainText("Done");
  await recent.getByRole("button", { name: "Read final report" }).click();
  await expect(panel.locator(".session-final-report")).toHaveText(report);
  expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
  expect(
    stored(dashboard.home).find(
      (record) => record.session.sessionId === "concurrent-record",
    )?.doneAt,
  ).toBe("2026-10-01T00:00:00Z");
  expect(existsSync(workspace)).toBe(false);
  // Explicit marking owns native rename/stop, unlike report observation.
  expect(
    native.calls.filter(
      (call) =>
        call.method === "thread/resume" ||
        call.method === "turn/start" ||
        call.method === "thread/start",
    ),
  ).toHaveLength(2);
  expect(codexAttaches(native)).toEqual([]);
  expect(
    native.calls
      .slice(since)
      .filter(
        (call) =>
          call.method === "thread/read" && call.params["includeTurns"] === true,
      )
      .every((call) => call.params["threadId"] === native.threadId),
  ).toBe(true);
});
