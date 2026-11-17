// Built UI, native synthetic microphone, explicit transcription/settings/notes
// substitutes. Recovery preserves drafts and releases abandoned microphone work.
import {
  expect,
  test,
  openFrontendTakenBacklog,
} from "../../tests/support/frontendApp.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { installFrontendTranscription } from "../../tests/support/frontendTranscriptionSubstitutes.ts";
import { installFrontendSettingsSubstitutes } from "../../tests/support/frontendSettingsSubstitutes.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { storyNoteVoicePage } from "../../tests/support/storyNoteVoicePage.ts";
import {
  observeMicrophone,
  stoppedTracks,
} from "../../tests/support/voicePage.ts";
import { microphoneBrowserOptions } from "../../tests/support/voiceRecovery.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { takenStory, takenIdentity } from "../../tests/launchJourney.ts";
import {
  instructionProblems,
  instructionTranscriptionEndpoint,
} from "../../src/instructionTranscription.ts";
import {
  apiKey,
  save as saveKey,
} from "../../tests/support/openAISettingsPage.ts";
import { back } from "../../tests/support/systemSettingsPage.ts";

test.use(microphoneBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("setup returns to the same draft; permission and transcription problems keep typed text", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: frontendServices.projects.map((project) => ({
      ...project,
      localPath: "~/git/open-dough",
    })),
  });
  await openFrontendTakenBacklog(page);
  const notes = storyNotesPage(page);
  const voice = storyNoteVoicePage(page);
  await notes.open(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
  );
  await notes.add();
  await notes.type("Draft through setup");
  await voice.dictate();
  await notes.expectProblem(
    "Configure an OpenAI API key in System settings to dictate. You can also type the note.",
  );
  await voice.openSettings();
  await apiKey(page).fill("synthetic-note-voice-key");
  await saveKey(page).click();
  await back(page).click();
  await notes.expectComposing("Draft through setup");
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException("refused", "NotAllowedError"));
  });
  await voice.dictate();
  await notes.expectProblem(
    instructionProblems.permission.replaceAll("instruction", "note"),
  );
  await voice.expectReady();
  await notes.expectComposing("Draft through setup");
  await notes.save();
  await notes.expectSaved();
  expect(service.changes()).toEqual([
    { action: "add", identity: takenIdentity, text: "Draft through setup" },
  ]);
});

test("Close stops recording and Cancel abandons transcription; a new composer receives no late text", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  await openFrontendTakenBacklog(page);
  const notes = storyNotesPage(page);
  const voice = storyNoteVoicePage(page);
  const card = parts(page).taken.getByRole("article", {
    name: takenStory,
    exact: true,
  });
  await notes.open(card);
  await notes.add();
  await voice.dictate();
  await voice.expectStatus("Recording… Stop recording when you are finished.");
  await notes.close();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  expect(transcription.clips()).toBe(0);
  await notes.open(card);
  await notes.add();
  const held = transcription.holdNext();
  await voice.record();
  await held.received;
  await notes.cancel();
  await expect.poll(transcription.abandoned).toBe(1);
  await notes.add();
  held.release();
  await held.delivered;
  await notes.expectComposing("");
  await voice.expectReady();
  await page.route(
    (url) => url.pathname === instructionTranscriptionEndpoint,
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: instructionProblems.network }),
      }),
  );
  await notes.type("Kept after transcription failure");
  await voice.record();
  await notes.expectProblem(
    instructionProblems.network.replaceAll("instruction", "note"),
  );
  await notes.expectComposing("Kept after transcription failure");
  await voice.expectReady();
  expect(service.changes()).toEqual([]);
});
