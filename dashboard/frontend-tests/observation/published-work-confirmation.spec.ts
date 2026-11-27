import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderPublishedBacklog } from "../../../Distribution/tests/support/published-backlog.mjs";
import type { PublishedSnapshot } from "../../src/authenticatedRead.ts";
import { ObservationOutcomes } from "../../src/observationOutcomes.ts";
import type {
  PublishedWork,
  PublishedWorkProgress,
} from "../../src/publishedWork.ts";
import { readPublishedWork } from "../../src/publishedWorkRead.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

const source = makeMe.aPublishedSource.openDough.please();
const revisionA = "a".repeat(40);
const revisionB = "b".repeat(40);
const confirmedA = "2026-11-26T10:00:00.000Z";
const formerConfirmation = {
  revision: revisionA,
  backlog: renderPublishedBacklog({ direction: "Direction at A" }),
  confirmedAt: confirmedA,
};
const failure = "The check of main of terryyin/open-dough could not be saved.";

function read(
  snapshot: PublishedSnapshot,
  shown?: PublishedWork,
  onPartial?: PublishedWorkProgress,
) {
  return readPublishedWork(
    source,
    new AbortController().signal,
    new ObservationOutcomes(),
    onPartial,
    undefined,
    shown,
    {
      ...pageReadsSupplying({}).observation,
      readSnapshot: () => Promise.resolve(snapshot),
      readProfiles: () =>
        Promise.resolve({ profiles: [], settings: undefined }),
      readDoneCatalog: () =>
        Promise.resolve({ status: "catalogued", records: [], unreadable: [] }),
      listPublishedSessions: () => Promise.resolve([]),
    },
  );
}

test("a failed confirmation reports the failure without replacing the newer work already shown", async () => {
  const shown = makeMe.aPublishedWork.of(source).at(revisionB).please();
  const show = vi.fn<PublishedWorkProgress>();

  await expect(
    read({ ...formerConfirmation, unrecorded: true }, shown, show),
  ).rejects.toThrow(failure);
  expect(show).not.toHaveBeenCalled();
});

test("a failed confirmation on open reports the failure beside the former confirmed work", async () => {
  const show = vi.fn<PublishedWorkProgress>();

  await expect(
    read({ ...formerConfirmation, unrecorded: true }, undefined, show),
  ).rejects.toThrow(failure);
  expect(show.mock.lastCall?.[0]).toMatchObject({
    revision: revisionA,
    direction: "Direction at A",
    confirmedAt: confirmedA,
  });
});

test("a successful check of unchanged work advances its confirmation time", async () => {
  const shown = await read(formerConfirmation);
  const later = "2026-11-26T10:01:00.000Z";

  await expect(
    read({ ...formerConfirmation, confirmedAt: later }, shown),
  ).resolves.toMatchObject({
    revision: revisionA,
    direction: shown.direction,
    confirmedAt: later,
  });
});
