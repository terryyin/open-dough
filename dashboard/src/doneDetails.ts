// The details of the done records Recently done shows: each record its
// shown entries need (`./recentlyDoneView.ts`) is read once, by the file
// name and Git blob its catalog names (`./doneStories.ts`), at the revision
// shown, through the local boundary's catalogued record read
// (`./authenticatedDoneRead.ts`). Records nobody asked for are never read.
//
// What a record says stays known for as long as the project is shown: a
// record's text is the blob it is kept by, so a later revision listing the
// same blob shows it without another read. A newer revision or another
// project abandons the reads still under way for the last one; their answers
// change nothing shown. Each newly asked group of records is one read under
// the shared wait bound (`./readWaitBound.ts`), so a failed or stalled read
// leaves those records a gap, said once with the reason, while every record
// already read stays shown. Nothing reads them again until the developer
// retries, which asks again for exactly the failed records still needed.

import { useCallback, useEffect, useRef, useState } from "react";
import { readDoneRecordBodiesAt } from "./authenticatedDoneRead.ts";
import { doneRecordsPerRead } from "./authenticatedReadRules.ts";
import {
  doneRecordOf,
  doneRecordsGapProblem,
  type DoneRecordRead,
  type NamedDoneRecord,
} from "./doneStories.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { withinReadWait } from "./readWaitBound.ts";

type Settled =
  DoneRecordRead | { readonly status: "failed"; readonly problem: string };

// What is known of one needed record: what it says, that its read failed, or
// that it is still being read.
export type DoneDetail = Settled | { readonly status: "reading" };

const keyOf = ({ fileName, blob }: NamedDoneRecord) => `${fileName} ${blob}`;

type Known = {
  readonly sourceId: string;
  readonly details: ReadonlyMap<string, Settled>;
};

type Batch = {
  readonly keys: readonly string[];
  readonly abandon: AbortController;
};

export function useDoneDetails(
  source: PublishedSource,
  revision: string,
  needed: readonly NamedDoneRecord[],
) {
  const [known, setKnown] = useState<Known>({
    sourceId: source.id,
    details: new Map(),
  });
  const details =
    known.sourceId === source.id ? known.details : new Map<string, Settled>();
  // The records being read now, kept as they change so a read is never asked
  // twice.
  const batches = useRef(new Set<Batch>());

  // A newer revision or another project, or leaving the page's columns,
  // abandons every read still under way.
  useEffect(() => {
    const started = batches.current;
    return () => {
      for (const batch of started) batch.abandon.abort();
      started.clear();
    };
  }, [source.id, revision]);

  const neededKey = needed.map(keyOf).join("\n");
  useEffect(() => {
    const asking = new Set([...batches.current].flatMap(({ keys }) => keys));
    const unread = needed.filter((record) => {
      const key = keyOf(record);
      return !details.has(key) && !asking.has(key);
    });
    for (let first = 0; first < unread.length; first += doneRecordsPerRead) {
      const records = unread.slice(first, first + doneRecordsPerRead);
      const batch: Batch = {
        keys: records.map(keyOf),
        abandon: new AbortController(),
      };
      batches.current.add(batch);
      const settle = (each: (record: NamedDoneRecord) => Settled) => {
        setKnown((last) => {
          const kept = last.sourceId === source.id ? last.details : new Map();
          const next = new Map(kept);
          for (const record of records) next.set(keyOf(record), each(record));
          return { sourceId: source.id, details: next };
        });
      };
      void withinReadWait(batch.abandon.signal, async (untilEither, bound) => {
        try {
          const texts = await readDoneRecordBodiesAt(
            source,
            revision,
            records.map(({ fileName }) => fileName),
            untilEither,
          );
          if (batch.abandon.signal.aborted) return;
          const byName = new Map(
            texts.map(({ path, text }) => [path.split("/").pop(), text]),
          );
          settle(({ fileName }) =>
            doneRecordOf(fileName, byName.get(fileName) ?? ""),
          );
        } catch (error) {
          if (batch.abandon.signal.aborted) return;
          const problem = doneRecordsGapProblem(error, untilEither, bound);
          settle(() => ({ status: "failed", problem }));
        } finally {
          batches.current.delete(batch);
        }
      });
    }
  }, [source.id, revision, neededKey, known]);

  const detailOf = (record: NamedDoneRecord): DoneDetail => {
    const key = keyOf(record);
    return details.get(key) ?? { status: "reading" };
  };
  const failed = needed.flatMap((record) => {
    const detail = details.get(keyOf(record));
    return detail?.status === "failed" ? [detail.problem] : [];
  });

  // Asks again for the needed records whose read failed, and only those.
  const retry = useCallback(() => {
    setKnown((last) => {
      if (last.sourceId !== source.id) return last;
      const next = new Map(last.details);
      for (const [key, detail] of last.details) {
        if (detail.status === "failed") next.delete(key);
      }
      return { sourceId: source.id, details: next };
    });
  }, [source.id]);

  return {
    detailOf,
    // Whether any needed record is still being read.
    reading: needed.some((record) => !details.has(keyOf(record))),
    // Why the needed records that could not be read were not, and how many.
    failed:
      failed.length === 0
        ? undefined
        : { count: failed.length, problem: failed[0] ?? "" },
    retry,
  };
}
