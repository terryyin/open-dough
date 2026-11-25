// Fixtures for the retained follow-up notes delivery spec.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import {
  doneStoryFiles,
  otherStory,
  recoverStory,
} from "../../test-support/support/followUpStories.ts";
import { publishes } from "../../test-support/support/publishedRepository.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import {
  seedStoryNotes,
  storyNotesFile,
} from "../../test-support/support/storyNotesStore.ts";

export const completedAt = "2026-11-08T09:05:00.000Z";
export const repository = "terryyin/open-dough";
export { seedStoryNotes as seedNotes, storyNotesFile };

export const waitingGeneral = makeMe.aStoryNote
  .identifiedAs("34820000-0000-4000-8000-000000000001")
  .withText("General: paste still drops the last line on iPad.")
  .savedAt("2026-11-17T10:00:00.000Z")
  .please();

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
