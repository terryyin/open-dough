// A read of another project at the revision the shown project is published
// at asks that project's own detail, not the shown project's again.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ObservationOutcomes } from "../../src/observationOutcomes.ts";
import { readPublishedWork } from "../../src/publishedWorkRead.ts";
import { observationSupplying } from "./published-detail-path-mix-supply.ts";

test("another project at the shown revision is read afresh from its own repository", async () => {
  const shownProject = makeMe.aPublishedSource.openDough.please();
  const selected = makeMe.aPublishedSource.pygardon.please();
  const { reads } = observationSupplying({});
  const detailOf: string[] = [];
  const shown = await readPublishedWork(
    shownProject,
    new AbortController().signal,
    new ObservationOutcomes(),
    undefined,
    undefined,
    undefined,
    reads,
  );

  const work = await readPublishedWork(
    selected,
    new AbortController().signal,
    new ObservationOutcomes(),
    undefined,
    undefined,
    shown,
    {
      ...reads,
      readDoneCatalog: (source, ...rest) => {
        detailOf.push(source.id);
        return reads.readDoneCatalog(source, ...rest);
      },
    },
  );

  expect({ shown: work.source.id, detailOf }).toEqual({
    shown: selected.id,
    detailOf: [selected.id],
  });
});
