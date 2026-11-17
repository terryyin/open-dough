// Literal editable quick replies, and explicit recovery after an attachment ends.
// Connecting/refused recovery stays with ../terminal-prompts-recovery.spec.ts.
import type { Locator } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../tests/support/frontendTerminalVoice.ts";
import { directedApplication } from "../../tests/support/terminalSubstituteApplication.ts";
import {
  chooseTerminalPrompt,
  expectTerminalInputFocused,
  expectTerminalText,
  openTerminalAgain,
  replaceLastTerminalCharacter,
  submitTerminalInput,
  terminalStatus,
  writeTerminalInput,
} from "../../tests/terminalScreenPage.ts";
import { unfocusedPromptButtons } from "../../tests/support/terminalVoicePage.ts";
import { tapWhereShown } from "../../tests/pageLayout.ts";

const variants = [
  {
    name: "desktop",
    using: "mouse",
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    press: (control: Locator) => control.click(),
  },
  {
    name: "phone",
    using: "touch",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    press: tapWhereShown,
  },
] as const;

for (const { name, using, viewport, hasTouch, press } of variants) {
  test.describe(name, () => {
    test.use({ viewport, hasTouch });
    test.beforeEach(async ({ page }) => {
      await unfocusedPromptButtons(page);
    });

    for (const { phrase, prefix } of [
      { phrase: "OK", prefix: "" },
      { phrase: "as recommended", prefix: "Review " },
      { phrase: "Try again", prefix: "Review " },
      { phrase: "Resume", prefix: "Review " },
      { phrase: "Please explain", prefix: "Review " },
    ]) {
      test(`${phrase} inserts literal editable input and requires deliberate Enter`, async ({
        page,
        frontendServices,
      }) => {
        const { panel, sent } = await openFrontendTerminalVoice(
          page,
          frontendServices,
          {
            twoSessions: false,
            withTranscription: false,
            press,
          },
        );
        await writeTerminalInput(panel, prefix);
        await chooseTerminalPrompt(panel, phrase, { using });
        await expect
          .poll(() => sent.filter((text) => text === phrase))
          .toEqual([phrase]);
        await expectTerminalInputFocused(panel);
        await expectTerminalText(panel, `${prefix}${phrase}`);
        expect(sent.some((text) => /[\r\n]/.test(text))).toBe(false);
        const beforeEdit = sent.length;
        await replaceLastTerminalCharacter(panel, "!");
        await submitTerminalInput(panel);
        await expect
          .poll(() => sent.slice(beforeEdit).join(""))
          .toBe("\u007f!\r");
      });
    }

    test("an ended attachment rejects a preset and recovery requires a new choice", async ({
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
          press,
        },
      );
      program.end();
      const status = terminalStatus(panel);
      await expect(status).toContainText("The terminal ended");
      await chooseTerminalPrompt(panel, "OK", { using });
      await expect(status).toContainText(
        "Choose Open again, then open Prompts again.",
      );
      expect(sent).toEqual([]);
      await openTerminalAgain(panel);
      await expectTerminalText(panel, "Claude Code");
      await chooseTerminalPrompt(panel, "as recommended", { using });
      await expect.poll(() => sent).toEqual(["as recommended"]);
    });
  });
}
