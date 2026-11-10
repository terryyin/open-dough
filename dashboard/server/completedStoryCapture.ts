// Whether a retained landing is a story's first published Done delivery.
// Historical Review and ad hoc completed-story association share this check.
import path from "node:path";
import { trailers } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchLanding } from "../src/launchLanding.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { isAncestor, runGit, type GitCall } from "./gitRunner.ts";
import { doneRecordDirectoryOf } from "./recordsBesideBacklog.ts";
import { storyCompletionEndpoints } from "./storyCompletionEndpoints.ts";

export type LandingCompletionMatch = "matched" | "miss" | "unavailable";

// When `publisher` is set, at least one recovered claim must carry that
// Claim-Publisher for this identity, and every other recovered claim must be
// an ancestor of those (prior history continued) — not a sibling or later
// takeover after this session's claim.
async function publisherOwnsCompletion(
  claims: readonly string[],
  identity: string,
  publisher: string,
  base: string,
  revision: string,
  call: GitCall,
  signal: AbortSignal,
): Promise<LandingCompletionMatch> {
  const ours: string[] = [];
  for (const claim of claims) {
    signal.throwIfAborted();
    const message = (await runGit(["log", "-1", "--format=%B", claim], call))
      .stdout;
    const owned = trailers(message);
    if (owned.publisher === publisher && owned.identity === identity)
      ours.push(claim);
  }
  if (ours.length === 0) return "miss";
  // A later claim for this identity after the session's base with another
  // publisher is a takeover; do not attribute that completion to this session.
  const printed = (
    await runGit(
      [
        "log",
        "--format=%B%x00",
        `${base}..${revision}`,
        "--grep",
        `Claim-Identity: ${identity}`,
        "--fixed-strings",
      ],
      call,
    )
  ).stdout;
  for (const message of printed.split("\0")) {
    if (message === "") continue;
    const owned = trailers(message);
    if (owned.identity === identity && owned.publisher !== publisher)
      return "miss";
  }
  return "matched";
}

// `identityOptional` admits a storyless capture whose landing names no story.
// When `publisher` is set, that Claim-Publisher must own the completion claims
// without a later competing takeover claim.
export async function landingCompletesStory(
  source: PublishedSource,
  identity: string,
  landing: LaunchLanding,
  binding: { readonly remote: string; readonly target: string },
  signal: AbortSignal,
  {
    identityOptional = false,
    publisher,
  }: {
    readonly identityOptional?: boolean;
    readonly publisher?: string;
  } = {},
): Promise<LandingCompletionMatch> {
  if (
    landing.target !== `refs/heads/${source.ref}` ||
    landing.target !== `refs/heads/${binding.target}` ||
    landing.remote !== binding.remote
  )
    return "miss";
  if (landing.identity !== identity) {
    if (!(identityOptional && landing.identity === undefined)) return "miss";
  }
  const call: GitCall = {
    cwd: landing.repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  try {
    if (!(await isAncestor(landing.base, landing.revision, call)))
      return "miss";
    const file = path.posix.join(
      doneRecordDirectoryOf(source),
      doneRecordFileName(identity),
    );
    if (
      (
        await runGit(["ls-tree", "--name-only", landing.base, "--", file], call)
      ).stdout.trim() !== ""
    )
      return "miss";
    const completed = await storyCompletionEndpoints(
      source,
      identity,
      landing.revision,
      call,
      landing.revision,
    );
    if (completed.kind === "unavailable") return "unavailable";
    if (
      completed.kind !== "facts" ||
      completed.facts.completion !== landing.revision
    )
      return "miss";
    if (publisher !== undefined)
      return await publisherOwnsCompletion(
        completed.facts.claims,
        identity,
        publisher,
        landing.base,
        landing.revision,
        call,
        signal,
      );
    return "matched";
  } catch (error) {
    if (signal.aborted) throw error;
    return "unavailable";
  }
}
