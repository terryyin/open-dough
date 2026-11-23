// A session's review read from its published close record: the
// UUID resolves through the configured project's published revision, and the
// recorded pair is read from that project's Git objects alone. No launch
// history is needed. A record is read as valid only at its own UUID's path,
// here and in the published-session listing (`./publishedSessionsRead.ts`).
import {
  isCurrentSessionRecord,
  isSessionId,
  sessionRecordPathBeside,
  sharedCheckoutUncertainty,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { PublishedSessionRecord } from "../src/publishedSessionRecord.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { publishedRecordFromText } from "./publishedSessionRecordText.ts";
import { retainedCommitPairFiles } from "./retainedReviewPair.ts";
import {
  admissionBound,
  belongsOnRetainedPair,
  throwIfRequestAborted,
  type AdmittedReviewedFile,
  type HistoricalReviewedFileFields,
} from "./storyReviewHistoricalFileAdmission.ts";

// What the published read needs: the configured checkout, the published
// revision it reads records from, and the configured backlog path.
export interface PublishedSessionSource {
  readonly repository: string;
  readonly revision: string;
  readonly backlogPath: string;
}

export type PublishedSessionRange = PublishedSessionRecord["ranges"][number];

const unknownSession = () =>
  new RefusedRequest(404, "This project published no such session.");

// The record a published file holds, undefined unless it is valid and sits at
// its own UUID's path.
export async function publishedRecordAt(
  source: PublishedSessionSource,
  path: string,
  signal: AbortSignal,
): Promise<PublishedSessionRecord | undefined> {
  const { stdout } = await runGit(["show", `${source.revision}:${path}`], {
    cwd: source.repository,
    signal,
    maxBuffer: defaultGitOutputLimit,
  });
  return publishedRecordFromText(source.backlogPath, path, stdout);
}

// The record a UUID names, answered as unpublished once past its window at
// `now`.
export async function publishedSessionRecord(
  source: PublishedSessionSource,
  session: string,
  now: Date,
  signal: AbortSignal,
): Promise<PublishedSessionRecord> {
  if (!isSessionId(session)) {
    throw new RefusedRequest(400, "The review session is malformed.");
  }
  const file = sessionRecordPathBeside(source.backlogPath, session);
  let record: PublishedSessionRecord | undefined;
  try {
    record = await publishedRecordAt(source, file, signal);
  } catch {
    throw unknownSession();
  }
  if (record === undefined || !isCurrentSessionRecord(record, now))
    throw unknownSession();
  return record;
}

// The files of one recorded pair, read from the configured checkout's
// objects.
const recordedPairFiles = (
  source: PublishedSessionSource,
  { base, candidate }: PublishedSessionRange,
  signal: AbortSignal,
) =>
  retainedCommitPairFiles(
    { repository: source.repository, base, revision: candidate },
    signal,
  );

// The recorded range a review selects by position; the first unless named.
function selectedRange(
  record: PublishedSessionRecord,
  run: string | undefined,
) {
  const range = record.ranges[run === undefined ? 0 : Number(run)];
  if (range === undefined)
    throw new RefusedRequest(
      409,
      "The selected comparison does not belong to this session's published changes.",
    );
  return range;
}

export async function publishedSessionReview(
  source: PublishedSessionSource,
  session: string,
  run: string | undefined,
  now: Date,
  signal: AbortSignal,
): Promise<StoryReview> {
  const record = await publishedSessionRecord(source, session, now, signal);
  const range = selectedRange(record, run);
  const review = await reviewPublishedSessionRange(
    source,
    range,
    record.closedAt,
    signal,
  );
  if (review.kind !== "published-session" || record.ranges.length === 1)
    return review;
  return {
    ...review,
    ranges: record.ranges.length,
    selectedRun: String(record.ranges.indexOf(range)),
  };
}

export async function reviewPublishedSessionRange(
  source: PublishedSessionSource,
  range: PublishedSessionRange,
  closedAt: string,
  signal: AbortSignal,
): Promise<StoryReview> {
  const read = await recordedPairFiles(source, range, signal);
  if ("missing" in read)
    return {
      kind: "landing-unavailable",
      comparison: "published-session",
      explanation: {
        repository:
          "This project's configured checkout is missing or unreadable.",
        objects:
          "This session's published commits are not in this machine's Git. Fetch the project to review them.",
        changes: "This session's published changes could not be read.",
      }[read.missing],
    };
  return {
    kind: "published-session",
    session: {
      closedAt,
      ...(range.uncertainty === sharedCheckoutUncertainty && { shared: true }),
    },
    baseline: range.base,
    tree: range.candidate,
    files: read.files,
  };
}

// A file read admits only the literal path of one of this session's recorded
// pairs.
export async function admitPublishedSessionFile(
  source: PublishedSessionSource,
  session: string,
  file: HistoricalReviewedFileFields,
  now: Date,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const record = await publishedSessionRecord(source, session, now, signal);
  return admitPublishedSessionPairFile(source, record.ranges, file, signal);
}

export async function admitPublishedSessionPairFile(
  source: PublishedSessionSource,
  ranges: readonly PublishedSessionRange[],
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const range = ranges.find(
    ({ base, candidate }) => base === file.baseline && candidate === file.tree,
  );
  const read =
    range !== undefined &&
    (await recordedPairFiles(source, range, admissionBound(signal)));
  throwIfRequestAborted(signal);
  if (!read || "missing" in read || !belongsOnRetainedPair(read.files, file))
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this session's published changes.",
    );
  return { repository: source.repository, ...file };
}
