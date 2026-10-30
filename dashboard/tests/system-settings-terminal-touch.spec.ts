// Entering and leaving System settings by touch preserves one live native
// terminal attachment and its input across viewport changes.
import { readFileSync } from "node:fs";
import { expect, test } from "./support/pageTest.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { addProjectOnPage } from "./support/projectAddPage.ts";
import { startSessionDialog } from "./launchStoryCardPage.ts";
import { processRunning } from "./support/processGroup.ts";
import { settings, back } from "./support/systemSettingsPage.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { focusByTouch } from "./touchTerminalPage.ts";
import { readSetting } from "./support/settingsTouchPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} settings with an attached terminal`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("entering, reading and leaving settings by touch keeps the exact native attachment and input", async ({
    page,
  }) => {
    const server = await fixture.start("preview");
    await page.goto(server.baseURL);
    // Fixture setup launches one disposable native stand-in through the
    // real page/server path; touch launch itself is owned by slice 2.
    await addProjectOnPage(page);
    await page
      .getByRole("button", { name: "Start session in Sample App" })
      .click();
    await startSessionDialog(page, "Sample App")
      .getByRole("button", { name: "Start", exact: true })
      .click();
    const terminal = page.getByRole("region", {
      name: "Terminal",
      exact: true,
    });
    const rows = terminal.locator(".xterm-rows");
    await terminal.scrollIntoViewIfNeeded();
    await expect(rows).toContainText("attached");
    await focusByTouch(terminal);
    await page.keyboard.type("before touch settings");
    await page.keyboard.press("Enter");
    await expect(rows).toContainText("echo before touch settings");
    const attach = server.claudeAttaches()[0];
    expect(attach).toBeDefined();
    if (attach === undefined)
      throw new Error("The native terminal did not attach.");
    const identity = await terminal
      .locator(".side-panel-names code")
      .textContent();
    const before = readFileSync(fixture.configurationFile("preview"), "utf8");
    await page.locator(".page-header").scrollIntoViewIfNeeded();
    await tapWhereShown(settings(page));
    await expect(terminal).toBeHidden();
    await readSetting(
      page
        .getByRole("region", { name: "OpenAI", exact: true })
        .getByRole("status"),
    );
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await page.setViewportSize(landscape);
    await readSetting(
      page.getByRole("heading", { name: "Terminal theme", exact: true }),
    );
    expect(server.claudeAttaches()).toHaveLength(1);
    expect(server.claudeAttaches()[0]?.pid).toBe(attach.pid);
    expect(server.claudeAttaches()[0]?.endedBy).toBeUndefined();
    expect(processRunning(attach.pid)).toBe(true);
    await tapWhereShown(back(page));
    await expect(settings(page)).toBeFocused();
    await expect(
      page.getByRole("radio", { name: "Sample App", exact: true }),
    ).toBeChecked();
    await page.setViewportSize(portrait);
    await terminal.scrollIntoViewIfNeeded();
    await expect(rows).toContainText("echo before touch settings");
    await expect(terminal.locator(".side-panel-names code")).toHaveText(
      identity ?? "",
    );
    await focusByTouch(terminal);
    await page.keyboard.type("after touch settings");
    await page.keyboard.press("Enter");
    await expect(rows).toContainText("echo after touch settings");
    expect(server.claudeAttaches()).toHaveLength(1);
    expect(server.claudeAttaches()[0]?.lines).toEqual([
      "before touch settings",
      "after touch settings",
    ]);
    expect(server.claudeAttaches()[0]?.endedBy).toBeUndefined();
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(server.claudeStopCalls()).toEqual([]);
    expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
      before,
    );
  });
});
