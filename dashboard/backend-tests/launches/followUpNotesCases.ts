// Shared fixtures for follow-up notes launch specs:
// agent-launch-follow-up-notes.spec.ts (what waiting notes send and identity),
// agent-launch-follow-up-notes-admission.spec.ts (page/session refusals), and
// agent-launch-follow-up-notes-delivery.spec.ts (confirmation marks sent).

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

export const waitingGeneralLine = `- Note: ${waitingGeneral.text}`;

export const waitingLineAndAnchor = [
  `- Note: ${waitingLine.text}`,
  "- Context:",
  "what the dashboard showed when the note was taken",
  "Review changes",
  "dashboard/src/FollowUp.tsx",
  `Published completion ${lineContext.comparison.baseline} → ${lineContext.comparison.tree}`,
  "Line 42 · new",
  "  const followUp = source;",
].join("\n");

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
