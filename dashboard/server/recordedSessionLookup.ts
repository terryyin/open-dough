// A kept session in its existing project folder, or why none is available:
// the record this machine keeps for the session, with its project's folder
// when that folder still exists on this machine.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { keptSession } from "./launchRecordStore.ts";
import {
  folderExists,
  projectFolder,
  type ProjectFolder,
} from "./projectFolders.ts";

export type Recorded =
  | {
      readonly kind: "recorded";
      readonly record: LaunchRecord;
      readonly folder: ProjectFolder;
    }
  | { readonly kind: "unrecorded" }
  | { readonly kind: "folder-not-found"; readonly folder: ProjectFolder };

// A kept session and existing project folder; no native command is run.
export async function lookupRecordedSession(
  source: PublishedSource,
  session: SessionReference,
): Promise<Recorded> {
  const record = await keptSession(source.id, session);
  if (record === undefined) {
    return { kind: "unrecorded" };
  }
  const folder = projectFolder(source);
  return (await folderExists(folder))
    ? { kind: "recorded", record, folder }
    : { kind: "folder-not-found", folder };
}
