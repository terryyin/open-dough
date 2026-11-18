// A matching tree cannot associate a manual delivery with a launch.
import { randomUUID } from "node:crypto";
import {
  landingReportingReference,
  type LaunchLanding,
} from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { BranchTrunk } from "../src/sessionBranchResult.ts";
import { isAncestor, runGit, type GitCall } from "./gitRunner.ts";
import { pinLanding, removeLandingDeliveryPins } from "./launchLandingGit.ts";
import { branchTrunk } from "./sessionBranchAttribution.ts";

type ManualLanding = Pick<
  LaunchLanding,
  "repository" | "remote" | "target" | "base" | "revision"
>;

export function manualLandingTrunk(
  record: LaunchRecord,
): BranchTrunk | undefined {
  if (record.branchEntry !== undefined) return record.branchEntry.trunk;
  const start = record.establishedSession;
  if (record.branchReviewRepository === undefined || start?.role !== "isolated")
    return undefined;
  return {
    ...branchTrunk(start.remote, start.target),
    // The isolated start's receipt names its fetched trunk as the base.
    revision: start.fetched ?? start.startingRevision,
  };
}

export async function manualLandingComparison(
  repository: string,
  tip: string,
  trunk: BranchTrunk | undefined,
  targetHead: string | undefined,
  call: GitCall,
): Promise<ManualLanding | undefined> {
  const prior = trunk?.revision;
  if (trunk === undefined || prior === undefined || targetHead === undefined)
    return undefined;
  try {
    if (prior === tip || !(await isAncestor(tip, targetHead, call))) return;
    const { stdout } = await runGit(
      [
        "rev-list",
        "--first-parent",
        "--parents",
        "--reverse",
        `${prior}..${targetHead}`,
      ],
      call,
    );
    const history = stdout
      .trim()
      .split("\n")
      .map((line) => line.split(" "));
    // The witnessed trunk tip must still be on the target's first-parent line.
    if (history[0]?.[1] !== prior) return;
    const { remote, target } = trunk;
    for (const [revision, base, ...sides] of history) {
      if (revision === undefined || base === undefined) continue;
      if (revision === tip) {
        // More than one possible prior tip leaves the delivered range unknown.
        return base === prior && sides.length === 0
          ? { repository, remote, target, base, revision }
          : undefined;
      }
      if (
        sides.length === 1 &&
        sides[0] === tip &&
        !(await isAncestor(tip, base, call))
      )
        return { repository, remote, target, base, revision };
    }
  } catch {
    // Unreadable target history leaves the branch comparison usable.
  }
  return undefined;
}

export async function keepManualLanding(
  record: LaunchRecord,
  pair: ManualLanding | undefined,
): Promise<LaunchLanding | undefined> {
  if (
    pair === undefined ||
    record.landing !== undefined ||
    record.landingReporting?.deletedAt !== undefined ||
    record.landingReporting?.preparations.some(
      ({ revision }) => revision === pair.revision,
    )
  )
    return undefined;
  const landing: LaunchLanding = {
    ...pair,
    reference: landingReportingReference(record) ?? randomUUID(),
    delivery: randomUUID(),
    receipt: randomUUID(),
    receivedAt: new Date().toISOString(),
  };
  try {
    await pinLanding(landing);
    return landing;
  } catch {
    await releaseManualLanding(landing);
    return undefined;
  }
}

export async function releaseManualLanding(
  landing: LaunchLanding | undefined,
): Promise<void> {
  if (landing !== undefined)
    await removeLandingDeliveryPins(landing).catch(() => undefined);
}
