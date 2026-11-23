import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { catalogFile } from "../../Distribution/tests/support/revision-done-catalog.mjs";
import {
  queuedReadyRepository,
  queuedSeedWithDependencies,
  storySeed,
} from "../../Distribution/tests/support/queued-repository.mjs";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { describedRevisions } from "../../dashboard/test-support/describedRevisions.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOrigin.ts";
import {
  agreement,
  consumer,
} from "../../dashboard/test-support/storyDependencyFixture.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import {
  followReference,
  openDependencies,
  referenceNotice,
  retryReference,
} from "../../dashboard/test-support/storyReference.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { doneRecordAt } from "../../dashboard/test-support/recentlyDoneRecords.ts";

const supplier = makeMe.aBacklogEntry
  .with({
    identity: "SEED-221#done",
    title: "Completed endpoint",
    href: "seeds/endpoint.md#done",
  })
  .please();

function publishedReference(now: Date) {
  const { recorded } = describedRevisions(
    queuedReadyRepository({ queued: [consumer] })
      .withRevision("recorded", {
        files: {
          ".planning/seeds/A.md": queuedSeedWithDependencies(consumer, [
            agreement({ supplier, state: "waiting" }),
          ]),
          ".planning/seeds/endpoint.md": storySeed(
            supplier,
            "Deliver the endpoint.",
          ),
        },
        doneRecords: [
          makeMe.aDoneRecord
            .completed({ ...supplier, completedAt: now.toISOString() })
            .please(),
          makeMe.aDoneRecord
            .completed({
              identity: "SEED-222#old",
              title: "Old endpoint",
              completedAt: new Date(
                now.getTime() - 31 * 86_400_000,
              ).toISOString(),
            })
            .please(),
        ],
      })
      .please(),
    { base: "c1".repeat(20), recorded: "c2".repeat(20) },
  );
  return recorded;
}

async function openReferenceBoard(page: Page) {
  await page.goto("/");
  const { backlog, recentlyDone } = parts(page);
  const dependent = storyCard(backlog, consumer.title);
  return {
    async follow(identity: string) {
      await openDependencies(dependent);
      await followReference(dependent, identity);
      const notice = referenceNotice(page);
      return {
        notice,
        retry: () => retryReference(page),
        destination: (title: string) => storyCard(recentlyDone, title),
      };
    },
  };
}

async function publishCatalogFailure(page: Page) {
  const now = new Date();
  await pausePageClockAt(page, now);
  const github = githubFor(page);
  const recovered = publishedReference(now);
  const failed = {
    revision: "c3".repeat(20),
    files: { ...recovered.files, [catalogFile]: "{broken" },
  };
  github.serve(defaultRepository, publishes(failed));
  return {
    failedRevision: failed.revision,
    correctedRevision: recovered.revision,
    publishCorrection: () =>
      github.serve(defaultRepository, publishes(recovered)),
    reads: () =>
      github.calls.flatMap(({ request }) =>
        request.kind === "content" && request.path.startsWith(".planning/done/")
          ? [{ path: request.path, revision: request.revision }]
          : [],
      ),
  };
}

test("Retry story reference refetches the failed Done catalog and reaches the named destination without reading expired records", async ({
  page,
}) => {
  const catalog =
    await test.step("Given the clock is paused and the published Done catalog is unreadable", () =>
      publishCatalogFailure(page));
  const reference =
    await test.step("When I follow a reference to the Done supplier", async () => {
      const board = await openReferenceBoard(page);
      return board.follow(supplier.identity);
    });
  await test.step("Then the reference explains the catalog read failure", async () => {
    await expect(reference.notice).toContainText(
      `Could not read Open Dough to find ${supplier.identity}.`,
    );
  });
  const failedReadCount =
    await test.step("And the page has requested only the failed catalog", () => {
      const reads = catalog.reads();
      expect({
        paths: [...new Set(reads.map(({ path }) => path))],
        revisions: [...new Set(reads.map(({ revision }) => revision))],
      }).toEqual({ paths: [catalogFile], revisions: [catalog.failedRevision] });
      return reads.length;
    });
  await test.step("Given the project has published its corrected catalog", () => {
    catalog.publishCorrection();
  });
  await test.step("When I retry the story reference", () => reference.retry());
  await test.step("Then the recovered Done supplier takes focus in the Board and the notice clears", async () => {
    await expect(reference.destination(supplier.title)).toBeFocused();
    await expect(reference.destination(supplier.title)).toBeInViewport({
      ratio: 0.5,
    });
    await expect(reference.notice).toBeEmpty();
  });
  await test.step("And the page reads the corrected catalog and only the named Done body", () => {
    const afterRetry = catalog.reads().slice(failedReadCount);
    expect(afterRetry[0]).toEqual({
      path: catalogFile,
      revision: catalog.correctedRevision,
    });
    expect(new Set(afterRetry.map(({ path }) => path))).toEqual(
      new Set([catalogFile, doneRecordAt(supplier.identity)]),
    );
  });
});
