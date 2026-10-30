import { test, expect } from "./support/voiceTest.ts";
import { startSessionField } from "./launchStoryCardPage.ts";
import { observeMicrophone, recordClip } from "./support/voicePage.ts";
import {
  openVoiceDraft,
  recovered,
  typedStart,
  voiceBrowserOptions,
  originalDraft,
} from "./support/voiceRecovery.ts";
import { instructionProblems } from "../src/instructionTranscription.ts";
test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("explicit retry after refusal appends once without failed text, then editable text reaches Start", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  const dialog = await openVoiceDraft(page, dashboard, launchJourney);
  provider.reply(
    403,
    JSON.stringify({
      text: "Stale rejected words",
      error: "private-provider-diagnostic",
    }),
  );
  await recordClip(page, dialog);
  await recovered(
    page,
    dashboard,
    provider,
    dialog,
    instructionProblems.authentication,
    1,
  );
  expect(provider.calls[0]?.bytes).toBeGreaterThan(0);
  provider.setText("Fresh retry only");
  await recordClip(page, dialog);
  await expect(startSessionField(dialog)).toHaveValue(
    `${originalDraft}\n\nFresh retry only`,
  );
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  expect(provider.calls).toHaveLength(2);
  expect(dashboard.claudeCalls()).toEqual([]);
  await typedStart(dashboard, dialog);
  expect(provider.calls).toHaveLength(2);
});

test.describe("deadline", () => {
  test.use({ transcriptionDeadlineMs: 500 });
  test("the actual 60-second deadline aborts held upstream work and restores typed Start", async ({
    page,
    dashboard,
    provider,
    launchJourney,
  }) => {
    const dialog = await openVoiceDraft(page, dashboard, launchJourney);
    provider.hold();
    await recordClip(page, dialog);
    await recovered(
      page,
      dashboard,
      provider,
      dialog,
      instructionProblems.timeout,
      1,
    );
    await expect.poll(provider.disconnected).toBe(1);
    expect(provider.deadlines()).toHaveLength(1);
    expect(provider.deadlines()[0]?.milliseconds).toBe(60_000);
    expect(provider.deadlines()[0]?.stack).toContain("withResponseSignal");
    await typedStart(dashboard, dialog);
    expect(provider.calls).toHaveLength(1);
  });
});
