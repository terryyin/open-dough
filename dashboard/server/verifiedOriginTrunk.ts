// One Board candidate at the Git boundary. Probe the configured ref, fetch
// that branch (not the probed SHA) into the Board's own
// `refs/open-dough/board/<branch>`, and admit the backlog only when that ref
// is the probed commit. The ref keeps the confirmed objects reachable, and
// Review's fetches, tracking ref and sync record stay Review's: `--refmap=`
// ignores `remote.origin.fetch`, including a configured
// `+refs/heads/*:refs/remotes/origin/*`, and no FETCH_HEAD is shared.
import type { PublishedSource } from "../src/publishedSource.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import { GhFailure } from "./ghFailure.ts";
import { remoteBranchHeads } from "./gitTargetFetch.ts";
import {
  defaultGitOutputLimit,
  fetchGitTransport,
  GitFailure,
  runGit,
  type GitCall,
} from "./gitRunner.ts";
import {
  githubGitCredentials,
  githubGitEnvironment,
} from "./githubGitTransport.ts";
import { observeProjectRevision } from "./observedSessionLandings.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { ensureReviewRepository } from "./reviewRepositoryStorage.ts";
import {
  boardConfirmation,
  recordBoardConfirmation,
  type BoardConfirmation,
  type ConfirmedBranch,
} from "./boardConfirmation.ts";
import {
  branchRef,
  formerlyWatched,
  verifiedBoardBranches,
} from "./verifiedBoardBranches.ts";

export type VerifiedOriginTrunk =
  | {
      readonly kind: "verified";
      readonly revision: string;
      readonly backlog: string;
      readonly confirmedAt: string;
      readonly branches?: readonly ConfirmedBranch[];
      // The newer confirmation could not be recorded, so the former one
      // answers.
      readonly unrecorded?: true;
    }
  | { readonly kind: "missing-trunk" }
  | { readonly kind: "unavailable" }
  | { readonly kind: "unreadable-backlog" }
  | { readonly kind: "rejected" };

// One check's fixed context: the Review repository it reads with Git and the
// pinned texts it publishes into.
type BoardCheck = {
  readonly repository: string;
  readonly source: PublishedSource;
  readonly pinned: PinnedTexts;
  readonly call: GitCall;
};

type BoardRead = { readonly revision: string; readonly backlog: string };

const reviewGitCall = (repository: string, signal: AbortSignal): GitCall => ({
  cwd: repository,
  signal,
  env: { ...githubGitEnvironment, LC_ALL: "C" },
  maxBuffer: defaultGitOutputLimit,
});

// Match a refusal's own stderr before Git's generic remote trailer. Exit 2
// after the probe ran, including empty stderr, is a missing trunk. Any other
// 128, including "Repository not found" and "Authentication failed", is
// unavailable. Refusal uses the authenticated read's HTTP failure.
function transportOutcome(
  error: unknown,
  signal: AbortSignal,
): Extract<VerifiedOriginTrunk, { kind: "missing-trunk" | "unavailable" }> {
  if (signal.aborted) throw error;
  if (!(error instanceof GitFailure)) throw error;
  if (error.stderr.includes("could not read Username"))
    throw new GhFailure({ kind: "http", status: 401 });
  if (error.stderr.includes("returned error: 403"))
    throw new GhFailure({ kind: "http", status: 403 });
  const code =
    error.cause instanceof Error && "code" in error.cause
      ? error.cause.code
      : undefined;
  if (code === 2) return { kind: "missing-trunk" };
  if (code === 128) return { kind: "unavailable" };
  throw error;
}

