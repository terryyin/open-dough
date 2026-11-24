// Published close records can supply the exact pair of the story's owning landing.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import type {
  LandedReviewContext,
  ReviewRunChoice,
} from "../src/storyReviewLandedRun.ts";
import {
  isSessionId,
  sessionRecordPathBeside,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  defaultGitOutputLimit,
  gitExitedOne,
  isAncestor,
  runGit,
} from "./gitRunner.ts";
import { publishedRecordAt } from "./publishedSessionReview.ts";
import { sessionRecordDirectoryOf } from "./recordsBesideBacklog.ts";
import { retainedCommitPairFiles } from "./retainedReviewPair.ts";
import {
  reviewRepositoryPath,
  reviewRepositoryRead,
  ReviewSyncFailed,
  withSyncFailure,
} from "./reviewRepository.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";

// Landings recorded in `repository`, which its caller has already synced.
async function publishedLandings(
  source: PublishedSource,
  repository: string,
  identity: string,
  landing: string,
  signal: AbortSignal,
  named?: string,
): Promise<LandedReviewContext[]> {
  try {
    const call = { cwd: repository, signal, maxBuffer: defaultGitOutputLimit };
    const { stdout } = await runGit(
      ["rev-parse", "--verify", `origin/${source.ref}^{commit}`],
      call,
    );
    const revision = stdout.trim();
    if (!(await isAncestor(landing, revision, call))) return [];
    let paths: string[];
    if (named !== undefined) {
      if (!isSessionId(named)) return [];
      paths = [sessionRecordPathBeside(source.backlogPath, named)];
    } else {
      const found = await runGit(
        [
          "grep",
          "-l",
          "-z",
          "-F",
          "-e",
          identity,
          revision,
          "--",
          sessionRecordDirectoryOf(source),
        ],
        call,
      ).catch((error: unknown) => {
        if (gitExitedOne(error)) return { stdout: "" };
        throw error;
      });
      paths = found.stdout
        .split("\0")
        .filter(Boolean)
        .map((file) => file.slice(revision.length + 1));
    }
    const choices: LandedReviewContext[] = [];
    for (const file of paths) {
      const record = await publishedRecordAt(
        { repository: call.cwd, revision, backlogPath: source.backlogPath },
        file,
        signal,
      ).catch(() => undefined);
      signal.throwIfAborted();
      if (
        record?.story !== identity ||
        record.workflow !== "dough-execute-plan"
      )
        continue;
      for (const range of record.ranges) {
        if (
          range.candidate !== landing ||
          range.base === landing ||
          range.uncertainty !== undefined ||
          !(await isAncestor(range.base, landing, call))
        )
          continue;
        choices.push({
          reference: record.sessionId,
          identity,
          remote: "origin",
          target: `refs/heads/${source.ref}`,
          base: range.base,
          revision: landing,
          workflow: "execution",
        });
        break;
      }
    }
    return choices;
  } catch (error) {
    if (signal.aborted) throw error;
    return [];
  }
}

export async function recordedLandingChoices(
  source: PublishedSource,
  identity: string,
  landing: string | undefined,
  signal: AbortSignal,
): Promise<ReviewRunChoice[]> {
  if (landing === undefined) return [];
  // The published review this answers has just synced the Review repository.
  return (
    await publishedLandings(
      source,
      reviewRepositoryPath(source),
      identity,
      landing,
      signal,
    )
  ).map((pair) => ({
    key: pair.reference,
    workflow: pair.workflow,
    remote: pair.remote,
    target: pair.target,
    comparison: { base: pair.base, revision: pair.revision },
  }));
}

export async function recordedLandingReview(
  source: PublishedSource,
  identity: string,
  reference: string,
  signal: AbortSignal,
): Promise<
  Extract<StoryReview, { kind: "landed" | "landing-unavailable" }> | undefined
> {
  if (!isSessionId(reference)) return undefined;
  // Named reads can arrive before the Done view has fetched the close record.
  let synced: Awaited<ReturnType<typeof reviewRepositoryRead>>;
  try {
    synced = await reviewRepositoryRead(source, signal);
  } catch (error) {
    if (!(error instanceof ReviewSyncFailed)) throw error;
    return {
      kind: "landing-unavailable",
      reference,
      explanation: error.message,
    };
  }
  const { repository, syncFailure } = synced;
  const endpoints = await publishedStoryEndpoints(
    source,
    repository,
    identity,
    signal,
  );
  if (endpoints.kind !== "facts") return undefined;
  const { facts } = endpoints;
  const landing =
    facts.mode === "trunk" ? facts.completion : facts.landing?.merge;
  if (landing === undefined) return undefined;
  const [pair] = await publishedLandings(
    source,
    repository,
    identity,
    landing,
    signal,
    reference,
  );
  if (pair === undefined) return undefined;
  const read = await retainedCommitPairFiles(
    {
      ...pair,
      repository,
    },
    signal,
  );
  if ("missing" in read)
    return {
      kind: "landing-unavailable",
      reference,
      explanation:
        "The accepted landing comparison could not be read from published history.",
    };
  return {
    kind: "landed",
    landing: pair,
    baseline: pair.base,
    tree: pair.revision,
    files: read.files,
    selectedRun: reference,
    ...withSyncFailure(syncFailure),
  };
}
