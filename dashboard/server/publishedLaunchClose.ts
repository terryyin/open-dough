// Find the close already fetched for a kept launch in its own project.
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { reportingReferenceOf } from "../src/sessionListing.ts";
import { projectFolder } from "./projectFolders.ts";
import { publishedSessionRecord } from "./publishedSessionReview.ts";
import { fetchedPublishedSessionSource } from "./publishedSessionSource.ts";

export async function publishedLaunchClose(
  source: PublishedSource,
  record: LaunchRecord,
  signal: AbortSignal,
  { fetchMissing = false }: { readonly fetchMissing?: boolean } = {},
) {
  const reference = reportingReferenceOf(record);
  if (reference === undefined || source.id !== record.request.source) return;
  try {
    const repository = projectFolder(source).path;
    const ref = source.ref.replace(/^refs\/heads\//, "");
    const at = fetchMissing
      ? await fetchedPublishedSessionSource(
          repository,
          { ...source, ref },
          reference,
          {
            admission: () => signal,
            fetch: () => signal,
          },
        )
      : {
          repository,
          revision: `refs/remotes/origin/${ref}`,
          backlogPath: source.backlogPath,
        };
    return await publishedSessionRecord(at, reference, new Date(), signal);
  } catch {
    return undefined;
  }
}
