// Judges one named branch of a published source's CI: the newest result of
// the project's selected check at the branch head or its nearest ancestor
// that has one. The launch judges the origin target (the configured ref)
// before a new execution start (`./launchStart.ts`), where a pass starts
// without asking and every other state is answered for the developer to
// confirm; Intent's CI status tab judges the same way through the
// authenticated read boundary (`./intentCiStatusRead.ts`). ADR 0008: observe
// without owning; the CI status read keeps the last keepable answer per
// target in this process only (`./intentCiStatusAnswers.ts`), never as
// project state. GitHub Actions and command-adapter (ciAdapter discover)
// projects share one judgment rule (`./baseCiNearest.ts`) and history read
// (`./baseCiGitHubReads.ts`); each judged result names the branch its run
// was on.
// Only a branch name the safe-branch rule accepts reaches `gh api` or the
// adapter.
import { createGitHubActions } from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import { readCiConfiguration } from "../../src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs";
import {
  isSafeBranchName,
  readWaitLimitMs,
} from "../src/authenticatedReadRules.ts";
import type { BaseCiFound } from "../src/baseCiConfirmation.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  adapterDiscoveryUnread,
  discoverAdapterAttempts,
} from "./baseCiAdapterAttempts.ts";
import {
  githubAcquisitionUnread,
  readBranchHistory,
} from "./baseCiGitHubReads.ts";
import {
  type BaseCiJudgment,
  judgeNearest,
  type ListedCommit,
  type ListedRun,
  unread,
} from "./baseCiNearest.ts";
import type { ProjectFolder } from "./projectFolders.ts";

export type { BaseCiJudgment } from "./baseCiNearest.ts";

type CiConfiguration = {
  readonly adapter: readonly string[] | undefined;
  readonly workflow: string;
  readonly rebuild: readonly string[] | undefined;
};

// The project folder's CI settings: its configured ciAdapter command, if
// any, and its GitHub Actions workflow.
export function ciConfiguration(folder: string): CiConfiguration {
  return readCiConfiguration(folder);
}

// The runs one listing returns, each named by the branch listed.
function fromBranch(runs: readonly ListedRun[], branch: string): ListedRun[] {
  return runs.map((run) => ({ ...run, branch }));
}

// Judges `branch` from its listed history and `workflow`'s Actions runs. A
// story branch (any branch but the configured ref) also lists the trunk's
// runs, so a shared ancestor's trunk run counts as that commit's result; the
// trunk is listed first so, at equal creation times, the branch's own run is
// the newer. The trunk itself asks one listing, as the launch always has.
// Listed one after the other so the workflow lookup is asked once.
async function judgeGitHubActions(
  commits: readonly ListedCommit[],
  source: PublishedSource,
  branch: string,
  workflow: string,
  signal: AbortSignal,
): Promise<BaseCiJudgment> {
  const github = createGitHubActions({
    repo: source.repository,
    workflow,
  });
  const listed = async (listedBranch: string) =>
    fromBranch(
      (await github.listRuns(
        { branch: listedBranch, created: undefined, limit: 100 },
        signal,
      )) as ListedRun[],
      listedBranch,
    );
  try {
    const own = await listed(branch);
    return judgeNearest(
      commits,
      branch === source.ref ? own : [...(await listed(source.ref)), ...own],
    );
  } catch (error) {
    return githubAcquisitionUnread(error, "The Actions runs could not be read");
  }
}

// Judges `branch` from its listed history and the ciAdapter's discovery.
export async function judgeCommandAdapter(
  commits: readonly ListedCommit[],
  source: PublishedSource,
  branch: string,
  root: string,
  adapter: readonly string[],
  signal: AbortSignal,
): Promise<BaseCiJudgment> {
  try {
    return judgeNearest(
      commits,
      await discoverAdapterAttempts(source, branch, root, adapter, signal),
    );
  } catch (error) {
    return adapterDiscoveryUnread(error);
  }
}

// Judges `branch` of `source` from the project folder's CI settings, at the
// head its own commit listing resolves, read once for either CI. Bound by the authenticated read wait,
// and ended early by `signal` when given. A nonempty `ciAdapter` uses
// discover attempts from the project folder; otherwise GitHub Actions. A name
// the safe-branch rule refuses is never asked about.
export async function judgeBranchCi(
  source: PublishedSource,
  folder: ProjectFolder,
  branch: string,
  signal?: AbortSignal,
): Promise<BaseCiJudgment> {
  if (!isSafeBranchName(branch))
    return unread(`${branch} is not a branch name this dashboard reads`);
  const bound = AbortSignal.timeout(readWaitLimitMs);
  const controller =
    signal === undefined ? bound : AbortSignal.any([bound, signal]);
  try {
    const { adapter, workflow } = ciConfiguration(folder.path);
    const commits = await readBranchHistory(source, branch, controller);
    if (!Array.isArray(commits)) return commits;
    if (adapter !== undefined)
      return {
        ...(await judgeCommandAdapter(
          commits,
          source,
          branch,
          folder.path,
          adapter,
          controller,
        )),
        ciAdapter: true,
      };
    return await judgeGitHubActions(
      commits,
      source,
      branch,
      workflow,
      controller,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    )
      return unread(
        `The CI of ${branch} could not be read within ${String(readWaitLimitMs / 1000)} seconds`,
      );
    return unread(
      error instanceof Error
        ? error.message
        : `The CI of ${branch} could not be read`,
    );
  }
}

// The pre-acceptance answer for a non-pass judgment.
export function baseCiFound(
  branch: string,
  judgment: Exclude<BaseCiJudgment, { state: "pass" }>,
): BaseCiFound {
  return {
    kind: "base-ci",
    branch,
    revision: judgment.revision,
    subject: judgment.subject,
    state: judgment.state,
    laterWithoutResult: judgment.laterWithoutResult,
    ...(judgment.completedAncestor === undefined
      ? {}
      : { completedAncestor: judgment.completedAncestor }),
    ...(judgment.reason === undefined ? {} : { reason: judgment.reason }),
    ...(judgment.runUrl === undefined ? {} : { runUrl: judgment.runUrl }),
  };
}
