// This machine's story review marks (`../src/storyReviewContract.ts`): the snapshot
// a developer marked reviewed, one per story, kept by project id and work
// identity in `~/.open-dough/dashboard/review-marks.json`, resolved through
// `HOME`. A mark is not a launch record: it belongs to the story, whichever
// launch's workspace the review reads. Marking again replaces it. The marked
// tree is an unreachable object, so the mark also points
// `refs/open-dough/reviewed/<identity>` of the story's repository at it,
// replaced with the mark, which keeps it through Git's housekeeping and
// touches no tracked file, index, or status. The baseline of a Trunk Mode
// story with published commits is such a tree too, so the mark points
// `refs/open-dough/reviewed-baseline/<identity>` at its baseline the same
// way, whichever kind it is. Local evidence only, never a
// story fact. The file is read afresh, replaced atomically, and moved aside
// when unreadable as `./machineJsonStore.ts` describes.

import { z } from "zod";
import {
  markUnavailable,
  reviewMarkSchema,
  type MarkReviewedAnswer,
  type ReviewMark,
} from "../src/storyReviewContract.ts";
import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { defaultGitOutputLimit, gitProblem, runGit } from "./gitRunner.ts";
import { reviewPointObjects } from "./storyReviewPoints.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";
import { machineDashboardPath } from "./machineHome.ts";

const storeSchema = z.record(
  z.string(),
  z.record(z.string(), reviewMarkSchema),
);

type StoredMarks = z.infer<typeof storeSchema>;

const markStore = (): MachineJsonStore<StoredMarks> => ({
  file: machineDashboardPath("review-marks.json"),
  schema: storeSchema,
  empty: {},
});

// How long marking, its Git calls included, may take.
const markWaitMs = 30_000;

// The refs that keep a story's marked tree and the baseline it was compared
// with: its work identity as one ref component, each character other than a
// letter, digit, `#`, `_`, or `-` written as `%XX`, so Git never refuses it.
function reviewedRefs(identity: string) {
  const component = identity.replace(/[^A-Za-z0-9#_-]/gu, (character) =>
    [...new TextEncoder().encode(character)]
      .map((byte) => `%${byte.toString(16).toUpperCase().padStart(2, "0")}`)
      .join(""),
  );
  return {
    tree: `refs/open-dough/reviewed/${component}`,
    baseline: `refs/open-dough/reviewed-baseline/${component}`,
  };
}

// The story's mark, or undefined when it has none (or the file is
// unreadable, which the next write moves aside).
export async function reviewMark(
  sourceId: string,
  identity: string,
): Promise<ReviewMark | undefined> {
  const read = await readMachineJson(markStore());
  return read.kind === "document"
    ? read.document[sourceId]?.[identity]
    : undefined;
}

export interface AdmittedStoryReviewMark {
  readonly kind: "story-review-mark";
  readonly sourceId: string;
  readonly identity: string;
  readonly established: ReviewedWorkspace;
  readonly tree: string;
  readonly baseline: string;
}

// Marks the named snapshot reviewed: the repository must hold its objects.
// The refs are set before the mark is kept, so a kept mark's tree and
// baseline are always held. A write, so it runs to its end even when the
// page leaves, within its bounded wait.
export async function markReviewedResponse({
  sourceId,
  identity,
  established,
  tree,
  baseline,
}: AdmittedStoryReviewMark): Promise<AgentLaunchAnswer> {
  const signal = AbortSignal.timeout(markWaitMs);
  const git = (args: readonly string[]) =>
    runGit(args, {
      cwd: established.workspace,
      signal,
      maxBuffer: defaultGitOutputLimit,
    });
  try {
    for (const object of reviewPointObjects({ tree, baseline }, "tree")) {
      await git(["cat-file", "-e", object]);
    }
    const refs = reviewedRefs(identity);
    await git(["update-ref", refs.baseline, baseline]);
    await git(["update-ref", refs.tree, tree]);
  } catch (error) {
    return { status: 200, body: markUnavailable(gitProblem(error)) };
  }
  const mark = { tree, baseline, markedAt: new Date().toISOString() };
  await replaceMachineJson(markStore(), (stored) => ({
    ...stored,
    [sourceId]: { ...stored[sourceId], [identity]: mark },
  }));
  return {
    status: 200,
    body: { kind: "marked", mark } satisfies MarkReviewedAnswer,
  };
}
