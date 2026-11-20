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

// A kept declaring launch that then identified `workspace` on `branch`, with
// whatever the worktree already held.
export async function aDeclaredBranch(
  checkout: Checkout,
  request: { workspace: string; branch: string },
) {
  const record = aDeclaringLaunch(checkout).please();
  keep(record);
  const entry = await identifyBranch(checkout, record, request);
  return { record, entry };
}
