// Phone text input that an ended attachment cannot accept names the panel's
// shown Open again action; reopening sends nothing by itself, and a retained
// transcript is then offered once by Insert transcript. Built frontend against
// directed terminal end and controlled transcription answers.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendTerminalByTouch } from "../../test-support/support/frontendTouchTerminal.ts";
import { installFrontendTranscription } from "../../test-support/support/frontendTranscriptionSubstitutes.ts";
import { directedApplication } from "../../test-support/support/terminalSubstituteApplication.ts";
import { microphoneBrowserOptions } from "../../test-support/support/voiceRecovery.ts";
import {
  expectTerminalText,
  openAgainControl,
  pressTerminalKey,
  terminalStatus,
} from "../../test-support/terminalScreenPage.ts";
import {
  holdCompletedVoiceResponse,
  observeMicrophone,
} from "../../test-support/support/voicePage.ts";
import {
  beginTerminalClip,
  expectNoUnsentTranscript,
  expectUnsentTranscript,
  expectVoiceStatus,
  insertTranscriptControl,
  stopTerminalClip,
} from "../../test-support/support/terminalVoicePage.ts";
import { tapWhereShown } from "../../test-support/pageLayout.ts";
import { copyClipboardText } from "../../test-support/terminalPastePage.ts";
import { phoneLaunchTouchViewport } from "../../test-support/touchLaunchPage.ts";
import {
  focusByTouch,
  tapTerminalKey,
} from "../../test-support/touchTerminalPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test.use({
  ...microphoneBrowserOptions,
  viewport: phoneLaunchTouchViewport.portrait,
  hasTouch: true,
  permissions: ["microphone", "clipboard-read", "clipboard-write"],
});
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("an ended terminal keeps the transcript with Open again feedback, Paste names Open again, and reopening sends nothing until Insert transcript", async ({
  page,
  frontendServices,
}) => {
  const transcript = "Keep this for the reopened terminal.";
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  transcription.answerText(transcript);
  const program = directedApplication("attached ended01\r\nClaude Code\r\n");
  const { panel, sent } = await openFrontendTerminalByTouch(
    page,
    frontendServices,
    makeMe.aLaunchRecord
      .adHoc({
        instruction: "ended",
        title: "Ended terminal input session",
      })
      .inClaudeSession({ sessionId: "ended-session", shortId: "ended01" })
      .please(),
    { application: program.application },
  );
  const status = terminalStatus(panel);
  const insert = insertTranscriptControl(panel);
  const openAgain = openAgainControl(panel);
  await expectTerminalText(panel, "attached ended01");
  await expectTerminalText(panel, "Claude Code");

  await test.step("a transcript completing after the terminal ended stays unsent with feedback naming Open again", async () => {
    const delivery = await holdCompletedVoiceResponse(page);
    await beginTerminalClip(page, panel);
    await stopTerminalClip(page, panel);
    await delivery.ready();
    await focusByTouch(panel);
    await pressTerminalKey(page, "Control+z");
    program.end();
    await expect(status).toContainText("The terminal ended");
    await expect(openAgain).toBeVisible();
    await delivery.release();
    await expectUnsentTranscript(panel, transcript);
    await expectVoiceStatus(
      panel,
      "The transcript was not inserted. Open again, then insert it here or discard it.",
    );
    expect(sent.filter((text) => text === "\u001a")).toEqual(["\u001a"]);
  });

  await test.step("Paste and Insert transcript on the ended terminal send nothing, and Paste names Open again", async () => {
    await copyClipboardText(page, "not for the ended terminal");
    await tapTerminalKey(panel, "Paste");
    await expect(status).toContainText("Tap Open again, then tap Paste again.");
    await tapWhereShown(insert);
    await expectUnsentTranscript(panel, transcript);
    expect(sent.filter((text) => text !== "\u001a")).toEqual([]);
  });

  await test.step("Open again reattaches without sending, and Insert transcript then offers the transcript once", async () => {
    await tapWhereShown(openAgain);
    await expectTerminalText(panel, "Claude Code");
    await expect(openAgain).toHaveCount(0);
    await expectUnsentTranscript(panel, transcript);
    await tapWhereShown(insert);
    await expectNoUnsentTranscript(panel);
    await expect
      .poll(() => sent.filter((text) => text === transcript))
      .toEqual([transcript]);
    await expect(panel).toContainText(transcript);
  });
});
