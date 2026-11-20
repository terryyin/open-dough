// Proposes the branch entry a launch makes when it names an existing checkout:
// the entry it already kept for that place, or the state captured there now,
// using only the original launch's repository. Nothing is kept or pinned.
import path from "node:path";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import type { SessionBranchEntry } from "../src/sessionBranchResult.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { readBranchWorkspace } from "./sessionBranchCapture.ts";
import { branchTrunk, observeBranchTrunk } from "./sessionBranchAttribution.ts";
import { resolvedCheckout } from "./sessionCommitsCapture.ts";

export type BranchPlace = { workspace: string; branch: string };

export type BranchEntryProposal = {
  kept: boolean;
  entry: SessionBranchEntry;
};

function branchEntryConflict(): RefusedRequest {
  return new RefusedRequest(
    409,
    "This session already identified a different branch or workspace.",
  );
}

// The place as Git resolves it, so a requested alias matches a kept entry.
function requestedPlace(request: BranchPlace): BranchPlace {
  const workspace = (() => {
    try {
      return resolvedCheckout(request.workspace);
    } catch {
      return path.resolve(request.workspace);
    }
  })();
  return { workspace, branch: request.branch };
}

// The entry `record` already kept at `place`, refusing any other place.
export function existingEntry(record: LaunchRecord, place: BranchPlace) {
  const entry = record.branchEntry;
  if (
    entry !== undefined &&
    (entry.workspace !== place.workspace || entry.branch !== place.branch)
  )
    throw branchEntryConflict();
  return entry;
}

export function entryRepository(record: LaunchRecord): string {
  const repository = record.defaultStart?.repository;
  if (record.request.workflow !== "ad-hoc" || repository === undefined)
    throw new RefusedRequest(
      409,
      "This launch has no recorded Default main repository for a branch handoff.",
    );
  if (record.doneAt !== undefined)
    throw new RefusedRequest(
      409,
      "Identify the branch while the session is still open.",
    );
  return repository;
}

async function verifyRegisteredWorkspace(
  repository: string,
  { workspace, branch }: BranchPlace,
) {
  const listed = (
    await runGit(["worktree", "list", "--porcelain", "-z"], {
      cwd: repository,
      maxBuffer: defaultGitOutputLimit,
      signal: AbortSignal.timeout(30_000),
    })
  ).stdout;
  const registered = listed.split("\0\0").some((record) => {
    const fields = record.split("\0");
    return (
      fields[0] === `worktree ${workspace}` &&
      fields.includes(`branch refs/heads/${branch}`)
    );
  });
  if (!registered)
    throw new Error("This branch and path are not a registered worktree pair.");
}

async function defaultTipOf(record: LaunchRecord, repository: string) {
  const ref = record.defaultStart?.branch;
  if (ref === undefined) return undefined;
  const tip = await runGit(["rev-parse", "--verify", `${ref}^{commit}`], {
    cwd: repository,
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  }).catch(() => undefined);
  const parsed = commitIdSchema.safeParse(tip?.stdout.trim());
  return parsed.success ? parsed.data : undefined;
}

// Answers the entry `record` kept at the requested place, or captures the
// registered worktree of its repository on a branch other than `trunkRef`.
// The capture may write the working tree object to Git.
export async function proposeBranchEntry(
  trunkRef: string,
  record: LaunchRecord,
  request: BranchPlace,
): Promise<BranchEntryProposal> {
  const place = requestedPlace(request);
  const previous = existingEntry(record, place);
  if (previous !== undefined) return { kept: true, entry: previous };
  const repository = entryRepository(record);
  if (place.branch === trunkRef.replace(/^refs\/heads\//, ""))
    throw new RefusedRequest(
      409,
      "Identify your own branch after leaving the project's trunk.",
    );
  try {
    await verifyRegisteredWorkspace(repository, place);
    const located = { repository, ...place };
    const trunk = branchTrunk("origin", trunkRef);
    const [{ committedTip, tree }, defaultTip, observed] = await Promise.all([
      readBranchWorkspace(located),
      defaultTipOf(record, repository),
      observeBranchTrunk(trunk, {
        cwd: repository,
        maxBuffer: defaultGitOutputLimit,
        signal: AbortSignal.timeout(30_000),
      }).catch(() => trunk),
    ]);
    return {
      kept: false,
      entry: { ...located, committedTip, tree, defaultTip, trunk: observed },
    };
  } catch {
    throw new RefusedRequest(
      409,
      "This checkout does not hold the named branch in the launch's registered repository, or its entry state could not be captured.",
    );
  }
}
