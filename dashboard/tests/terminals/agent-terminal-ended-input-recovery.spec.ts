// Phone text input that an ended attachment cannot accept names the panel's
// shown Open again action; reopening sends nothing by itself, and a retained
// transcript is then offered once by Insert transcript.
import { test, expect } from "../support/voiceTest.ts";
import { voiceBrowserOptions } from "../support/voiceRecovery.ts";
import {
  expectTerminalText,
  openAgainControl,
  pressTerminalKey,
  terminalPanel,
  terminalScreenParts,
  terminalStatus,
} from "../terminalScreenPage.ts";
import {
  holdCompletedVoiceResponse,
  observeMicrophone,
  seedVoiceKey,
} from "../support/voicePage.ts";
import {
  beginTerminalClip,
  stopTerminalClip,
} from "../support/terminalVoicePage.ts";
import { launched } from "../agentTerminalBoundary.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { tapWhereShown } from "../pageLayout.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import {
  focusByTouch,
  noteTerminalTraffic,
  tapTerminalKey,
} from "../touchTerminalPage.ts";

test.use({
  ...voiceBrowserOptions,
  viewport: phoneLaunchTouchViewport.portrait,
  hasTouch: true,
  permissions: ["microphone", "clipboard-read", "clipboard-write"],
});
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("an ended terminal keeps the transcript with Open again feedback, Paste names Open again, and reopening sends nothing until Insert transcript", async ({
  page,
  dashboard,
  provider,
}) => {
  seedVoiceKey(dashboard.home);
  const transcript = "Keep this for the reopened terminal.";
  provider.setText(transcript);
  const title = "Ended terminal input session";
  const native = await launched(dashboard, "open-dough", {
    identity: "SEED-901#ended-terminal-input",
    title,
  });
  await (await openStoryColumnsJourney(page, journey)).settled();
  const sidebar = sessionsSidebarParts(page);
  await tapWhereShown(sidebar.button);
  const { sent } = noteTerminalTraffic(page);
  await tapWhereShown(sidebar.entry(title));
  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
  const status = terminalStatus(panel);
  const retained = panel.getByRole("textbox", { name: "Unsent transcript" });
  const insert = panel.getByRole("button", { name: "Insert transcript" });
  const openAgain = openAgainControl(panel);
  await expectTerminalText(panel, `attached ${native.shortId}`);
  await expectTerminalText(panel, "Claude Code");

  await test.step("a transcript completing after the terminal ended stays unsent with feedback naming Open again", async () => {
    const delivery = await holdCompletedVoiceResponse(page);
    await beginTerminalClip(page, panel);
    await stopTerminalClip(page, panel);
    await delivery.ready();
    await focusByTouch(panel);
    await pressTerminalKey(page, "Control+z");
    await expect(status).toContainText("The terminal ended");
    await expect(openAgain).toBeVisible();
    expect(dashboard.claudeAttaches()[0]?.endedBy).toBe("Ctrl+Z");
    await delivery.release();
    await expect(retained).toHaveValue(transcript);
    await expect(status).toContainText(
      "The transcript was not inserted. Open again, then insert it here or discard it.",
    );
    expect(sent).toEqual(["\u001a"]);
  });

  await test.step("Paste and Insert transcript on the ended terminal send nothing, and Paste names Open again", async () => {
    await page.evaluate(() =>
      navigator.clipboard.writeText("not for the ended terminal"),
    );
    await tapTerminalKey(panel, "Paste");
    await expect(status).toContainText("Tap Open again, then tap Paste again.");
    await tapWhereShown(insert);
    await expect(retained).toHaveValue(transcript);
    expect(sent).toEqual(["\u001a"]);
  });

  await test.step("Open again reattaches without sending, and Insert transcript then offers the transcript once", async () => {
    await tapWhereShown(openAgain);
    await expect.poll(() => dashboard.claudeAttaches().length).toBe(2);
    await expectTerminalText(panel, "Claude Code");
    await expect(openAgain).toHaveCount(0);
    await expect(retained).toHaveValue(transcript);
    await tapWhereShown(insert);
    await expect(retained).toHaveCount(0);
    // The transcript is the first input after the ending keystroke, so
    // reopening sent nothing before it.
    await expect.poll(() => sent).toEqual(["\u001a", transcript]);
    await expect(rows).toContainText(transcript);
    expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
  });
});
