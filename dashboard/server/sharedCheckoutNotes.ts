// Notes, beside each affected launch's landing context, that another session
// was open in its checkout: what the publisher marks a closed range by. The
// note's file and shape belong to the shared note module; notes stay local.
import { readFile, writeFile } from "node:fs/promises";
import {
  sharedCheckoutNotePathBeside,
  sharedCheckoutNoteText,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { sessionsSharingCheckout } from "./sessionCheckoutShared.ts";

// Notes the overlap of the kept launch `record` with every other open launch
// of the project in its checkout, on both sides, from the later launch.
export async function noteSharedCheckouts(
  sourceId: string,
  record: LaunchRecord,
): Promise<void> {
  const open = sessionsSharingCheckout(
    record,
    await keptRecords(sourceId),
  ).filter((other) => other.doneAt === undefined);
  for (const other of open) {
    const since = new Date(
      Math.max(Date.parse(record.launchedAt), Date.parse(other.launchedAt)),
    ).toISOString();
    await noteBeside(record, since);
    await noteBeside(other, since);
  }
}

// Keeps the earliest overlap start in the note beside `record`'s landing
// context. A launch without one takes no note.
async function noteBeside(record: LaunchRecord, since: string): Promise<void> {
  const landingContext = record.request.reporting?.landingContext;
  if (landingContext === undefined) return;
  const file = sharedCheckoutNotePathBeside(landingContext);
  const recorded = await readFile(file, "utf8").catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  });
  await writeFile(file, sharedCheckoutNoteText(since, recorded));
}
