// Literal editable quick replies, and explicit recovery after an attachment ends.
// Connecting/refused recovery stays with ./terminal-prompts-recovery.spec.ts.
import type { Locator } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../test-support/support/frontendTerminalVoice.ts";
import { directedApplication } from "../../test-support/support/terminalSubstituteApplication.ts";
import { terminalScreen } from "../../test-support/terminalScreen.ts";
import { unfocusedPromptButtons } from "../../test-support/support/terminalVoicePage.ts";
import { tapWhereShown } from "../../test-support/pageLayout.ts";

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
        const { sent } = await openFrontendTerminalVoice(
          page,
          frontendServices,
          {
            twoSessions: false,
            withTranscription: false,
            press,
          },
        );
        const terminal = terminalScreen(page);
        await terminal.writeInput(prefix);
        await terminal.choosePrompt(phrase, { using });
        await expect
          .poll(() => sent.filter((text) => text === phrase))
          .toEqual([phrase]);
        await terminal.expectInputFocused();
        await terminal.expectText(`${prefix}${phrase}`);
        expect(sent.some((text) => /[\r\n]/.test(text))).toBe(false);
        const beforeEdit = sent.length;
        await terminal.replaceLastCharacter("!");
        await terminal.submitInput();
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
      const { sent } = await openFrontendTerminalVoice(page, frontendServices, {
        application: program.application,
        twoSessions: false,
        withTranscription: false,
        press,
      });
      const terminal = terminalScreen(page);
      program.end();
      await terminal.expectStatus("The terminal ended");
      await terminal.choosePrompt("OK", { using });
      await terminal.expectStatus(
        "Choose Open again, then open Prompts again.",
      );
      expect(sent).toEqual([]);
      await terminal.openAgain();
      await terminal.expectText("Claude Code");
      await terminal.choosePrompt("as recommended", { using });
      await expect.poll(() => sent).toEqual(["as recommended"]);
    });
  });
}
