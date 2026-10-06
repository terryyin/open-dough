// Hold an actual existing-directory observation; action-time WS/PTY owns fallback.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import type { APIResponse } from "@playwright/test";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  notRefinedStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { report, storeFile, save, retained } from "./support/retainedReport.ts";
import {
  codexAttaches,
  codexEnded,
  codexTerminalMode,
} from "./support/codexTerminal.ts";
import { processRunning } from "./support/processGroup.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());

for (const loss of ["missing", "unknown", "startup"] as const) {
  test(`attachment ${loss} after an existing-directory observation opens the same passive report, preserves done intent and returns focus`, async ({
    page,
    dashboard,
    codexProtocol: native,
  }) => {
    if (native === undefined) throw new Error("Missing protocol fixture");
    const { record, workspace } = await retained(dashboard, native);
    mkdirSync(workspace);
    const originalDirectory = realpathSync(workspace);
    const doneAt = loss === "missing" ? undefined : "2026-10-01T00:00:00Z";
    save(dashboard.home, [{ ...record, doneAt }]);
    const baseline = readFileSync(storeFile(dashboard.home), "utf8");
    const since = native.calls.length;
    // Preserve the real initial response while the developer holds the page.
    // The actual WS attachment and result HTTP requests are never intercepted.
    let observation: APIResponse | undefined;
    await page.route("**/__agent-launch", async (route) => {
      observation ??= await route.fetch({
        headers: { ...route.request().headers(), origin: dashboard.origin },
      });
      expect(observation.status()).toBe(200);
      await route.fulfill({ response: observation });
    });
    const { card } = await openStoryStagesJourney(page, journey);
    const entry =
      doneAt === undefined
        ? cardSessions(card(notRefinedStory))
        : parts(page)
            .recentlyDone.getByRole("article")
            .filter({ hasText: native.threadId });
    const open = entry.getByRole("button", { name: "Open terminal" });
    await expect(open).toBeVisible();
    await expect(entry).toContainText(
      doneAt === undefined ? "Ready for review" : "Done",
    );
    if (loss === "startup") codexTerminalMode(native, "workspace-loss");
    else {
      rmSync(workspace, { recursive: true });
      if (loss === "unknown") symlinkSync(workspace, workspace);
    }
    const resultRead = page.waitForRequest(
      (request) => new URL(request.url()).pathname === "/__agent-launch/result",
    );
    // The fixture's launch protects the story's card until a published read
    // after its outcome reconciles it.
    await expect(open).toBeEnabled();
    await open.focus();
    await page.keyboard.press("Enter");
    const read = new URL((await resultRead).url());
    expect(read.searchParams.get("session")).toBe(record.session.sessionId);
    expect(read.searchParams.get("host")).toBe("codex");
    const panel = page.getByRole("region", { name: "Final report" });
    await expect(panel.locator(".session-final-report")).toHaveText(report);
    await expect(panel).toContainText(record.session.sessionId);
    await expect(panel).toContainText(
      loss === "unknown"
        ? "saved workspace availability could not be established"
        : "saved workspace is missing",
    );
    await expect(panel.locator(".session-result-body")).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Terminal", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("The session could not be attached", { exact: true }),
    ).toHaveCount(0);
    await expect(entry).toContainText("Shown in final report");
    if (doneAt === undefined)
      await expect(card(notRefinedStory)).toHaveClass(/in-terminal/);
    if (loss === "unknown")
      await expect(panel).not.toContainText("workspace is missing");
    await expect(
      panel.getByRole("button", { name: "Mark as done" }),
    ).toHaveCount(doneAt === undefined ? 1 : 0);
    await page.keyboard.press("Meta+Shift+Escape");
    await expect(panel).toHaveCount(0);
    await expect(open).toBeFocused();
    expect(stored(dashboard.home)[0]?.session).toEqual(record.session);
    expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
    expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
    expect(existsSync(workspace)).toBe(false);
    expect(
      native.calls
        .slice(since)
        .every((call) =>
          [
            "initialize",
            "initialized",
            "thread/read",
            "thread/turns/list",
          ].includes(call.method),
        ),
    ).toBe(true);
    const attempts = codexAttaches(native);
    if (loss === "startup") {
      expect(attempts).toHaveLength(1);
      expect(attempts[0]?.cwd).toBe(originalDirectory);
      expect(attempts[0]?.args).toEqual([
        "resume",
        "--remote",
        record.session.continuation?.endpoint,
        "--cd",
        workspace,
        "--no-alt-screen",
        record.session.sessionId,
      ]);
      await expect
        .poll(() => codexEnded(native, attempts[0]?.pid ?? 0))
        .toBe("workspace lost");
      await expect
        .poll(() => processRunning(attempts[0]?.pid ?? 0))
        .toBe(false);
    } else expect(attempts).toEqual([]);
  });
}
