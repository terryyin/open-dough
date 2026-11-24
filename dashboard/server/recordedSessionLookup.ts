// A kept session in its existing execution checkout, or why none is available:
// the record this machine keeps for the session, with its project's execution checkout
// when that folder still exists on this machine.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { keptSession } from "./launchRecordStore.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { folderExists, type LocalFolder } from "./localFolder.ts";

export type Recorded =
  | {
      readonly kind: "recorded";
      readonly record: LaunchRecord;
      readonly folder: LocalFolder;
    }
  | { readonly kind: "unrecorded" }
  | { readonly kind: "folder-not-found"; readonly folder: LocalFolder };

// A kept session and existing execution checkout; no native command is run.
export async function lookupRecordedSession(
  source: PublishedSource,
  session: SessionReference,
): Promise<Recorded> {
  const record = await keptSession(source.id, session);
  if (record === undefined) {
    return { kind: "unrecorded" };
  }
  const folder = executionCheckout(source);
  return (await folderExists(folder))
    ? { kind: "recorded", record, folder }
    : { kind: "folder-not-found", folder };
}
