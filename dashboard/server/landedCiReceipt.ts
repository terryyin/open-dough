// Optional machine-local observation of the landing selected from published
// history. Capture does not choose that revision or own published completion.
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  keptLandingReferences,
  readLandedCiHistory,
} from "./landedCiHistoryStore.ts";
import { keptRecords } from "./launchRecordStore.ts";

export async function landedReceiptTime(
  source: PublishedSource,
  identity: string,
  revision: string,
): Promise<string | undefined> {
  const [records, history] = await Promise.all([
    keptRecords(source.id),
    readLandedCiHistory(source.id),
  ]);
  const references = [
    ...records.flatMap(({ landing }) =>
      landing === undefined ? [] : [landing],
    ),
    ...(history === undefined ? [] : keptLandingReferences(history)),
  ];
  const matching = references.filter(
    (landing) =>
      landing.target === `refs/heads/${source.ref}` &&
      landing.identity === identity &&
      landing.revision === revision,
  );
  // A later local observation of the same published landing cannot restart
  // its wait. Legacy history without a target cannot establish matching age.
  return matching
    .map(({ receivedAt }) => receivedAt)
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];
}
