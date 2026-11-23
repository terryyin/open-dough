// Find the close already fetched for a kept launch in its own project.
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { reportingReferenceOf } from "../src/sessionListing.ts";
import { projectFolder } from "./projectFolders.ts";
import { publishedSessionRecord } from "./publishedSessionReview.ts";

export async function publishedLaunchClose(
  source: PublishedSource,
  record: LaunchRecord,
  signal: AbortSignal,
) {
  const reference = reportingReferenceOf(record);
  if (reference === undefined || source.id !== record.request.source) return;
  try {
    return await publishedSessionRecord(
      {
        repository: projectFolder(source).path,
        revision: `refs/remotes/origin/${source.ref.replace(/^refs\/heads\//, "")}`,
        backlogPath: source.backlogPath,
      },
      reference,
      new Date(),
      signal,
    );
  } catch {
    return undefined;
  }
}