export async function verifiedOriginTrunk(
  source: PublishedSource,
  pinned: PinnedTexts,
  signal: AbortSignal,
): Promise<VerifiedOriginTrunk> {
  const repository = await ensureReviewRepository(source, signal);
  const call = reviewGitCall(repository, signal);
  const check: BoardCheck = { repository, source, pinned, call };
  const ref = branchRef(source.ref);
  const boardRef = `refs/open-dough/board/${source.ref}`;
  const former = await boardConfirmation(repository, source.ref);
  let advertised: ReadonlyMap<string, string>;
  try {
    advertised = await remoteBranchHeads(
      "origin",
      [...new Set([ref, ...formerlyWatched(former).map(branchRef)])],
      call,
      githubGitCredentials,
    );
  } catch (error) {
    return transportOutcome(error, signal);
  }
  const probed = advertised.get(ref);
  if (probed === undefined) return { kind: "missing-trunk" };
  // Warm: origin still advertises the recorded revision, whose objects are
  // local, so the backlog is read there without a fetch.
  const warm =
    former?.revision === probed ? await backlogAt(check, probed) : undefined;
  if (warm !== undefined)
    return confirmed(
      check,
      { revision: probed, backlog: warm },
      former,
      advertised,
      signal,
    );
  try {
    // Owned through cancellation: the deadline ends Git and its transport.
    await fetchGitTransport(
      [
        ...githubGitCredentials,
        "fetch",
        "--quiet",
        "--no-write-fetch-head",
        "--refmap=",
        "origin",
        `+${ref}:${boardRef}`,
      ],
      call,
    );
  } catch (error) {
    return transportOutcome(error, signal);
  }
  const fetched = commitIdSchema.parse(
    (
      await runGit(["rev-parse", "--verify", `${boardRef}^{commit}`], call)
    ).stdout.trim(),
  );
  if (fetched !== probed) return { kind: "rejected" };
  const backlog = await backlogAt(check, probed);
  if (backlog === undefined) return { kind: "unreadable-backlog" };
  return confirmed(
    check,
    { revision: probed, backlog },
    former,
    advertised,
    signal,
  );
}

async function backlogAt(
  { source, call }: BoardCheck,
  revision: string,
): Promise<string | undefined> {
  try {
    return (
      await runGit(
        ["cat-file", "blob", `${revision}:${source.backlogPath}`],
        call,
      )
    ).stdout;
  } catch (error) {
    if (call.signal?.aborted) throw error;
    return undefined;
  }
}

// The commit point: the pinned backlog read is published only once its
// confirmation is recorded. A failed record answers the former confirmation,
// marked unrecorded, or fails when there is none.
async function confirmed(
  check: BoardCheck,
  read: BoardRead,
  former: BoardConfirmation | undefined,
  advertised: ReadonlyMap<string, string>,
  signal: AbortSignal,
): Promise<VerifiedOriginTrunk> {
  let branches: readonly ConfirmedBranch[] | undefined;
  try {
    branches = await verifiedBoardBranches(
      check.source,
      read.revision,
      read.backlog,
      former,
      advertised,
      check.call,
    );
  } catch (error) {
    // An absent target during fetch after a successful advertisement is a
    // failed verification. An explicit credential refusal retains its cause.
    transportOutcome(error, signal);
    return { kind: "unavailable" };
  }
  if (branches === undefined) return { kind: "rejected" };
  const confirmedAt = new Date().toISOString();
  try {
    await recordBoardConfirmation(check.repository, check.source.ref, {
      revision: read.revision,
      confirmedAt,
      ...(branches.length === 0 ? {} : { branches }),
    });
  } catch (error) {
    const formerBacklog =
      former === undefined
        ? undefined
        : await backlogAt(check, former.revision);
    if (former === undefined || formerBacklog === undefined) throw error;
    return {
      ...published(
        check,
        { revision: former.revision, backlog: formerBacklog },
        former.confirmedAt,
        former.branches,
      ),
      unrecorded: true,
    };
  }
  return published(check, read, confirmedAt, branches);
}

function published(
  { source, pinned }: BoardCheck,
  { revision, backlog }: BoardRead,
  confirmedAt: string,
  branches?: readonly ConfirmedBranch[],
) {
  pinned.remember(source, revision, source.backlogPath, backlog);
  observeProjectRevision(pinned, source, revision);
  return {
    kind: "verified" as const,
    revision,
    backlog,
    confirmedAt,
    ...(branches === undefined || branches.length === 0 ? {} : { branches }),
  };
}
