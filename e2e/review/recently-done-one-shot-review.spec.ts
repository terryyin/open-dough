// Actual queued closure, installed publication/reporting and workspace retirement
// feed the Done story's captured comparison in Intent.
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import type { Locator, Page } from "@playwright/test";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import { completedExecution } from "../../dashboard/test-support/support/oneShotExecutionReview.ts";
import { git } from "../../dashboard/test-support/support/launchLanding.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  columnCountOf,
  parts,
  sessionStateOf,
  sessionUnreadReportOf,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  showColumn,
  columnPagingControl,
  rem,
} from "../../dashboard/test-support/boardPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { noConnection } from "../../dashboard/test-support/originAnswers.ts";
import type { landingReceiptSchema } from "../../dashboard/src/launchLanding.ts";
import type { z } from "zod";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";

async function inspectDelivered(
  page: Page,
  card: Locator,
  receipt: z.infer<typeof landingReceiptSchema>,
  repository: string,
) {
  const review = await openIntentReviewChanges(page, card);
  await review.expectText(
    "The published completion record names no execution agent",
  );
  await review.comparison.expectOffered("Landed runs");
  const run = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("run") === receipt.reference
    );
  });
  await review.comparison.choose("Landed runs");
  const answer = storyReviewSchema.parse(await (await run).json());
  expect(answer).toMatchObject({
    kind: "landed",
    baseline: receipt.base,
    tree: receipt.revision,
    landing: { reference: receipt.reference },
  });
  if (answer.kind !== "landed") throw new Error("No delivered review");
  await review.expectChangesExplanation(
    "The story's historical Intent locations and test source are unavailable",
  );
  await review.files.expectOutsideCount(answer.files.length);
  expect(answer.files.map((file) => file.path)).toEqual(
    git(
      repository,
      "diff",
      "--name-only",
      receipt.base,
      receipt.revision,
    ).split("\n"),
  );
  expect(answer.files).toEqual(
    expect.arrayContaining([
      { kind: "added", path: "earlier.txt", lines: { added: 1, removed: 0 } },
      { kind: "added", path: "pending.txt", lines: { added: 1, removed: 0 } },
      { kind: "added", path: "result.txt", lines: { added: 1, removed: 0 } },
      expect.objectContaining({
        kind: "deleted",
        path: ".planning/seeds/A.md",
      }),
      expect.objectContaining({
        kind: "deleted",
        path: ".planning/slice-plans/A/PLAN.md",
      }),
    ]),
  );
  await review.landedRun.expectShown(
    "Execution launched",
    receipt.base,
    receipt.revision,
  );
  for (const [file, content] of [
    ["earlier.txt", "+earlier local commit"],
    ["pending.txt", "+pending default-checkout work"],
    ["result.txt", "+queued execution result"],
  ]) {
    await review.files.choose(`Added ${file}`);
    await review.diffs.expectShows(`Added ${file}`, content ?? "");
  }
  return review;
}

test("a completed queued one-shot is reviewable from its published done card after its seed, plan, workspace and branch are gone", async ({
  page,
  dashboard,
  origin,
}) => {
  const { receipt, run } = await completedExecution(
    dashboard,
    origin,
    "completed",
  );
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: receipt.revision,
    repository: "terryyin/open-dough",
  });
  await page.setViewportSize({ width: 54 * rem, height: 900 });
  await openUntilRead(page);
  const { recentlyDone: recent, taken, backlog } = parts(page);
  await expect(
    backlog.getByRole("article", { name: "Story A", exact: true }),
  ).toHaveCount(0);
  await expect(sessionEntriesIn(taken)).toHaveCount(0);
  await expect(columnPagingControl(page, "Recently done")).toHaveText(
    "Recently done 1 entry",
  );
  await showColumn(page, "Recently done");
  const card = recent.getByRole("article", { name: "Story A", exact: true });
  await expect(card.locator(".record-identity").first()).toHaveText(
    queuedIdentity,
  );
  await expect(columnCountOf(recent)).toHaveText("1 entry");
  await expect(sessionEntriesIn(card)).toHaveCount(1);
  await expect(sessionStateOf(card)).toHaveText("Done");
  const review = await inspectDelivered(page, card, receipt, origin.origin);
  await review.expectStory("Story A");
  await review.returnToDevelopment();
  // The deleted source cannot supply the review or done title.
  expect(
    published.requests.filter(
      (each) =>
        each.request.kind === "content" &&
        each.request.path === ".planning/seeds/A.md",
    ),
  ).toEqual([]);
  const saved = stored(dashboard.home).find(
    (each) => each.request.reporting?.reference === receipt.reference,
  );
  expect(saved?.landing).toMatchObject({
    base: receipt.base,
    revision: receipt.revision,
  });
  expect(saved?.start?.workspace).toBe(run.established.workspace);
});

test("an unfinished attention session outside its done card still supplies review while done details are unread or failed and native observation is unavailable", async ({
  page,
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native protocol fixture");
  const { receipt, donePath, report } = await completedExecution(
    dashboard,
    origin,
    "unfinished",
  );
  const transport = native;
  transport.readError = true;
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: receipt.revision,
    repository: "terryyin/open-dough",
  });
  const release = published.hold(donePath);
  const restore = published.answerWith(donePath, noConnection);
  await openUntilRead(page);
  await showColumn(page, "Recently done");
  const { recentlyDone: recent, taken } = parts(page);
  const unread = recent.getByRole("article", {
    name: queuedIdentity,
    exact: true,
  });
  await expect(unread).toContainText("Reading done story…");
  await expect(sessionEntriesIn(unread)).toHaveCount(0);
  await expect(sessionEntriesIn(taken)).toHaveCount(1);
  await expect(sessionUnreadReportOf(taken)).toHaveText(
    "Unread report: Unfinished work",
  );
  await expect(sessionEntriesIn(taken)).toContainText(
    "Live observation unavailable: Continue this conversation in Codex",
  );
  const pending = await inspectDelivered(page, unread, receipt, origin.origin);
  await pending.expectStory(queuedIdentity);
  await pending.returnToDevelopment();
  release();
  await expect(unread).toContainText("This done story could not be read.");
  const failed = await inspectDelivered(page, unread, receipt, origin.origin);
  await failed.expectStory(queuedIdentity);
  await failed.returnToDevelopment();
  restore();
  await recent.getByRole("button", { name: "Retry done stories" }).click();
  const card = recent.getByRole("article", { name: "Story A", exact: true });
  await expect(card).toBeVisible();
  await expect(sessionEntriesIn(card)).toHaveCount(0);
  await expect(columnCountOf(recent)).toHaveText("1 entry");
  const readable = await inspectDelivered(page, card, receipt, origin.origin);
  await readable.expectStory("Story A");
  const saved = stored(dashboard.home).find(
    (each) => each.request.reporting?.reference === receipt.reference,
  );
  expect(saved?.doneAt).toBeUndefined();
  expect(saved?.completion).toMatchObject({
    outcome: "unfinished",
    message: report.message,
    receipt: report.receipt,
  });
  expect(saved?.landing).toMatchObject({
    base: receipt.base,
    revision: receipt.revision,
  });
});
