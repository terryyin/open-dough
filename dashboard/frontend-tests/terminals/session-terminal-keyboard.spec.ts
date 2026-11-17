// Keyboard access to terminal actions and the quick-reply menu.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../tests/support/frontendTerminalVoice.ts";
import {
  dismissTerminalPrompts,
  expectTerminalActionFocused,
  expectTerminalActionsFocused,
  expectTerminalInputDescription,
  expectTerminalInputFocused,
  expectTerminalPromptChoices,
  expectTerminalPromptFocused,
  expectTerminalPromptsClosed,
  focusTerminalActions,
  focusTerminalDictation,
  openTerminalPrompts,
  pressTerminalKey,
  returnToTerminalDictation,
  writeTerminalInput,
} from "../../tests/terminalScreenPage.ts";

test("terminal Tab remains input", async ({ page, frontendServices }) => {
  const { panel, sent } = await openFrontendTerminalVoice(
    page,
    frontendServices,
    { withTranscription: false },
  );
  await writeTerminalInput(panel, "Review ");
  await expectTerminalInputFocused(panel);
  await pressTerminalKey(page, "Tab");
  await expect.poll(() => sent).toContain("\t");
});

test("terminal input describes the keyboard shortcut to dictation", async ({
  page,
  frontendServices,
}) => {
  const { panel } = await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  await expectTerminalInputDescription(
    panel,
    /Alt\+F10.*Tab to Dictate into terminal/,
  );
});

test("keyboard action access reaches dictation and quick replies, and Escape restores the menu trigger", async ({
  page,
  frontendServices,
}) => {
  const { panel } = await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  await focusTerminalActions(panel);
  await expectTerminalActionsFocused(panel);
  await focusTerminalDictation(panel);
  await expectTerminalActionFocused(panel, "Dictate into terminal");
  await openTerminalPrompts(panel, { using: "keyboard" });
  await expectTerminalPromptFocused(panel, "OK");
  await dismissTerminalPrompts(panel);
  await expectTerminalPromptsClosed(panel);
  await expectTerminalActionFocused(panel, "Prompts");
  await returnToTerminalDictation(panel);
  await expectTerminalActionFocused(panel, "Dictate into terminal");
});

test("quick replies contain only the fixed phrases", async ({
  page,
  frontendServices,
}) => {
  const { panel } = await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  await openTerminalPrompts(panel);
  await expectTerminalPromptChoices(panel, [
    "OK",
    "as recommended",
    "Try again",
    "Resume",
    "Please explain",
  ]);
});
