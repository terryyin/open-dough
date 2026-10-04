// Actual Start session, browser focus/navigation and shared done/reopen owners.
// Native protocol and ordinary CLI replies are substitutes, never record writers.
import { realpathSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { openTakenBacklog, startSessionField } from "./launchCardPage.ts";
import { parts } from "./dashboardPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import {
  codexAttaches,
  codexEnded,
  codexLines,
  expectCodexHungUp,
} from "./support/codexTerminal.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { markDone } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough", "pygardon"] });
let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

for (const text of ["why is the\nCI\t slow?", "", " \t\n "]) {
  test(`Codex Start session ${JSON.stringify(text)} retains identity through reload/restart, navigation and done/reopen`, async ({
    page,
    dashboard,
    codexProtocol,
    machine,
    github,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const blank = text.trim() === "";
    // Exercise the version-matched persist-before-list_turns refusal as well.
    if (text === "")
      native.blankHistoryError = {
        code: -32601,
        message: "list_turns is not supported yet",
      };
    native.beforeRead = (includeTurns) => {
      if (includeTurns)
        expect(stored(dashboard.home)[0]?.firstInput).toEqual({
          state: "awaiting",
          intent: "blank",
        });
    };
    await openTakenBacklog(page, journey);
    const start = page.getByRole("button", {
      name: "Start session in Open Dough",
    });
    await start.click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
    await expect(dialog).toHaveAccessibleName(
      "Start a session in Open Dough in Codex",
    );
    await expect(dialog.getByRole("combobox", { name: "Model" })).toHaveValue(
      "",
    );
    await startSessionField(dialog).fill(text);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    const panel = page.getByRole("region", { name: "Terminal" });
    const recent = parts(page).recentSessions.getByRole("article");
    await expect(panel.locator(".xterm-rows")).toContainText(
      "GPT-6.1-Sol default",
    );
    await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
    await expect(recent).toHaveCount(1);
    const saved = stored(dashboard.home)[0];
    if (saved?.session.host !== "codex")
      throw new Error("Missing saved Codex record.");
    const label = saved.request.title;
    expect(label).toMatch(
      blank ? /^\d{1,2} \w{3}, \d\d:\d\d$/ : /^why is the CI slow\?$/,
    );
    await expect(recent.getByRole("heading")).toHaveText(label);
    await expect(panel.getByRole("heading")).toHaveText(label);
    await expect(panel).toContainText(`Ad hoc session ${native.threadId}`);
    await expect(recent).toContainText(
      blank ? "Opened without an instruction" : "First input accepted",
    );
    if (blank) await expect(recent).not.toContainText("First input accepted");
    expect(saved.firstInput).toEqual(
      blank
        ? { state: "not-requested", intent: "blank" }
        : { state: "confirmed", instruction: text, turnId: "native-turn-id" },
    );
    expect(saved).not.toHaveProperty("start");
    expect(saved).not.toHaveProperty("preparation");
    expect(saved.request).not.toHaveProperty("identity");
    expect(saved.request).not.toHaveProperty("model");
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toEqual([
      {
        method: "thread/start",
        params: { cwd: path.join(dashboard.home, "git", "open-dough") },
      },
    ]);
    const inputs = native.calls.filter((call) => call.method === "turn/start");
    expect(inputs).toEqual(
      blank
        ? []
        : [
            {
              method: "turn/start",
              params: {
                threadId: native.threadId,
                input: [{ type: "text", text }],
              },
            },
          ],
    );
    if (blank)
      expect(
        native.calls.filter(
          (call) =>
            call.method === "thread/read" &&
            call.params["includeTurns"] === true,
        ),
      ).toEqual([
        {
          method: "thread/read",
          params: { threadId: native.threadId, includeTurns: true },
        },
      ]);
    expect(native.history).toHaveLength(blank ? 0 : 1);
    // Vendor zero-turn retained metadata is the observation precondition only.
    native.observations.set(native.threadId, {
      status: { type: "notLoaded" },
      turns: blank ? [] : [{ id: "native-turn-id", status: "completed" }],
    });
    const attached = codexAttaches(native)[0];
    expect(attached?.cwd).toBe(
      realpathSync(saved.session.continuation?.workspace ?? ""),
    );
    expect(attached?.args).toEqual([
      "resume",
      "--remote",
      saved.session.continuation?.endpoint,
      "--cd",
      saved.session.continuation?.workspace,
      "--no-alt-screen",
      native.threadId,
    ]);
    await panel.getByRole("button", { name: "Close", exact: true }).click();
    await expect(start).toBeFocused();
    await expect
      .poll(() => codexEnded(native, attached?.pid ?? 0))
      .toBe("SIGHUP");
    expect(codexLines(native, attached?.pid ?? 0)).toEqual([]);
    await page.reload();
    await expect(recent.locator(".session-state")).toHaveText(
      blank ? "Awaiting first instruction" : "Ready for review",
    );
    expect(stored(dashboard.home)[0]).toEqual(saved);
    const port = Number(new URL(dashboard.baseURL).port);
    await dashboard.close();
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      github,
      codexProtocol,
      port,
    });
    try {
      await page.reload();
      await expect(recent).toContainText(native.threadId);
      await expect(recent.locator(".session-state")).toHaveText(
        blank ? "Awaiting first instruction" : "Ready for review",
      );
      expect(stored(restarted.home)[0]).toEqual(saved);
      await parts(page)
        .project.getByRole("radio", { name: "Pygardon", exact: true })
        .check();
      const sidebar = sidebarParts(page);
      await sidebar.button.click();
      await expect(sidebar.entries).toHaveCount(1);
      await sidebar.entry(label).click();
      await expect(
        parts(page).project.getByRole("radio", {
          name: "Open Dough",
          exact: true,
        }),
      ).toBeChecked();
      await expect(recent.getByText("Shown in terminal")).toBeVisible();
      await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
      await expect(sidebar.entry(label)).toHaveAttribute(
        "aria-current",
        "true",
      );
      // Slice 3: the panel will ask (no report); use markDoneAnyway then.
      await markDone(panel);
      await expect(panel).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(recent.locator(".session-state")).toHaveText("Done");
      expect(native.names.get(native.threadId)).toBe(
        `done-${saved.session.name}`,
      );
      expect(stored(restarted.home)[0]?.doneAt).toBeDefined();
      await page.reload();
      await expect(recent.locator(".session-state")).toHaveText("Done");
      await recent.getByRole("button", { name: "Open terminal" }).click();
      await expect(panel.locator(".xterm-rows")).toContainText(
        "GPT-6.1-Sol default",
      );
      await expect
        .poll(() => stored(restarted.home)[0]?.doneAt)
        .toBeUndefined();
      await expect(sidebar.entries).toHaveCount(1);
      await expect(recent.locator(".session-state")).not.toHaveText("Done");
      expect(
        codexAttaches(native).every(
          (attach) => attach.args.at(-1) === native.threadId,
        ),
      ).toBe(true);
      expect(
        native.calls.filter((call) => call.method === "thread/start"),
      ).toHaveLength(1);
      expect(
        native.calls.filter((call) => call.method === "turn/start"),
      ).toEqual(inputs);
      expect(
        native.calls.filter((call) => call.method === "turn/interrupt"),
      ).toEqual([]);
      await panel.getByRole("button", { name: "Close", exact: true }).click();
      for (const attach of codexAttaches(native)) {
        await expectCodexHungUp(native, attach.pid);
      }
    } finally {
      await restarted.close();
    }
  });
}
