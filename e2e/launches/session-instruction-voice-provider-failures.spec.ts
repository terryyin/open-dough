import {
  test,
  expect,
} from "../../dashboard/test-support/support/voiceTest.ts";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import { expectClaudeAdHocDraft } from "./claudeLaunchObservation.ts";
import { startSessionField } from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  observeMicrophone,
  recordClip,
} from "../../dashboard/test-support/support/voicePage.ts";
import {
  openVoiceDraft,
  recovered,
  voiceBrowserOptions,
  originalDraft,
} from "../../dashboard/test-support/support/voiceRecovery.ts";
import { instructionProblems } from "../../dashboard/src/instructionTranscription.ts";
test.use({ ...voiceBrowserOptions, installedCatalog: "claude" });
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("explicit retry after refusal appends once without failed text, then editable text reaches Start", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  const { dialog, submit } = await openVoiceDraft(
    page,
    dashboard,
    launchJourney,
  );
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
  const edited = `${originalDraft}\n\nReview before implementing`;
  await startSessionField(dialog).fill(edited);
  expect(dashboard.claudeCalls()).toEqual([]);
  dashboard.claudeScenario("launched");
  const accepted = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await accepted);
  await expect(dialog).toBeHidden();
  expectClaudeAdHocDraft(
    dashboard,
    outcome,
    edited,
    "Open Dough · Ad hoc · Keep this work local Review before imple…",
  );
  expect(provider.calls).toHaveLength(2);
});

test("Cancel while transcribing ends the held provider request and launches nothing", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  const { dialog } = await openVoiceDraft(page, dashboard, launchJourney);
  provider.hold();
  await recordClip(page, dialog);
  await expect.poll(() => provider.calls.length).toBe(1);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect.poll(provider.disconnected).toBe(1);
  expect(dashboard.claudeCalls()).toEqual([]);
});

test.describe("deadline", () => {
  test.use({ transcriptionDeadlineMs: 500 });
  test("the actual 60-second deadline aborts held upstream work and restores typed Start", async ({
    page,
    dashboard,
    provider,
    launchJourney,
  }) => {
    const { dialog, submit } = await openVoiceDraft(
      page,
      dashboard,
      launchJourney,
    );
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
    const edited = `${originalDraft}\n\nReview before implementing`;
    await startSessionField(dialog).fill(edited);
    expect(dashboard.claudeCalls()).toEqual([]);
    dashboard.claudeScenario("launched");
    const accepted = nextAcceptedAttemptId(page);
    await submit();
    const outcome = await settledOutcome(dashboard, await accepted);
    await expect(dialog).toBeHidden();
    expectClaudeAdHocDraft(
      dashboard,
      outcome,
      edited,
      "Open Dough · Ad hoc · Keep this work local Review before imple…",
    );
    expect(provider.calls).toHaveLength(1);
  });
});
