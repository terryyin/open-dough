// Acquisition used by the authenticated story comparison read. Endpoint facts
// remain owned by the published Git readers; build selection consumes the
// same external history/provider/artifact boundary in every caller.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { BaseCiJudgment } from "./baseCiNearest.ts";
import {
  comparisonBuildSource,
  type ComparisonBuildSource,
} from "./comparisonBuildSource.ts";
import { runGit } from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";
import { lookupContext, workflowOf } from "./intentCiComparisonSlots.ts";
import {
  publishedStoryEndpoints,
  type PublishedStoryEndpointFacts,
} from "./storyPublishedEndpoints.ts";
import {
  takenStoryEndpoints,
  type TakenStoryEndpoints,
} from "./takenStoryEndpoints.ts";

export type ComparisonBuildContext =
  | { readonly builds: ComparisonBuildSource }
  | { readonly judgment: BaseCiJudgment }
  | { readonly unavailable: string };

export type StoryCiComparisonSource = {
  readonly publishedEndpoints: (
    identity: string,
  ) => Promise<
    | { readonly kind: "facts"; readonly facts: PublishedStoryEndpointFacts }
    | { readonly kind: "unavailable"; readonly explanation: string }
    | { readonly kind: "absent" }
  >;
  readonly takenEndpoints: (identity: string) => Promise<TakenStoryEndpoints>;
  readonly buildsFor: (
    branch: string | undefined,
  ) => Promise<ComparisonBuildContext>;
  readonly verifyRevision: (revision: string) => Promise<void>;
  readonly trunkHead: string;
};

export function storyCiComparisonSource(
  source: PublishedSource,
  signal: AbortSignal,
): StoryCiComparisonSource {
  return {
    publishedEndpoints: (identity) =>
      publishedStoryEndpoints(source, identity, signal),
    takenEndpoints: (identity) => takenStoryEndpoints(source, identity, signal),
    async buildsFor(branch) {
      const context = await lookupContext(source, signal, branch);
      if ("unavailable" in context) return context;
      const { call, lookupOrGap } = context;
      if ("state" in lookupOrGap) return { judgment: lookupOrGap };
      return {
        builds: comparisonBuildSource(lookupOrGap, call, workflowOf(call), {
          repository: source.repository,
          signal,
        }),
      };
    },
    async verifyRevision(revision) {
      await runGit(["rev-parse", "--verify", `${revision}^{commit}`], {
        cwd: projectFolder(source).path,
        signal,
        maxBuffer: 64 * 1024 * 1024,
      });
    },
    trunkHead: `origin/${source.ref}`,
  };
}
