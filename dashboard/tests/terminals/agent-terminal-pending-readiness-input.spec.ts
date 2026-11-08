// Phone text input reaches a visible Codex prompt whose readiness the server
// has yet to confirm: the open attachment accepts it as it accepts typing,
// while only a confirmed ready frame reopens a done session.
import { test as voiceTest, expect } from "../support/voiceTest.ts";
import { voiceBrowserOptions } from "../support/voiceRecovery.ts";
import { observeMicrophone, seedVoiceKey } from "../support/voicePage.ts";
import {
  beginTerminalClip,
  stopTerminalClip,
} from "../support/terminalVoicePage.ts";
import { codexProtocol, stored } from "../support/codexLaunch.ts";
import {
  codexAttaches,
  codexLines,
  codexTerminalMode,
} from "../support/codexTerminal.ts";
import { pngA } from "../support/launchAttachmentFixtures.ts";
import { launch, refinementRequest } from "../agentLaunchBoundary.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  notRefinedIdentity,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import { keepProjectLaunchRecords } from "../support/storyLaunchRecord.ts";
import { retainedDoneAt } from "../machineLaunchRecords.ts";
import { tapWhereShown } from "../pageLayout.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import {
  focusByTouch,
  insertDraftButton,
  noteTerminalTraffic,
  openTerminalComposer,
  tapTerminalKey,
  terminalComposerDraft,
} from "../touchTerminalPage.ts";

const test = voiceTest.extend({ codexProtocol });

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

test("dictation, Paste, composer Insert and toolbar keys reach a held Codex frame once without reopening its done session", async ({
  page,
  dashboard,
  provider,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  seedVoiceKey(dashboard.home);
  await launch(dashboard, {
    ...refinementRequest,
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  });
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": stored(dashboard.home).map((record) => ({
      ...record,
      doneAt: retainedDoneAt(),
    })),
  });
  const doneMark = () => stored(dashboard.home)[0]?.doneAt;
  const submitted = () => {
    const pid = codexAttaches(native).at(-1)?.pid;
    return pid === undefined ? [] : codexLines(native, pid);
  };
  const copyText = (text: string) =>
    page.evaluate((value) => navigator.clipboard.writeText(value), text);

  // The reopened native process leaves its synchronized redraw open, so the
  // page never reports a completed frame and readiness stays pending.
  codexTerminalMode(native, "partial");
  await (await openStoryColumnsJourney(page, journey)).settled();
  const { sent } = noteTerminalTraffic(page);
  const shown = recentlyDoneParts(page);
  await tapWhereShown(shown.button);
  // The section header is a disclosure row, not a 44px touch control.
  await shown.header.tap();
  await tapWhereShown(shown.entry(notRefinedStory));
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  const status = panel.getByRole("status");
  await expect(rows).toContainText("retained startup draft");
  await expect(rows).not.toContainText("context left");
  expect(doneMark()).toBeDefined();

  await test.step("a completed transcript is offered once, not retained or submitted", async () => {
    const transcript = "Please figure out by yourself.";
    provider.setText(transcript);
    await beginTerminalClip(page, panel);
    await stopTerminalClip(page, panel);
    await expect.poll(() => sent).toEqual([transcript]);
    await expect(
      panel.getByRole("textbox", { name: "Unsent transcript" }),
    ).toHaveCount(0);
    await expect(status).not.toContainText("was not inserted");
  });

  await test.step("toolbar Paste offers clipboard text once with no reconnect feedback", async () => {
    await focusByTouch(panel);
    await copyText(" Then paste this.");
    await tapTerminalKey(panel, "Paste");
    await expect.poll(() => sent.slice(1)).toEqual([" Then paste this."]);
    await expect(status).toBeEmpty();
  });

  await test.step("toolbar Paste offers a clipboard image's stored path once", async () => {
    await page.evaluate(async (image) => {
      const data = Uint8Array.from(atob(image), (character) =>
        character.charCodeAt(0),
      );
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": new Blob([data], { type: "image/png" }),
        }),
      ]);
    }, pngA.toString("base64"));
    await tapTerminalKey(panel, "Paste");
    await expect(status).toHaveText(/^Image pasted as .+pasted\.png\.$/);
    await expect.poll(() => sent.length).toBe(3);
    await expect(status).toHaveText(`Image pasted as ${sent[2] ?? ""}.`);
  });

  await test.step("composer Insert offers its draft once", async () => {
    await openTerminalComposer(panel);
    await terminalComposerDraft(panel).fill(" Drafted too.");
    await tapWhereShown(insertDraftButton(panel));
    await expect.poll(() => sent.slice(3)).toEqual([" Drafted too."]);
  });

  await test.step("nothing is submitted, and the done mark stays, until Enter", async () => {
    expect(submitted()).toEqual([]);
    expect(doneMark()).toBeDefined();
    const offered = sent.join("");
    await tapTerminalKey(panel, "Enter");
    await expect.poll(submitted).toEqual([offered]);
    await expect.poll(() => sent.slice(4)).toEqual(["\r"]);
    expect(doneMark()).toBeDefined();
  });

  await test.step("toolbar Esc completes the held frame, whose ready screen clears done", async () => {
    await tapTerminalKey(panel, "Esc");
    await expect.poll(doneMark).toBeUndefined();
    await expect.poll(() => sent.slice(5)).toEqual(["\u001b"]);
  });
});
