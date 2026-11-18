// Keyboard access to terminal actions and the quick-reply menu.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../test-support/support/frontendTerminalVoice.ts";
import { terminalScreen } from "../../test-support/terminalScreen.ts";

test("terminal Tab remains input", async ({ page, frontendServices }) => {
  const { sent } = await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  const terminal = terminalScreen(page);
  await terminal.writeInput("Review ");
  await terminal.expectInputFocused();
  await terminal.pressKey("Tab");
  await expect.poll(() => sent).toContain("\t");
});

test("terminal input describes the keyboard shortcut to dictation", async ({
  page,
  frontendServices,
}) => {
  await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  const terminal = terminalScreen(page);
  await terminal.expectInputDescription(
    /Alt\+F10.*Tab to Dictate into terminal/,
  );
});

test("keyboard action access reaches dictation and quick replies, and Escape restores the menu trigger", async ({
  page,
  frontendServices,
}) => {
  await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  const terminal = terminalScreen(page);
  await terminal.focusActions();
  await terminal.expectActionsFocused();
  await terminal.focusDictation();
  await terminal.expectActionFocused("Dictate into terminal");
  await terminal.openPrompts({ using: "keyboard" });
  await terminal.expectPromptFocused("OK");
  await terminal.dismissPrompts();
  await terminal.expectPromptsClosed();
  await terminal.expectActionFocused("Prompts");
  await terminal.returnToDictation();
  await terminal.expectActionFocused("Dictate into terminal");
});

test("quick replies contain only the fixed phrases", async ({
  page,
  frontendServices,
}) => {
  await openFrontendTerminalVoice(page, frontendServices, {
    withTranscription: false,
  });
  const terminal = terminalScreen(page);
  await terminal.openPrompts();
  await terminal.expectPromptChoices([
    "OK",
    "as recommended",
    "Try again",
    "Resume",
    "Please explain",
  ]);
});
