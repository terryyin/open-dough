// A standalone session's review read from its published close record: the
// UUID resolves through the configured project's published revision, and the
// recorded pair is read from that project's Git objects alone. No launch
// history is needed. A record is read as valid only at its own UUID's path,
// here and in the published-session listing (`./publishedSessionsRead.ts`).
import {
  isSessionId,
  sessionRecordFileName,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  publishedSessionRecordSchema,
  type PublishedSessionRecord,
} from "../src/publishedSessionRecord.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { sessionRecordDirectoryOf } from "./recordsBesideBacklog.ts";
import { retainedCommitPairFiles } from "./retainedReviewPair.ts";
import {
  admissionBound,
  belongsOnRetainedPair,
  throwIfRequestAborted,
  type AdmittedReviewedFile,
  type HistoricalReviewedFileFields,
} from "./storyReviewHistoricalFileAdmission.ts";
import { unavailableSessionCommitsReview } from "./storyReviewSessionCommits.ts";

// What the published read needs: the configured checkout, the published
// revision it reads records from, and the configured backlog path.
export interface PublishedSessionSource {
  readonly repository: string;
  readonly revision: string;
  readonly backlogPath: string;
}

const sessionRecordPathOf = (
  source: PublishedSessionSource,
  sessionId: string,
) => `${sessionRecordDirectoryOf(source)}/${sessionRecordFileName(sessionId)}`;

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
  let parsed: ReturnType<typeof publishedSessionRecordSchema.safeParse>;
  try {
    parsed = publishedSessionRecordSchema.safeParse(JSON.parse(stdout));
  } catch {
    return undefined;
  }
  return parsed.success &&
    sessionRecordPathOf(source, parsed.data.sessionId) === path
    ? parsed.data
    : undefined;
}

export async function publishedSessionRecord(
  source: PublishedSessionSource,
  session: string,
  signal: AbortSignal,
): Promise<PublishedSessionRecord> {
  if (!isSessionId(session)) {
    throw new RefusedRequest(400, "The review session is malformed.");
  }
  const file = sessionRecordPathOf(source, session);
  let record: PublishedSessionRecord | undefined;
  try {
    record = await publishedRecordAt(source, file, signal);
  } catch {
    throw unknownSession();
  }
  if (record === undefined) throw unknownSession();
  return record;
}

// The files of the one recorded pair, read from the configured checkout's
// objects.
const recordedPairFiles = (
  source: PublishedSessionSource,
  { base, candidate }: PublishedSessionRecord["ranges"][0],
  signal: AbortSignal,
) =>
  retainedCommitPairFiles(
    { repository: source.repository, base, revision: candidate },
    signal,
  );

export async function publishedSessionReview(
  source: PublishedSessionSource,
  session: string,
  signal: AbortSignal,
): Promise<StoryReview> {
  const record = await publishedSessionRecord(source, session, signal);
  const [range] = record.ranges;
  const read = await recordedPairFiles(source, range, signal);
  if ("missing" in read)
    return unavailableSessionCommitsReview(
      {
        repository:
          "This project's configured checkout is missing or unreadable.",
        objects:
          "This session's published commits are not in this machine's Git. Fetch the project to review them.",
        changes: "This session's published changes could not be read.",
      }[read.missing],
    );
  return {
    kind: "published-session",
    session: { closedAt: record.closedAt },
    baseline: range.base,
    tree: range.candidate,
    files: read.files,
  };
}

// A file read admits only the literal path of this session's recorded pair.
export async function admitPublishedSessionFile(
  source: PublishedSessionSource,
  session: string,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const record = await publishedSessionRecord(source, session, signal);
  const [range] = record.ranges;
  const onPair = range.base === file.baseline && range.candidate === file.tree;
  const read =
    onPair && (await recordedPairFiles(source, range, admissionBound(signal)));
  throwIfRequestAborted(signal);
  if (!read || "missing" in read || !belongsOnRetainedPair(read.files, file))
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this session's published changes.",
    );
  return { repository: source.repository, ...file };
}
