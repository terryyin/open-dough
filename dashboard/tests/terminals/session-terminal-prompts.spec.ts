import { test, expect } from "../dashboardTest.ts";
import {
  openTerminalPrompts,
  openTerminalVoice,
} from "../support/terminalVoicePage.ts";
import { noteTerminalTraffic } from "../touchTerminalPage.ts";
import { tapWhereShown } from "../pageLayout.ts";

for (const pointer of ["desktop", "phone"] as const) {
  test.describe(pointer, () => {
    test.use({
      projectFolders: ["open-dough"],
      viewport:
        pointer === "phone"
          ? { width: 390, height: 844 }
          : { width: 1280, height: 800 },
      hasTouch: pointer === "phone",
    });

    test("common prompts insert literal editable input and require deliberate Enter", async ({
      page,
      dashboard,
      launchJourney,
    }) => {
      const { sent } = noteTerminalTraffic(page);
      const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
      const input = panel.locator(".xterm-helper-textarea");
      const prompts = panel.getByRole("button", {
        name: "Prompts",
        exact: true,
      });
      const actions = panel.getByRole("group", {
        name: "Session actions",
        exact: true,
      });
      await expect(actions.getByRole("button").first()).toHaveAccessibleName(
        "Prompts",
      );
      for (const [phrase, prefix] of [
        ["OK", ""],
        ["as recommended", "Review "],
      ] as const) {
        await input.focus();
        await page.keyboard.type(prefix);
        if (pointer === "phone") await tapWhereShown(prompts);
        else await prompts.click();
        const menu = panel.getByRole("menu", { name: "Prompts", exact: true });
        await expect(menu.getByRole("menuitem")).toHaveText([
          "OK",
          "as recommended",
          "Dictate into terminal",
        ]);
        const choice = menu.getByRole("menuitem", {
          name: phrase,
          exact: true,
        });
        if (pointer === "phone") await tapWhereShown(choice);
        else await choice.click();
        await expect(menu).toHaveCount(0);
        await expect(input).toBeFocused();
        await expect
          .poll(() => sent.filter((text) => text === phrase))
          .toEqual([phrase]);
        await expect(panel.locator(".xterm-rows")).toContainText(
          `${prefix}${phrase}`,
        );
        expect(
          sent.filter((text) => text.includes("\r") || text.includes("\n")),
        ).toHaveLength(phrase === "OK" ? 0 : 1);
        expect(dashboard.claudeAttaches()[0]?.lines).toEqual(
          phrase === "OK" ? [] : ["O!"],
        );
        await page.keyboard.press("Backspace");
        await page.keyboard.type("!");
        await page.keyboard.press("Enter");
        await expect
          .poll(() => dashboard.claudeAttaches()[0]?.lines)
          .toEqual(phrase === "OK" ? ["O!"] : ["O!", "Review as recommende!"]);
      }
    });

    test("an ended attachment rejects a preset, names Open again, and never retries it", async ({
      page,
      dashboard,
      launchJourney,
    }) => {
      const { sent } = noteTerminalTraffic(page);
      const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
      await panel.locator(".xterm-helper-textarea").focus();
      await page.keyboard.press("Control+z");
      const status = panel.getByRole("status");
      await expect(status).toContainText("The terminal ended");
      const menu = await openTerminalPrompts(panel);
      await menu.getByRole("menuitem", { name: "OK", exact: true }).click();
      await expect(menu).toHaveCount(0);
      await expect(status).toContainText(
        "Choose Open again, then open Prompts again.",
      );
      expect(sent).toEqual(["\u001a"]);
      await panel
        .getByRole("button", { name: "Open again", exact: true })
        .click();
      await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(2);
      await expect(panel.locator(".xterm-rows")).toContainText("Claude Code");
      const recovered = await openTerminalPrompts(panel);
      await recovered
        .getByRole("menuitem", { name: "as recommended", exact: true })
        .click();
      await expect.poll(() => sent).toEqual(["\u001a", "as recommended"]);
      await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
      await expect(status).toBeEmpty();
      expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
    });
  });
}
