// Open Dough's trunk as the landed CI wall-time history specs publish it on a
// real start origin (./startOrigin.ts) and serve its CI: changes on trunk --
// code CI builds, planning CI skips, and trunk's CI workflow, which ignores
// planning -- each with a push of its own or together with one push, with
// the landings the dashboard recorded at them; trunk's push runs; and their
// CI proof, served to the server's `gh` as GitHub answers it, with no page
// open or for a page (../intentCiHistoryPage.ts). What the history makes of
// them is in ./landedCiHistory.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { OriginAnswer } from "../originAnswers.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import { actionsForRuns, type CiRunAnswer } from "./baseCiActions.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { isActionsRequest } from "./ghActionsRequest.ts";
import { minutesAgo } from "./landedCiHistory.ts";
import { publishes } from "./publishedRepository.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  answerComparisonProofRoute,
  mixedEntrySummary,
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";
import { comparisonCiWorkflow } from "./storyCiComparisonWorkflows.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

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

// A push run of trunk's selected workflow at `revision`: run `id`, its first
// attempt, linked under ci.invalid, with the facts the case states.
export const trunkRun = (
  revision: string,
  id: number,
  facts: Partial<CiRunAnswer>,
): CiRunAnswer =>
  makeMe.aCiRun
    .with({
      headSha: revision,
      id,
      attempt: 1,
      url: `https://ci.invalid/runs/${String(id)}`,
      ...facts,
    })
    .please();

// A run's facts once it passed, from its start to its completion, created as
// it started.
export const passedBetween = (startedAt: string, completedAt: string) => ({
  conclusion: "success" as const,
  createdAt: startedAt,
  startedAt,
  completedAt,
});

// What CI kept of each run's CI proof, by run: a usable summary of that run,
// a summary that has expired, or a listing GitHub cannot answer. A run named
// nowhere published no summary.
export type TrunkProofs = Readonly<
  Record<number, ComparisonProofServe | { readonly kind: "unreadable" }>
>;

// A usable CI proof summary of `run`, as its own collector wrote it.
export function usableProofOf(run: CiRunAnswer): ComparisonProofServe {
  const runId = run.id ?? 0;
  return {
    kind: "summary",
    artifactId: runId * 10,
    summary: mixedEntrySummary(
      proofRun(runId, run.headSha, run.attempt),
      "landed",
    ),
  };
}

// Trunk's Actions as GitHub answers them, whichever revision or branch a
// listing names: `runs` as the selected workflow's push runs, and each run's
// CI proof as `proofs` keeps it.
export function trunkActions(
  runs: readonly CiRunAnswer[],
  proofs: TrunkProofs = {},
): (argv: readonly string[], head: string) => OriginAnswer | undefined {
  const runsByRevision: Record<string, CiRunAnswer[]> = {};
  for (const run of runs) (runsByRevision[run.headSha] ??= []).push(run);
  const served: Record<number, ComparisonProofServe> = {};
  const unreadable = new Set<number>();
  for (const [runId, proof] of Object.entries(proofs)) {
    if (proof.kind === "unreadable") unreadable.add(Number(runId));
    else served[Number(runId)] = proof;
  }
  return (argv, head) => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    const listed = /\/actions\/runs\/(\d+)\/artifacts/.exec(route)?.[1];
    if (listed !== undefined && unreadable.has(Number(listed)))
      return notFoundAnswer();
    return (
      actionsForRuns(runs)(argv, head) ??
      answerComparisonProofRoute(route, served, runsByRevision)
    );
  };
}

// Open Dough's trunk as GitHub answers the server's `gh` with no page open:
// the origin's `main` as published when asked, with `runs` of that `main` as
// the selected workflow's push runs and their CI proof as `proofs` keeps it,
// none unless the case states it (`trunkActions`), whichever revision or
// branch a listing names; while `readable` says no, every Actions read is not
// found.
export function serveTrunkRuns(
  github: FakeGitHub,
  origin: StartOrigin,
  runs: (main: string) => readonly CiRunAnswer[],
  {
    readable = () => true,
    proofs = () => ({}),
  }: {
    readonly readable?: () => boolean;
    readonly proofs?: () => TrunkProofs;
  } = {},
): void {
  github.serve("terryyin/open-dough", async (call) => {
    if (!readable() && isActionsRequest(call.request)) return notFoundAnswer();
    const main = await originMain(origin);
    return (
      trunkActions(runs(main), proofs())(call.argv, main) ??
      publishes({ revision: main })(call)
    );
  });
}
