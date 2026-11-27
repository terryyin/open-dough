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
import { remoteBranchHead } from "./gitTargetFetch.ts";
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

export type VerifiedOriginTrunk =
  | {
      readonly kind: "verified";
      readonly revision: string;
      readonly backlog: string;
    }
  | { readonly kind: "missing-trunk" }
  | { readonly kind: "unavailable" }
  | { readonly kind: "unreadable-backlog" }
  | { readonly kind: "rejected" };

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
  const ref = `refs/heads/${source.ref}`;
  const boardRef = `refs/open-dough/board/${source.ref}`;
  let probed: string;
  try {
    const head = await remoteBranchHead(
      "origin",
      ref,
      call,
      githubGitCredentials,
    );
    if (head === undefined) return { kind: "missing-trunk" };
    probed = head;
  } catch (error) {
    return transportOutcome(error, signal);
  }
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
  let backlog: string;
  try {
    backlog = (
      await runGit(
        ["cat-file", "blob", `${probed}:${source.backlogPath}`],
        call,
      )
    ).stdout;
  } catch (error) {
    if (signal.aborted) throw error;
    return { kind: "unreadable-backlog" };
  }
  pinned.remember(source, probed, source.backlogPath, backlog);
  observeProjectRevision(pinned, source, probed);
  return { kind: "verified", revision: probed, backlog };
}
