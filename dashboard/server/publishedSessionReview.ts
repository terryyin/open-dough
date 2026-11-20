// A standalone session's review read from its published close record: the
// UUID resolves through the configured project's published revision, and the
// recorded pair is read from that project's Git objects alone. No launch
// history is needed.
import { sessionRecordPath } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  publishedSessionRecordSchema,
  type PublishedSessionRecord,
} from "../src/publishedSessionRecord.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { runGit } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
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

const unknownSession = () =>
  new RefusedRequest(404, "This project published no such session.");

export async function publishedSessionRecord(
  source: PublishedSessionSource,
  session: string,
  signal: AbortSignal,
): Promise<PublishedSessionRecord> {
  let file: string;
  try {
    file = sessionRecordPath(session, source.backlogPath);
  } catch {
    throw new RefusedRequest(400, "The review session is malformed.");
  }
  let text: string;
  try {
    text = (
      await runGit(["show", `${source.revision}:${file}`], {
        cwd: source.repository,
        signal,
        maxBuffer: 1024 * 1024,
      })
    ).stdout;
  } catch {
    throw unknownSession();
  }
  let parsed: ReturnType<typeof publishedSessionRecordSchema.safeParse>;
  try {
    parsed = publishedSessionRecordSchema.safeParse(JSON.parse(text));
  } catch {
    throw unknownSession();
  }
  if (!parsed.success || parsed.data.sessionId !== session)
    throw unknownSession();
  return parsed.data;
}

// The files of one recorded pair, read from the configured checkout's objects.
const recordedPairFiles = (
  source: PublishedSessionSource,
  { base, candidate }: PublishedSessionRecord["ranges"][number],
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
  if (range === undefined) throw unknownSession();
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
    kind: "session-commits",
    session: { launchedAt: record.closedAt, doneAt: record.closedAt },
    commitRuns: [],
    commitRun: 0,
    baseline: range.base,
    tree: range.candidate,
    files: read.files,
  };
}

// A file read admits only the literal path of a recorded pair of this session.
export async function admitPublishedSessionFile(
  source: PublishedSessionSource,
  session: string,
  file: HistoricalReviewedFileFields,
  signal: AbortSignal,
): Promise<AdmittedReviewedFile> {
  const record = await publishedSessionRecord(source, session, signal);
  const range = record.ranges.find(
    ({ base, candidate }) => base === file.baseline && candidate === file.tree,
  );
  const read =
    range && (await recordedPairFiles(source, range, admissionBound(signal)));
  throwIfRequestAborted(signal);
  if (!read || "missing" in read || !belongsOnRetainedPair(read.files, file))
    throw new RefusedRequest(
      409,
      "The file or comparison does not belong to this session's published changes.",
    );
  return { repository: source.repository, ...file };
}
