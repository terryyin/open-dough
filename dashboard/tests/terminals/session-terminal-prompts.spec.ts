import { test, expect } from "../dashboardTest.ts";
import {
  chooseTerminalPrompt,
  expectTerminalInputFocused,
  expectTerminalText,
  focusTerminalInput,
  insertTerminalText,
  openTerminalAgain,
  pressTerminalKey,
  terminalPromptsControl,
  terminalPromptsMenu,
  terminalStatus,
} from "../terminalScreenPage.ts";
import {
  openTerminalVoice,
  unfocusedPromptButtons,
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
      if (pointer === "phone") await unfocusedPromptButtons(page);
      const { sent } = noteTerminalTraffic(page);
      const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
      const prompts = terminalPromptsControl(panel);
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
        await focusTerminalInput(panel);
        await insertTerminalText(page, prefix);
        if (pointer === "phone") await tapWhereShown(prompts);
        else await prompts.click();
        const menu = terminalPromptsMenu(panel);
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
        await expect
          .poll(() => sent.filter((text) => text === phrase))
          .toEqual([phrase]);
        await expectTerminalInputFocused(panel);
        await expectTerminalText(panel, `${prefix}${phrase}`);
        expect(
          sent.filter((text) => text.includes("\r") || text.includes("\n")),
        ).toHaveLength(phrase === "OK" ? 0 : 1);
        expect(dashboard.claudeAttaches()[0]?.lines).toEqual(
          phrase === "OK" ? [] : ["O!"],
        );
        await pressTerminalKey(page, "Backspace");
        await insertTerminalText(page, "!");
        await pressTerminalKey(page, "Enter");
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
      await focusTerminalInput(panel);
      await pressTerminalKey(page, "Control+z");
      const status = terminalStatus(panel);
      await expect(status).toContainText("The terminal ended");
      await chooseTerminalPrompt(panel, "OK");
      await expect(status).toContainText(
        "Choose Open again, then open Prompts again.",
      );
      expect(sent).toEqual(["\u001a"]);
      await openTerminalAgain(panel);
      await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(2);
      await expectTerminalText(panel, "Claude Code");
      await chooseTerminalPrompt(panel, "as recommended");
      await expect.poll(() => sent).toEqual(["\u001a", "as recommended"]);
      await expectTerminalInputFocused(panel);
      await expect(status).toBeEmpty();
      expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
    });
  });
}
