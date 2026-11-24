// The run lookup for a story's CI comparison: a CI adapter supplies a
// discovery snapshot for the whole comparison
// (`./baseCiAdapterRevisionLookup.ts`); GitHub Actions lists runs as the
// first-parent walk reaches each revision (`./baseCiGithubRevisionLookup.ts`).
// Endpoint selection stays in `./baseCiRevisionLookup.ts`.
import type { PublishedSource } from "../src/publishedSource.ts";
import { adapterDiscoveryUnread } from "./baseCiAdapterAttempts.ts";
import { adapterRevisionLookup } from "./baseCiAdapterRevisionLookup.ts";
import { githubAcquisitionUnread } from "./baseCiGitHubReads.ts";
import { githubRevisionLookup } from "./baseCiGithubRevisionLookup.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { unread, type BaseCiJudgment } from "./baseCiNearest.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import {
  ciAdapterTimeoutMs,
  comparisonDeadlineExpired,
} from "./ciAdapterTimeout.ts";
import type { GitCall } from "./gitRunner.ts";

export type RevisionCiProviders = {
  readonly github?: Parameters<typeof githubRevisionLookup>[4];
  readonly adapter?: Parameters<typeof adapterRevisionLookup>[6];
};

export async function revisionLookupOrGap(
  source: PublishedSource,
  folderPath: string,
  call: GitCall,
  signal: AbortSignal,
  storyBranch: string | undefined,
  providers: RevisionCiProviders = {},
): Promise<RevisionCiLookup | BaseCiJudgment> {
  const { adapter, workflow } = ciConfiguration(folderPath);
  if (adapter !== undefined) {
    try {
      return await adapterRevisionLookup(
        source,
        storyBranch,
        folderPath,
        adapter,
        call,
        signal,
        providers.adapter,
      );
    } catch (error) {
      if (comparisonDeadlineExpired(signal))
        return unread(
          "The CI adapter did not answer discovery before the comparison deadline.",
        );
      if (error instanceof Error && "killed" in error && error.killed === true)
        return unread(
          `The CI adapter did not answer discovery within ${String(ciAdapterTimeoutMs() / 1000)} seconds.`,
        );
      return adapterDiscoveryUnread(error);
    }
  }
  try {
    return githubRevisionLookup(
      source,
      workflow,
      call,
      signal,
      providers.github,
    );
  } catch (error) {
    return githubAcquisitionUnread(error, "The CI workflow could not be read");
  }
}
