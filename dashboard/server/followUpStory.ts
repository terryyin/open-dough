// What a done story's follow-up reads at admission (`./followUpAdmission.ts`):
// the story's published done record at the revision the page showed, by the
// same read the page's Recently done uses (`done=bodies`,
// `./doneCatalogRead.ts`), so it is read only when that revision's agreeing
// done catalog lists it; and the sessions this machine keeps for it that are
// marked done, oldest first, as its card holds them
// (`../src/recentlyDoneView.ts`). A record that revision does not list, or
// that does not read as the story, refuses the follow-up with 404; a read
// that fails refuses it with 502, so nothing starts without the story's
// facts.

import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { doneRecordOf, type DoneStory } from "../src/doneRecord.ts";
import { mapPool } from "../src/boundedPool.ts";
import type { FollowUpSessionChoice } from "../src/followUpRequest.ts";
import { storyFollowUpSessions } from "../src/followUpSessions.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { PublishedSessionRecord } from "../src/publishedSessionRecord.ts";
import { performDoneCatalogRead } from "./doneCatalogRead.ts";
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

export async function publishedDoneStory(
  source: PublishedSource,
  { identity, revision }: { identity: string; revision: string },
): Promise<DoneStory> {
  pinned ??= new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  const file = doneRecordFileName(identity);
  let outcome;
  try {
    outcome = await performDoneCatalogRead(
      pinned,
      source,
      { kind: "done-bodies-at", revision, files: [file] },
      new AbortController().signal,
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
