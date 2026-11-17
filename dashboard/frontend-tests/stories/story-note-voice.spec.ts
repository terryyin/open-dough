// Built UI, native synthetic microphone, explicit transcription/settings/notes
// substitutes. Real provider and restart boundaries are covered by e2e consumers.
import {
  expect,
  test,
  openFrontendTakenBacklog,
} from "../../tests/support/frontendApp.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { installFrontendTranscription } from "../../tests/support/frontendTranscriptionSubstitutes.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
} from "../../tests/support/frontendStoryReview.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { storyNoteVoicePage } from "../../tests/support/storyNoteVoicePage.ts";
import {
  observeMicrophone,
  stoppedTracks,
  holdMicrophonePermission,
} from "../../tests/support/voicePage.ts";
import { microphoneBrowserOptions } from "../../tests/support/voiceRecovery.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { takenStory, takenIdentity } from "../../tests/launchJourney.ts";

test.use(microphoneBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("Taken line dictation waits for permission and transcription, then permits correction before saving exact context", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const transcription = await installFrontendTranscription(
    page,
    frontendServices,
  );
  transcription.answerText("Check this misstated line");
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    undefined,
    (answers) => {
      answers.answerFile(frontendFileDiff("story.txt", ["+Kept line"]));
    },
  );
  const notes = storyNotesPage(page);
  const voice = storyNoteVoicePage(page);
  await notes.fromLine(
    fileDiff(review, "Added story.txt", { exact: true }),
    "new",
    1,
  );
  await notes.expectComposerContext([
    takenStory,
    takenIdentity,
    "Review changes",
    "story.txt",
    "Line 1 · new",
    "Kept line",
  ]);
  await notes.type("Typed observation");
  const permission = await holdMicrophonePermission(page);
  await voice.dictate();
  await permission.requested();
  await voice.expectStatus("Waiting for microphone permission…");
  await voice.expectBusy();
  await permission.grant();
  await page.evaluate(() => {
    (
      window as unknown as { voiceObservation: { holdPermission: boolean } }
    ).voiceObservation.holdPermission = false;
  });
  await voice.expectStatus("Recording… Stop recording when you are finished.");
  await notes.cancel();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  expect(transcription.clips()).toBe(0);
  await notes.fromLine(
    fileDiff(review, "Added story.txt", { exact: true }),
    "new",
    1,
  );
  await notes.type("Typed observation");
  const held = transcription.holdNext();
  await voice.record();
  await held.received;
  await voice.expectStatus("Transcribing…");
  await voice.expectBusy();
  expect(service.changes()).toEqual([]);
  held.release();
  await held.delivered;
  await notes.expectComposing("Typed observation\n\nCheck this misstated line");
  await voice.expectReady();
  await notes.type("Typed observation\n\nCheck this corrected line");
  await notes.save();
  await notes.expectDiffSaved();
  expect(service.changes()).toEqual([
    {
      action: "add",
      identity: takenIdentity,
      text: "Typed observation\n\nCheck this corrected line",
      context: {
        view: "Review changes",
        path: "story.txt",
        comparison: {
          name: "All changes",
          baseline: frontendReviewIds.baseline,
          tree: frontendReviewIds.tree,
        },
        line: { number: 1, side: "new", text: "Kept line" },
      },
    },
  ]);
});

test("over-limit transcript is reviewed, shortened or discarded without losing the note", async ({
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
  await notes.open(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
  );
  await notes.add();
  await voice.expectKeyboardOrder(["Dictate", "Cancel", "Save note", "Close"]);
  await notes.type("Keep this note");
  const transcript = "x".repeat(4_001);
  transcription.answerText(transcript);
  await voice.record();
  await voice.expectTranscript(transcript);
  await voice.expectBusy();
  await notes.expectComposing("Keep this note");
  await voice.expectAddDisabled();
  await notes.expectProblem(
    "This transcript exceeds the note limit. Your note was kept.",
  );
  await voice.shorten("Corrected transcript");
  await voice.addTranscript();
  await notes.expectComposing("Keep this note\n\nCorrected transcript");
  await voice.record();
  await voice.expectTranscript(transcript);
  await voice.discardTranscript();
  await voice.expectNoTranscript();
  await voice.expectReady();
  await notes.expectComposing("Keep this note\n\nCorrected transcript");
  await voice.record();
  await voice.expectTranscript(transcript);
  await voice.discardTranscript();
  await voice.expectNoTranscript();
  await notes.expectComposing("Keep this note\n\nCorrected transcript");
  await notes.save();
  await notes.expectSaved();
  expect(service.changes()).toEqual([
    {
      action: "add",
      identity: takenIdentity,
      text: "Keep this note\n\nCorrected transcript",
    },
  ]);
});
