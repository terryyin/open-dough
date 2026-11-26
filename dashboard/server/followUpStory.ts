// A follow-up reads published story membership before launch. A Done card
// uses its displayed revision. Taken cards and retained sessions check the
// current backlog, and a retained session may also refer to a Done story.
// The file and its listed identity must agree at the same revision.

import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  parseBacklog,
  takenHeading,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { doneRecordOf, type DoneStory } from "../src/doneRecord.ts";
import { mapPool } from "../src/boundedPool.ts";
import type {
  FollowUp,
  FollowUpSessionChoice,
} from "../src/followUpRequest.ts";
import { storyFollowUpSessions } from "../src/followUpSessions.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { PublishedSessionRecord } from "../src/publishedSessionRecord.ts";
import type { WorkEntry } from "../src/publishedWork.ts";
import { performDoneCatalogRead } from "./doneCatalogRead.ts";
import { resolveRevisionViaGh } from "./ghRevision.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { listedReadConcurrency } from "./listedRecordsRead.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { PinnedTexts } from "./pinnedTexts.ts";
import { publishedSessionRecord } from "./publishedSessionReview.ts";
import { fetchedPublishedSessionSource } from "./publishedSessionSource.ts";
import { RetainedAnswers } from "./retainedAnswers.ts";
import { ReviewSyncDeadline } from "./reviewRepository.ts";
import { RevisionMemo } from "./revisionMemo.ts";
import { admissionBound } from "./storyReviewHistoricalFileAdmission.ts";

// Answers at resolved commits, kept as the read boundary keeps them; made at
// the first follow-up of a story.
let pinned: PinnedTexts | undefined;
function pinnedTexts() {
  pinned ??= new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  return pinned;
}

const notPublished = () =>
  new RefusedRequest(
    404,
    "The done story this follows up is not published at the revision shown.",
  );
const unread = () =>
  new RefusedRequest(
    502,
    "The done story this follows up could not be read at the revision shown.",
  );

const notTaken = () =>
  new RefusedRequest(
    404,
    "The story this follows up is not published in Taken.",
  );

export async function publishedDoneStory(
  source: PublishedSource,
  { identity, revision }: { identity: string; revision: string },
  signal = admissionBound(),
): Promise<DoneStory> {
  const file = doneRecordFileName(identity);
  let outcome;
  try {
    outcome = await performDoneCatalogRead(
      pinnedTexts(),
      source,
      { kind: "done-bodies-at", revision, files: [file] },
      signal,
      () => undefined,
    );
  } catch {
    throw unread();
  }
  if (outcome.kind === "failed") throw unread();
  if (outcome.kind !== "answered" || !("records" in outcome.answer))
    throw notPublished();
  const [record] = outcome.answer.records;
  const read =
    record === undefined ? undefined : doneRecordOf(file, record.text);
  if (read?.status !== "read" || read.story.identity !== identity)
    throw notPublished();
  return read.story;
}

async function currentMembership(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
) {
  try {
    const { revision } = await resolveRevisionViaGh(
      source.repository,
      source.ref,
      signal,
    );
    const read = pinnedTexts().reader(source, revision, signal);
    const backlog = parseBacklog(await read(source.backlogPath));
    return {
      revision,
      entry: backlog.entries.find((entry) => entry.identity === identity),
    };
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      502,
      "The published membership of the story this follows up could not be read.",
    );
  }
}

type FollowUpCard = Extract<FollowUp, { story: unknown }>["story"];

export async function publishedFollowUpCardStory(
  source: PublishedSource,
  card: Pick<FollowUpCard, "identity" | "revision" | "status">,
  readDone: typeof publishedDoneStory,
): Promise<
  | ({ readonly status: "taken" } & Pick<WorkEntry, "identity" | "title">)
  | ({ readonly status: "done" } & DoneStory)
> {
  const signal = admissionBound();
  if (card.status !== "taken") {
    return {
      ...(await readDone(source, card, signal)),
      status: "done",
    };
  }
  const { entry } = await currentMembership(source, card.identity, signal);
  if (entry?.list !== takenHeading || typeof entry.title !== "string")
    throw notTaken();
  return { status: "taken", identity: card.identity, title: entry.title };
}

export async function requirePublishedFollowUpSessionStory(
  source: PublishedSource,
  identity: string,
): Promise<void> {
  const signal = admissionBound();
  const { entry, revision } = await currentMembership(source, identity, signal);
  if (entry?.list === takenHeading) return;
  if (entry !== undefined) throw notTaken();
  await publishedDoneStory(source, { identity, revision }, signal);
}

// The published facts for the UUIDs selected, from this project's Git.
// A missing optional record leaves any matching local evidence available.
async function readSelectedPublications(
  source: PublishedSource,
  selected: readonly FollowUpSessionChoice[],
): Promise<PublishedSessionRecord[]> {
  const ids = [
    ...new Set(
      selected.flatMap((choice) =>
        "published" in choice ? [choice.published] : [],
      ),
    ),
  ];
  if (ids.length === 0) return [];
  const now = new Date();
  const signal = admissionBound();
  const syncDeadline = ReviewSyncDeadline.forSession();
  const records = await mapPool(ids, listedReadConcurrency, async (id) => {
    try {
      const published = await fetchedPublishedSessionSource(source, id, {
        admission: () => signal,
        request: signal,
        syncDeadline,
      });
      return await publishedSessionRecord(published, id, now, signal);
    } catch {
      return undefined;
    }
  });
  return records.filter((record) => record !== undefined);
}

export async function followUpStorySessions(
  source: PublishedSource,
  identity: string,
  selected: readonly FollowUpSessionChoice[],
) {
  const [kept, published] = await Promise.all([
    keptRecords(source.id),
    readSelectedPublications(source, selected),
  ]);
  return storyFollowUpSessions(kept, published, source.id, identity);
}
