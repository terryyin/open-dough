// Shared fixtures for follow-up notes launch specs:
// agent-launch-follow-up-notes.spec.ts (what waiting notes send and identity),
// agent-launch-follow-up-notes-admission.spec.ts (page/session refusals), and
// agent-launch-follow-up-notes-delivery.spec.ts (confirmation marks sent).

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { followUpNotesSectionText } from "../../src/followUpContext.ts";
import { storyNotesContext } from "../../src/followUpStoryNotes.ts";
import type { StoryNote } from "../../src/storyNote.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  doneStoryFiles,
  otherStory,
  recoverStory,
} from "../../tests/support/followUpStories.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import type { StartOrigin } from "../../tests/support/startOrigin.ts";
import {
  seedStoryNotes,
  storyNotesFile,
} from "../../tests/support/storyNotesStore.ts";

export const completedAt = "2026-11-08T09:05:00.000Z";
export const repository = "terryyin/open-dough";
export { seedStoryNotes as seedNotes, storyNotesFile };

const lineContext = {
  view: "Review changes" as const,
  path: "dashboard/src/FollowUp.tsx",
  comparison: {
    name: "Published completion",
    baseline: "a".repeat(40),
    tree: "b".repeat(40),
  },
  line: {
    number: 42,
    side: "new" as const,
    text: "  const followUp = source;",
  },
};

export const waitingGeneral = makeMe.aStoryNote
  .identifiedAs("34820000-0000-4000-8000-000000000001")
  .withText("General: paste still drops the last line on iPad.")
  .savedAt("2026-11-17T10:00:00.000Z")
  .please();

export const waitingLine = makeMe.aStoryNote
  .identifiedAs("34820000-0000-4000-8000-000000000002")
  .withText("Line: the anchor should keep the side.")
  .savedAt("2026-11-17T09:00:00.000Z")
  .withContext(lineContext)
  .please();

export const sentNote = makeMe.aStoryNote
  .identifiedAs("34820000-0000-4000-8000-000000000003")
  .withText("Already sent; leave this out.")
  .savedAt("2026-11-17T08:00:00.000Z")
  .deliveredAs("2026-11-17T08:00:00.000Z")
  .please();

// Expected notes block from the same section composition the session receives.
export function notesContextOf(notes: readonly StoryNote[]): string {
  const section = storyNotesContext(notes);
  if (section === undefined) return "";
  return followUpNotesSectionText(section);
}

export async function publishRecoverStory(
  dashboard: DashboardServer,
  origin: StartOrigin,
): Promise<string> {
  const revision = await originMain(origin);
  dashboard.github.serve(
    repository,
    publishes({
      revision,
      files: doneStoryFiles([recoverStory, otherStory], completedAt),
    }),
  );
  return revision;
}
