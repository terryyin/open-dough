// Active cards and sidebar consume one recorded native observation; Recently
// done retains the saved Done entry without duplicating open card sessions.
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { pausePageClockAt } from "./dashboardTest.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  notRefinedStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { cardSessions, parts, sessionStateOf } from "./dashboardPage.ts";
import {
  expectSidebarSessionShown,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import { test, expect } from "./support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observationStates as states,
  observed,
  passive,
  daemonStarts,
} from "./support/codexObservation.ts";
test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => journey.cleanup());

test("saved Codex states appear on active cards and sidebar while Recently done retains only the closed session, through reload with their attention counts", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  const cases = [
    ["work", { type: "active", activeFlags: [] }, undefined, "Working"],
    [
      "approval",
      { type: "active", activeFlags: ["waitingOnApproval"] },
      undefined,
      "Needs input: Codex is waiting for approval",
    ],
    [
      "input",
      { type: "active", activeFlags: ["waitingOnUserInput"] },
      undefined,
      "Needs input: Codex is waiting for your input",
    ],
    ["reply", { type: "idle" }, "completed", "Ready for review"],
    ["failed", { type: "idle" }, "failed", "Session failed"],
    ["stopped", { type: "idle" }, "interrupted", "Session stopped"],
    ["retained", { type: "notLoaded" }, "completed", "Ready for review"],
    ["blank", { type: "idle" }, undefined, "Awaiting first instruction"],
    [
      "unreadable",
      { type: "idle" },
      undefined,
      "Live observation unavailable: Continue this conversation in Codex",
    ],
    [
      "new-status",
      { type: "futureNativeStatus" },
      undefined,
      "State not recognized: Codex reported native status: futureNativeStatus",
    ],
    [
      "new-flag",
      { type: "active", activeFlags: ["futureFlag"] },
      undefined,
      "State not recognized: Codex reported an unrecognized active status",
    ],
    [
      "new-turn",
      { type: "idle" },
      "futureTurnStatus",
      "State not recognized: Codex reported native turn status: futureTurnStatus",
    ],
    [
      "absent-flags",
      { type: "active" },
      undefined,
      "State not recognized: Codex did not report active status flags",
    ],
    [
      "unreadable-blank",
      { type: "idle" },
      undefined,
      "State not recognized: Codex's latest turn could not be read",
    ],
  ] as const;
  for (const [id, status, turn] of cases)
    observed(
      native,
      id,
      {
        ...status,
        ...("activeFlags" in status
          ? { activeFlags: [...status.activeFlags] }
          : {}),
      },
      turn,
    );
  native.observations.set("unreadable", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32000, message: "Native read refused" },
  });
  const records = cases.map(([id]) => record(dashboard, native, id));
  records.push({
    ...record(dashboard, native, "done"),
    doneAt: new Date().toISOString(),
  });
  observed(native, "done", { type: "idle" }, "completed");
  // The blank pre-resume history observed natively is unreadable, not missing.
  native.observations.set("unreadable-blank", {
    status: { type: "idle" },
    turns: [],
    historyError: { code: -32601, message: "list_turns is not supported yet" },
  });
  records.push(record(dashboard, native, "missing"));
  native.observations.set("missing", {
    status: { type: "notLoaded" },
    turns: [],
    metadataError: { code: -32600, message: "thread not loaded: missing" },
  });
  save(dashboard, records);
  const recordFile = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  const before = readFileSync(recordFile, "utf8");
  await pausePageClockAt(page, new Date());
  const { passOnePace } = watchRecordReads(page);
  const { card } = await openTakenBacklog(page, journey);
  const sidebar = sidebarParts(page);
  await sidebar.button.click();
  const recent = parts(page).recentlyDone;
  const entry = (entries: ReturnType<typeof cardSessions>, id: string) =>
    entries.filter({ has: page.locator(`code:text-is("${id}")`) });
  const check = async () => {
    for (const [id, , , words] of cases) {
      await expect(
        sessionStateOf(entry(cardSessions(card(notRefinedStory)), id)),
      ).toHaveText(words);
      await expect(entry(recent.getByRole("article"), id)).toHaveCount(0);
      await expect
        .poll(() =>
          sidebar.entries
            .getByRole("button")
            .evaluateAll((buttons) =>
              buttons.map(
                (button) => button.getAttribute("title")?.split("\n")[0],
              ),
            ),
        )
        .toContain(words);
      if (
        [
          "unreadable",
          "new-status",
          "new-flag",
          "new-turn",
          "absent-flags",
          "unreadable-blank",
        ].includes(id)
      ) {
        await expect(
          entry(cardSessions(card(notRefinedStory)), id),
        ).not.toHaveClass(/needs-attention/);
        const row = sidebar.entries.filter({
          has: page.locator(`button[title^="${words}"]`),
        });
        await expectSidebarSessionShown(row, words, "unsettled");
      }
    }
    await expect(
      card(notRefinedStory).getByText("6 sessions need attention", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(sidebar.badge).toHaveAccessibleName(
      "6 sessions need attention",
    );
    await expect(
      sessionStateOf(entry(recent.getByRole("article"), "done")),
    ).toHaveText("Done");
    await expect(
      sessionStateOf(
        entry(cardSessions(card(notRefinedStory)), "unreadable-blank"),
      ),
    ).toHaveText("State not recognized: Codex's latest turn could not be read");
    await expect(
      sessionStateOf(entry(cardSessions(card(notRefinedStory)), "missing")),
    ).toHaveText("Session unavailable");
    await expect(cardSessions(card(notRefinedStory))).toHaveCount(
      records.length - 1,
    );
  };
  await check();
  expect(daemonStarts(native)).toEqual([{ cwd: realpathSync(dashboard.home) }]);
  await page.reload();
  await expect(sidebar.button).toBeVisible();
  if (!(await sidebar.sidebar.isVisible())) await sidebar.button.click();
  await check();
  const responses = await states(dashboard);
  expect(
    responses.find((r) => r.session.sessionId === "retained")?.sessionState,
  ).toEqual({
    kind: "available",
    availability: "retained",
    activity: "review",
  });
  expect(readFileSync(recordFile, "utf8")).toBe(before);
  observed(native, "work", {
    type: "active",
    activeFlags: ["waitingOnApproval"],
  });
  await passOnePace();
  await expect(
    sessionStateOf(entry(cardSessions(card(notRefinedStory)), "work")),
  ).toHaveText("Needs input: Codex is waiting for approval");
  await expect(entry(recent.getByRole("article"), "work")).toHaveCount(0);
  await expect(sidebar.badge).toHaveAccessibleName("7 sessions need attention");
  observed(native, "work", { type: "idle" }, "completed");
  await passOnePace();
  await expect(
    sessionStateOf(entry(cardSessions(card(notRefinedStory)), "work")),
  ).toHaveText("Ready for review");
  await expect(sidebar.badge).toHaveAccessibleName("7 sessions need attention");
  passive(native.calls);
  expect(daemonStarts(native)).toEqual([{ cwd: realpathSync(dashboard.home) }]);
  expect(readFileSync(recordFile, "utf8")).toBe(before);
});
