// Marks attached story-note versions sent once a launch record's first
// input is delivered. Installed by the launch boundary
// (`./launchBoundary.ts`) and by Cursor's runner (`./hosts/cursor/runnerMain.ts`),
// which confirms first input out of process. A write in a process that never
// installed it still keeps the record, and the notes then stay waiting.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { onRecordsDelivered } from "./launchRecordDelivery.ts";
import { deliverAttachedStoryNotes } from "./storyNotes.ts";

async function markAttachedNotes(
  notesFile: string,
  project: string,
  record: LaunchRecord,
): Promise<void> {
  const { request } = record;
  if (request.workflow !== "ad-hoc") return;
  const followUp = request.followUp;
  if (
    followUp === undefined ||
    !("story" in followUp) ||
    followUp.notes === undefined
  )
    return;
  await deliverAttachedStoryNotes(
    notesFile,
    project,
    followUp.story.identity,
    followUp.notes,
  );
}

// Dashboard boundary and Cursor's runner process both write launch records;
// each must install so a later confirmation marks notes.
export function installStoryNoteDelivery(notesFile: string): void {
  onRecordsDelivered(async (entries) => {
    for (const { project, record } of entries) {
      try {
        await markAttachedNotes(notesFile, project, record);
      } catch {
        // Launch write already landed; notes stay waiting for a later confirm.
      }
    }
  });
}
