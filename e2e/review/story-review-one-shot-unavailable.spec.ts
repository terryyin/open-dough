// Honest empty and unavailable captured comparisons never substitute current trunk.
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { commit } from "../../dashboard/test-support/support/launchLanding.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  openCapturedReview,
} from "../../dashboard/test-support/support/oneShotReview.ts";

for (const captured of [true, false]) {
  test(
    captured
      ? "a valid empty captured comparison says the delivered run changed nothing"
      : "a retired legacy one-shot without capture exposes its evidence gap",
    async ({ page, dashboard, origin }) => {
      const run = await startReviewRun(dashboard);
      const receipt = captured ? captureReviewRun(run, origin) : undefined;
      const base = run.established.startingRevision ?? "";
      retireReviewRun(run, origin, receipt?.revision ?? base);
      const { review } = await openCapturedReview(page, origin);
      const { answer } = review;
      if (captured) {
        expect(answer).toMatchObject({
          kind: "landed",
          baseline: base,
          tree: base,
          files: [],
        });
      } else {
        expect(answer).toMatchObject({ kind: "landing-unavailable" });
        await review.expectText("cannot be reconstructed from today's trunk");
      }
      // As opened: the explanation shows with the details collapsed.
      await review.status.expectShownText(
        captured
          ? /empty delivered comparison/
          : /no captured landing comparison/,
      );
      await review.details.expectCollapsed();
      await review.files.expectNoLists();
      // The toolbar names the comparison, never the run, and offers no
      // sidebar toggle without files.
      await review.expectComparisonNamed("Landed runs");
      await review.expectNoFilesToggle();
      await review.details.show();
      await review.details.expectRevealed();
    },
  );
}

test("missing captured objects or the saved common repository expose an unavailable reason with no substitute file list", async ({
  page,
  dashboard,
  origin,
}) => {
  const run = await startReviewRun(dashboard);
  commit(run.established.workspace, "delivered.txt");
  const receipt = captureReviewRun(run, origin);
  const repository = retireReviewRun(run, origin, receipt.revision);
  const { review } = await openCapturedReview(page, origin);
  await review.files.expectListed("1 changed file");
  const refresh = () => review.refreshAndAnswer().then(({ answer }) => answer);
  const object = path.join(
    repository,
    "objects",
    receipt.revision.slice(0, 2),
    receipt.revision.slice(2),
  );
  const bytes = readFileSync(object);
  unlinkSync(object);
  try {
    expect(await refresh()).toMatchObject({
      kind: "landing-unavailable",
      explanation:
        "The captured landing comparison objects are missing or unreadable.",
    });
    await review.files.expectNoLists();
  } finally {
    writeFileSync(object, bytes);
  }
  const held = `${repository}-held`;
  renameSync(repository, held);
  try {
    expect(await refresh()).toMatchObject({
      kind: "landing-unavailable",
      explanation: "The captured landing repository is missing or unreadable.",
    });
    await review.files.expectNoLists();
  } finally {
    renameSync(held, repository);
  }
});
