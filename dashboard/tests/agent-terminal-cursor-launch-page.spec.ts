// The page shows the launch-wait notice, drops typed input, and shows the
// notice again after Close and Open. Once the prompted process exits, the
// ordinary prompt appears. The launch record's first input stays uncertain.
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchCardPage.ts";
import { expect, test as cursorTest } from "./support/cursorStart.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import { waitUntil } from "./support/dashboardServer.ts";
import { keptCursor } from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";
import { expectAdHocReportingInput } from "./support/reportingInputAssertions.ts";

const instruction = "hold this launch";
const notice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";

const test = cursorTest.extend<{ cursor: FakeCursor }>({
  // eslint-disable-next-line no-empty-pattern
  cursor: async ({}, use) => {
    const cursor = installFakeCursor({ holdPrompt: true });
    await use(cursor);
    cursor.cleanup();
  },
});
test.use({ launchTimeoutMs: 1_000 });

test("opening during a running Cursor launch shows the notice, then the ordinary prompt", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  try {
    const original = (await origin.originGit("rev-parse", "main")).trim();
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: original,
      repository: "terryyin/open-dough",
      follows: true,
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
    await startSessionField(dialog).fill(instruction);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();

    // The record is listed while the launch wait is still going. The terminal
    // that opens with the settled launch is the one that must show the notice.
    await expect(page.getByText("Ad hoc session started")).toBeVisible({
      timeout: 20_000,
    });
    const recent = parts(page).recentSessions.getByRole("article");
    await expect(recent).toHaveCount(1);
    const open = recent.getByRole("button", { name: "Open terminal" });
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    await expect(rows).toContainText(notice);
    expect(cursor.attaches()).toEqual([]);
    const held = cursor.heldPrompts();
    expect(held).toHaveLength(1);
    const pid = held[0]?.pid ?? 0;
    expect(processRunning(pid)).toBe(true);

    await panel.locator(".xterm-screen").click();
    await page.keyboard.type("not-yet");
    const started = await waitUntil(() => cursor.attaches().length > 0, {
      timeoutMs: 300,
    });
    expect(started).toBe(false);
    expect(cursor.heldInput(pid)).toBe("");
    expect(processRunning(pid)).toBe(true);
    await expect(rows).toContainText(notice);

    await panel.getByRole("button", { name: "Close", exact: true }).click();
    await expect(panel).toHaveCount(0);
    expect(cursor.attaches()).toEqual([]);
    await open.click();
    await expect(rows).toContainText(notice);
    expect(cursor.attaches()).toEqual([]);
    expect(processRunning(pid)).toBe(true);

    cursor.releasePrompt();
    await expect(rows).toContainText("Add a follow-up");
    await expect(rows).not.toContainText("still working");
    await expect.poll(() => cursor.attaches()).toHaveLength(1);
    const recorded = keptCursor(dashboard.home);
    if (recorded.session.host !== "cursor") {
      throw new Error("The recorded session is not Cursor.");
    }
    expect(cursor.attaches()[0]?.sessionId).toBe(cursor.sessionId);
    expect(cursor.attaches()[0]?.args).toEqual([
      "--workspace",
      recorded.session.continuation.workspace,
      "--resume",
      cursor.sessionId,
    ]);
    await expect.poll(() => processRunning(pid)).toBe(false);
    expect(recorded.firstInput).toMatchObject({
      state: "uncertain",
    });
    expectAdHocReportingInput(
      recorded.firstInput?.instruction ?? "",
      instruction,
      recorded.request,
      dashboard,
    );
  } finally {
    cursor.releasePrompt();
  }
});
