// Done records served together by the published-facts observation fixture.
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { doneRecordAt, executed } from "./recentlyDoneRecords.ts";

// Further done stories, completed in the hours before the page opened.
export const moreDoneTitle = (place: number) =>
  `Finished work number ${place} rests in Recently done`;
export function heldDoneRecords(
  count: number,
  minutesBefore: (minutes: number) => Date,
): Record<string, string> {
  const first = [
    doneRecordAt(executed.identity),
    renderDoneRecord(
      makeMe.aDoneRecord
        .with({
          ...executed,
          completedAt: minutesBefore(60).toISOString(),
          developer: "Terry Yin",
        })
        .please(),
    ),
  ] as const;
  const further = [...Array(count).keys()].map((index) => {
    const identity = `SEED-3${index + 1}#finished`;
    return [
      doneRecordAt(identity),
      renderDoneRecord(
        makeMe.aDoneRecord
          .with({
            identity,
            title: moreDoneTitle(index + 1),
            completedAt: minutesBefore(90 + index * 10).toISOString(),
            developer: "Terry Yin",
          })
          .please(),
      ),
    ] as const;
  });
  return Object.fromEntries([first, ...further]);
}
