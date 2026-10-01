// Outside-in review through the real store, HTTP/native boundary and browser.
import { existsSync, readFileSync } from "node:fs";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  notRefinedStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import {
  report,
  storeFile,
  save,
  retained,
  passive,
} from "./support/retainedReport.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());

test("card, Recent and sidebar review the retained report with attention, association and keyboard focus, without continuing", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record, workspace } = await retained(dashboard, native);
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const since = native.calls.length;
  const { card } = await openStoryStagesJourney(page, journey);
  const entry = cardSessions(card(notRefinedStory));
  await expect(entry).toContainText("Ready for review");
  await expect(entry).toContainText("saved workspace is missing");
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(0);
  const open = entry.getByRole("button", { name: "Read final report" });
  await open.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".session-final-report")).toHaveText(report);
  await expect(panel.locator(".session-result-body")).toBeFocused();
  await expect(entry).toContainText("Shown in final report");
  await expect(card(notRefinedStory)).toHaveClass(/in-terminal/);
  await expect(panel).toContainText(record.session.sessionId);
  expect(await page.evaluate(() => "reportExecuted" in window)).toBe(false);
  await page.keyboard.press("Meta+Shift+Escape");
  await expect(panel).toHaveCount(0);
  await expect(open).toBeFocused();
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: native.threadId });
  await recent.getByRole("button", { name: "Read final report" }).click();
  await expect(panel.locator(".session-final-report")).toHaveText(report);
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    recent.getByRole("button", { name: "Read final report" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Sessions", exact: true }).click();
  await parts(page)
    .project.getByRole("radio", { name: "Doughnut", exact: true })
    .check();
  const sidebar = page.getByRole("complementary", { name: "Sessions" });
  const sideOpen = sidebar.getByRole("button", {
    name: notRefinedStory,
    exact: true,
  });
  await sideOpen.click();
  await expect(
    parts(page).project.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await expect(panel.locator(".session-final-report")).toHaveText(report);
  await expect(sideOpen).toHaveAttribute("aria-current", "true");
  await expect(entry).toContainText("Ready for review");
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(sideOpen).toBeFocused();
  await page.reload();
  await expect(entry).toContainText("Ready for review");
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
  expect(existsSync(workspace)).toBe(false);
  passive(native, since);
});

test("changing or closing selection cancels a held report and never shows its text as the next session", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record } = await retained(dashboard, native);
  const next = {
    ...record,
    session: { ...record.session, sessionId: "next-retained-session" },
  };
  save(dashboard.home, [record, next]);
  let fetched: (() => void) | undefined;
  const fetchedAnswer = new Promise<void>((resolve) => {
    fetched = resolve;
  });
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/__agent-launch/result?**", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("session") !==
      record.session.sessionId
    ) {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    fetched?.();
    await held;
    await route.fulfill({ response }).catch(() => undefined);
  });
  const { card } = await openStoryStagesJourney(page, journey);
  const entries = cardSessions(card(notRefinedStory));
  const first = entries.filter({
    has: page.locator(`code:text-is("${record.session.sessionId}")`),
  });
  const second = entries.filter({
    has: page.locator('code:text-is("next-retained-session")'),
  });
  await first.getByRole("button", { name: "Read final report" }).click();
  await fetchedAnswer;
  const protocol = native;
  protocol.threadId = next.session.sessionId;
  protocol.history = [
    {
      id: "next-turn",
      status: "completed",
      items: [
        {
          type: "agentMessage",
          phase: "final_answer",
          text: "Second conversation's own result",
        },
      ],
    },
  ];
  native.observations.set(next.session.sessionId, {
    status: { type: "notLoaded" },
    turns: [{ id: "next-turn", status: "completed" }],
  });
  await second.getByRole("button", { name: "Read final report" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel).toContainText(next.session.sessionId);
  await expect(panel.locator(".session-final-report")).toHaveText(
    "Second conversation's own result",
  );
  release?.();
  await expect(panel.locator(".session-final-report")).toHaveText(
    "Second conversation's own result",
  );
  await expect(panel).not.toContainText("a5df85d90a");
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    second.getByRole("button", { name: "Read final report" }),
  ).toBeFocused();
  expect(stored(dashboard.home).map((value) => value.doneAt)).toEqual([
    undefined,
    undefined,
  ]);
});
