import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../test-support/support/frontendTerminalVoice.ts";
import { microphoneBrowserOptions } from "../../test-support/support/voiceRecovery.ts";
import { observeMicrophone } from "../../test-support/support/voicePage.ts";
import {
  finishTerminalDictation,
  startTerminalDictation,
  unfocusedPromptButtons,
} from "../../test-support/support/terminalVoicePage.ts";
import {
  expectTerminalInputFocused,
  expectTerminalText,
  insertTerminalText,
  replaceLastTerminalCharacter,
  submitTerminalInput,
} from "../../test-support/terminalScreenPage.ts";
import { tapWhereShown } from "../../test-support/pageLayout.ts";
import {
  expectTerminalActionsFit,
  expectTerminalActionsOrder,
  closeTouchTerminal,
  writeTouchTerminalInput,
} from "../../test-support/support/terminalTouchActionsPage.ts";

test.use({
  ...microphoneBrowserOptions,
  viewport: { width: 390, height: 844 },
  hasTouch: true,
});
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
  await unfocusedPromptButtons(page);
});

test("touch dictation restores input focus and leaves its transcript editable until Enter", async ({
  page,
  frontendServices,
}) => {
  const { panel, sent, transcription } = await openFrontendTerminalVoice(
    page,
    frontendServices,
    { press: tapWhereShown },
  );
  if (transcription === undefined)
    throw new Error("expected transcription answers");
  transcription.answerText("the session header");
  await writeTouchTerminalInput(panel, "Review ");
  await startTerminalDictation(panel, { using: "touch" });
  await finishTerminalDictation(panel, { using: "touch" });
  await expect
    .poll(() => sent.filter((value) => value === "the session header"))
    .toEqual(["the session header"]);
  await expectTerminalText(panel, "Review the session header");
  await expectTerminalInputFocused(panel);
  expect(sent.some((value) => /[\r\n]/.test(value))).toBe(false);
  const beforeEdit = sent.length;
  await insertTerminalText(page, "X");
  await replaceLastTerminalCharacter(panel, " please");
  await submitTerminalInput(panel);
  await expect
    .poll(() => sent.slice(beforeEdit).join(""))
    .toBe("X\u007f please\r");
});

for (const height of [844, 400]) {
  test(`phone terminal actions stay ordered and touch sized at height ${height}`, async ({
    page,
    frontendServices,
  }) => {
    const { panel } = await openFrontendTerminalVoice(page, frontendServices, {
      press: tapWhereShown,
      withTranscription: false,
    });
    await page.setViewportSize({ width: 390, height });
    await expectTerminalActionsOrder(panel, [
      "Dictate into terminal",
      "Prompts",
      "Mark as done",
    ]);
    await expectTerminalActionsFit(
      panel,
      ["Dictate into terminal", "Prompts", "Mark as done", "Close"],
      44,
    );
    await closeTouchTerminal(panel);
  });
}
