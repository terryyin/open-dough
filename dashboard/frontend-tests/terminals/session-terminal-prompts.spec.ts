// Common prompts insert literal editable input through an attached-terminal
// substitute; an ended attachment rejects a preset and names Open again.
// Connecting/refused prompt recovery stays with ../terminal-prompts-recovery.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../tests/support/frontendTerminalVoice.ts";
import { directedApplication } from "../../tests/support/terminalSubstituteApplication.ts";
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
} from "../../tests/terminalScreenPage.ts";
import { unfocusedPromptButtons } from "../../tests/support/terminalVoicePage.ts";
import { tapWhereShown } from "../../tests/pageLayout.ts";

for (const pointer of ["desktop", "phone"] as const) {
  test.describe(pointer, () => {
    test.use({
      viewport:
        pointer === "phone"
          ? { width: 390, height: 844 }
          : { width: 1280, height: 800 },
      hasTouch: pointer === "phone",
    });

    test("common prompts insert literal editable input and require deliberate Enter", async ({
      page,
      frontendServices,
    }) => {
      if (pointer === "phone") await unfocusedPromptButtons(page);
      const { panel, sent } = await openFrontendTerminalVoice(
        page,
        frontendServices,
        {
          twoSessions: false,
          withTranscription: false,
          ...(pointer === "phone" ? { press: tapWhereShown } : {}),
        },
      );
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
        const submits = sent.filter(
          (text) => text.includes("\r") || text.includes("\n"),
        );
        expect(submits).toHaveLength(phrase === "OK" ? 0 : 1);
        await pressTerminalKey(page, "Backspace");
        await insertTerminalText(page, "!");
        await pressTerminalKey(page, "Enter");
        await expect
          .poll(() =>
            sent.filter((text) => text.includes("\r") || text.includes("\n")),
          )
          .toHaveLength(phrase === "OK" ? 1 : 2);
      }
    });

    test("an ended attachment rejects a preset, names Open again, and never retries it", async ({
      page,
      frontendServices,
    }) => {
      const program = directedApplication(
        "attached voicea01\r\nClaude Code\r\n",
      );
      const { panel, sent } = await openFrontendTerminalVoice(
        page,
        frontendServices,
        {
          application: program.application,
          twoSessions: false,
          withTranscription: false,
          ...(pointer === "phone" ? { press: tapWhereShown } : {}),
        },
      );
      await focusTerminalInput(panel);
      await pressTerminalKey(page, "Control+z");
      // Ending keystroke reaches the substitute; then end the attachment.
      program.end();
      const status = terminalStatus(panel);
      await expect(status).toContainText("The terminal ended");
      await chooseTerminalPrompt(panel, "OK");
      await expect(status).toContainText(
        "Choose Open again, then open Prompts again.",
      );
      expect(sent.filter((text) => text !== "\u001a")).toEqual([]);
      await openTerminalAgain(panel);
      await expectTerminalText(panel, "Claude Code");
      await chooseTerminalPrompt(panel, "as recommended");
      await expect
        .poll(() => sent.filter((text) => text === "as recommended"))
        .toEqual(["as recommended"]);
      await expectTerminalInputFocused(panel);
      await expect(status).toBeEmpty();
    });
  });
}
