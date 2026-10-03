import { test, expect } from "./support/voiceTest.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { startSessionField } from "./launchCardPage.ts";
import { observeMicrophone, recordClip } from "./support/voicePage.ts";
import {
  openVoiceDraft,
  recovered,
  typedStart,
  voiceBrowserOptions,
  originalDraft,
} from "./support/voiceRecovery.ts";
import {
  instructionProblems,
  instructionTranscriptionFailed,
} from "../src/instructionTranscription.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

for (const failure of [
  {
    name: "authentication refusal",
    status: 401,
    body: "private-provider-diagnostic",
    message: instructionProblems.authentication,
  },
  {
    name: "rate limit",
    status: 429,
    body: "private-provider-diagnostic",
    message: instructionProblems.rateLimit,
  },
  {
    name: "upstream failure",
    status: 500,
    body: "private-provider-diagnostic",
    message: instructionTranscriptionFailed,
  },
  {
    name: "empty transcript",
    status: 200,
    body: JSON.stringify({ text: " " }),
    message: instructionProblems.empty,
  },
  {
    name: "malformed reply",
    status: 200,
    body: "private-provider-diagnostic",
    message: instructionProblems.empty,
  },
  {
    name: "socket failure",
    status: 0,
    body: "",
    message: instructionProblems.network,
  },
]) {
  test(`${failure.name} preserves the draft, releases capture and permits typed Start without reopening`, async ({
    page,
    dashboard,
    provider,
  }) => {
    const dialog = await openVoiceDraft(page, journey);
    if (failure.status === 0) provider.failNetwork();
    else provider.reply(failure.status, failure.body);
    await recordClip(page, dialog);
    await recovered(page, dashboard, provider, dialog, failure.message, 1);
    expect(provider.calls[0]?.bytes).toBeGreaterThan(0);
    await typedStart(dashboard, dialog);
    expect(provider.calls).toHaveLength(1);
  });
}

test("explicit retry after refusal appends once without failed text, then editable text reaches Start", async ({
  page,
  dashboard,
  provider,
}) => {
  const dialog = await openVoiceDraft(page, journey);
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
  }) => {
    const dialog = await openVoiceDraft(page, journey);
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
