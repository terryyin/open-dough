// Composed Done launch records and the shared unavailable answers.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { minutesAgo, type Checkout } from "./doneCaptureCase.ts";

// A Done session established in the checkout at `revision` (its base by
// default) that kept these runs of its commits there.
export const aDoneSession = (
  checkout: Checkout,
  runs: { base: string; revision: string }[],
  revision = checkout.base,
) =>
  makeMe.aLaunchRecord
    .establishedOnMainOf(checkout, revision)
    .keptSessionCommits({ repository: checkout.integration, runs })
    .markedDone()
    .please();

// The launch marked Done at `doneAt` with the branch result its Git captures
// then.
export async function aDoneBranch(
  launch: typeof makeMe.aLaunchRecord,
  { doneAt = minutesAgo(10) }: { doneAt?: string } = {},
): Promise<LaunchRecord> {
  const { result, delivery } = await captureBranchResult(
    launch.please(),
    doneAt,
  );
  if (delivery !== undefined)
    throw new Error("A branch-only Done fixture received a verified delivery.");
  return launch.branchResultFrom(result).markedDoneAt(doneAt).please();
}

export const notCaptured = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session's changes were not captured.",
};

export const noCommits = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session made no commits in the Default main checkout.",
};
