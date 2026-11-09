// Open Dough's trunk as the landed CI wall-time history specs publish it on a
// real start origin (./startOrigin.ts) and serve its CI: changes on trunk --
// code CI builds, planning CI skips, and trunk's CI workflow, which ignores
// planning -- each with a push of its own or together with one push, with
// the landings the dashboard recorded at them; and trunk's push runs and
// their CI proof as GitHub answers them (./landedCiTrunkRuns.ts). What the
// history makes of them is in ./landedCiHistory.ts.

import path from "node:path";
import type { CiRunAnswer } from "./baseCiActions.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { minutesAgo, storyLandingRecord } from "./landedCiHistory.ts";
import { serveTrunkRuns, type TrunkProofs } from "./landedCiTrunkRuns.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { comparisonCiWorkflow } from "./storyCiComparisonWorkflows.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

export {
  answeredRun,
  passedBetween,
  passedFrom,
  runningFrom,
  serveTrunkRuns,
  timeAfter,
  trunkActions,
  trunkRun,
  usableProofOf,
  type TrunkProofs,
} from "./landedCiTrunkRuns.ts";

// One change on trunk: a code change CI builds, a planning change CI skips,
// or trunk's CI workflow, whose push runs ignore changes under `.planning/`
// and `docs/` (./storyCiComparisonWorkflows.ts).
export type TrunkChange = {
  readonly title: string;
  readonly kind: "code" | "planning" | "ci-workflow";
};

// The file `change` writes, and what it writes there.
function changedFile({ title, kind }: TrunkChange): readonly [string, string] {
  if (kind === "ci-workflow")
    return [".github/workflows/ci.yml", comparisonCiWorkflow];
  return [
    kind === "planning" ? `.planning/${title}.md` : `${title}.txt`,
    `${title}\n`,
  ];
}

// `change` published on the origin's trunk with a push of its own; answers
// its revision.
export function publishedChange(
  origin: StartOrigin,
  change: TrunkChange,
): Promise<string> {
  const [file, content] = changedFile(change);
  return origin.publishRevision({
    message: `Land ${change.title}`,
    files: { [file]: content },
  });
}

// Trunk's CI workflow published on the origin's trunk, so a later
// planning-only landing is a confirmed skip.
export const publishCiWorkflow = (origin: StartOrigin): Promise<string> =>
  publishedChange(origin, { title: "ci", kind: "ci-workflow" });

// A revision published on the origin's trunk for the landing titled `title`,
// with the receipt and time the dashboard records that landing under: a code
// change CI builds, or, when `planningOnly`, a planning change CI skips.
export async function publishedLanding(
  origin: StartOrigin,
  landing: {
    readonly title: string;
    readonly receipt: string;
    readonly at: string;
    readonly planningOnly?: boolean;
  },
) {
  const { planningOnly = false, ...recorded } = landing;
  return {
    ...recorded,
    revision: await publishedChange(origin, {
      title: landing.title,
      kind: planningOnly ? "planning" : "code",
    }),
  };
}

// A landing published on the origin's trunk for `title` and recorded
// `minutes` ago, under a receipt that names that minute: a code change CI
// builds, or, when `planningOnly`, a planning change CI skips.
export const landingMinutesAgo = (
  origin: StartOrigin,
  title: string,
  minutes: number,
  planningOnly = false,
) =>
  publishedLanding(origin, {
    title,
    receipt: `dddddddd-0000-4000-8000-${String(minutes).padStart(12, "0")}`,
    at: minutesAgo(minutes),
    planningOnly,
  });

// Trunk's `runs` and their CI proof served as the case has them at each
// read (`serveTrunkRuns`), and `landings` recorded as executions in the
// machine's launch records, before a collecting server starts.
export function recordedOnTrunk(
  origin: StartOrigin,
  github: FakeGitHub,
  landings: readonly Parameters<typeof storyLandingRecord>[0][],
  runs: () => readonly CiRunAnswer[],
  proofs: () => TrunkProofs = () => ({}),
): void {
  serveTrunkRuns(github, origin, runs, { proofs });
  keepLaunchRecords(
    path.join(origin.machine, "home"),
    landings.map((each) => storyLandingRecord(each, "execution")),
  );
}

// `changes` committed on the origin project's trunk, oldest first, and
// published with one push, with the landing the dashboard recorded at each
// change titled in `landed`, oldest first, one a minute up to a minute ago:
// each change's revision and each landing by its title, and the landings.
export function landedTrunk(
  origin: StartOrigin,
  changes: readonly TrunkChange[],
  landed: readonly string[],
) {
  const revisions = new Map<string, string>();
  for (const change of changes) {
    const [file, content] = changedFile(change);
    writeAt(origin.project, file, content);
    commitAll(origin.project, `Land ${change.title}`);
    revisions.set(change.title, git(origin.project, "rev-parse", "HEAD"));
  }
  push(origin.project);
  const revision = (title: string) => {
    const found = revisions.get(title);
    if (found === undefined) throw new Error(`No change ${title}.`);
    return found;
  };
  const landings = landed.map((title, index) => {
    const minutes = landed.length - index;
    return {
      title,
      revision: revision(title),
      receipt: `bbbbbbbb-0000-4000-8000-0000000000${String(minutes).padStart(2, "0")}`,
      at: minutesAgo(minutes),
    };
  });
  const landing = (title: string) => {
    const found = landings.find((each) => each.title === title);
    if (found === undefined) throw new Error(`No landing ${title}.`);
    return found;
  };
  return { revision, landing, landings };
}
