// A Default main launch of the Done capture family that identifies one of the
// checkout's worktrees as its own branch.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { recordSessionBranchEntry } from "../../server/sessionBranchEntry.ts";
import {
  aDefaultLaunch,
  canonicalGitDirectory,
  type Checkout,
  keep,
  source,
} from "./doneCaptureCase.ts";

// A blank launch naming its repository as Git resolves it, so a worktree of
// the checkout reports the same repository.
export const aDeclaringLaunch = (
  checkout: Checkout,
  facts: { sessionId?: string } = {},
) =>
  aDefaultLaunch(checkout, {
    ...facts,
    gitDirectory: canonicalGitDirectory(checkout),
  });

// The kept launch `record` identifies `workspace` on `branch` as its own and
// answers the entry kept.
export const identifyBranch = (
  checkout: Checkout,
  record: LaunchRecord,
  request: { workspace: string; branch: string },
) =>
  recordSessionBranchEntry(
    makeMe.aPublishedSource
      .with({
        id: source,
        label: "Open Dough",
        repository: checkout.integration,
      })
      .please(),
    record,
    request,
  );

export type DeclaringLaunch = {
  workspace: string;
  branch: string;
  reporting?: NonNullable<LaunchRecord["request"]["reporting"]>;
  others?: (checkout: Checkout) => LaunchRecord[];
};

// A kept declaring launch, blank unless it reports through `reporting`, that
// then identified `workspace` on `branch`, with whatever the worktree already
// held. The `others` of the checkout are kept beside it.
export async function aDeclaredBranch(
  checkout: Checkout,
  { workspace, branch, reporting, others = () => [] }: DeclaringLaunch,
) {
  const launch = aDeclaringLaunch(checkout);
  const record = (
    reporting === undefined ? launch : launch.reportingThrough(reporting)
  ).please();
  keep(record, ...others(checkout));
  const entry = await identifyBranch(checkout, record, { workspace, branch });
  return { record: { ...record, branchEntry: entry }, entry };
}
