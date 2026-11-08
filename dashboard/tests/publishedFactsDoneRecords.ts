// Done records served together by the published-facts observation fixture.
import type { DoneRecord } from "../../tests/support/repositoryTestData.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { executed } from "./recentlyDoneRecords.ts";

// Further done stories, completed in the hours before the page opened.
export const moreDoneTitle = (place: number) =>
  `Finished work number ${place} rests in Recently done`;
export function heldDoneRecords(
  count: number,
  minutesBefore: (minutes: number) => Date,
): DoneRecord[] {
  return [
    makeMe.aDoneRecord
      .with({
        ...executed,
        completedAt: minutesBefore(60).toISOString(),
        developer: "Terry Yin",
      })
      .please(),
    ...[...Array(count).keys()].map((index) =>
      makeMe.aDoneRecord
        .with({
          identity: `SEED-3${index + 1}#finished`,
          title: moreDoneTitle(index + 1),
          completedAt: minutesBefore(90 + index * 10).toISOString(),
          developer: "Terry Yin",
        })
        .please(),
    ),
  ];
}
