// Actual queued closure, installed publication/reporting and workspace retirement
// feed Recently done's shared historical review, including its unread details.
import type { Locator, Page } from "@playwright/test";
import { test, expect, stored } from "./support/codexStart.ts";
import { completedExecution } from "./support/oneShotExecutionReview.ts";
import { readReview } from "./support/oneShotReview.ts";
import { git } from "./support/oneShotLanding.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { showColumn, edgeControl, rem } from "./dashboardColumnsPage.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { noConnection } from "./originAnswers.ts";
import type { landingReceiptSchema } from "../src/oneShotLanding.ts";
import type { z } from "zod";
import { openUntilRead } from "./pageRequestNotes.ts";

async function inspectDelivered(
  page: Page,
  card: Locator,
  receipt: z.infer<typeof landingReceiptSchema>,
  repository: string,
) {
  const answer = await readReview(page, card);
  expect(answer).toMatchObject({
    kind: "landed",
    baseline: receipt.base,
    tree: receipt.revision,
    landing: { reference: receipt.reference },
  });
  if (answer.kind !== "landed") throw new Error("No delivered review");
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
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(review).toContainText("Execution launched");
  await expect(review).toContainText(receipt.base);
  await expect(review).toContainText(receipt.revision);
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
  for (const [file, content] of [
    ["earlier.txt", "+earlier local commit"],
    ["pending.txt", "+pending default-checkout work"],
    ["result.txt", "+queued execution result"],
  ]) {
    await review.getByRole("button", { name: `Added ${file}` }).click();
    await expect(
      review.getByRole("region", { name: `Added ${file}` }),
    ).toContainText(content ?? "");
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
  await expect(taken.locator(".session-entry")).toHaveCount(0);
  await expect(edgeControl(page, "Recently done")).toHaveText(
    "Recently done 1 entry",
  );
  await showColumn(page, "Recently done");
  const card = recent.getByRole("article", { name: "Story A", exact: true });
  await expect(card.locator(".card-identity").first()).toHaveText(
    queuedIdentity,
  );
  await expect(recent.locator(".stage-count")).toHaveText("1 entry");
  await expect(card.locator(".session-entry")).toHaveCount(1);
  await expect(card.locator(".session-state")).toHaveText(
    "Done: Native session is still working",
  );
  const review = await inspectDelivered(page, card, receipt, origin.origin);
  await expect(
    review.getByRole("heading", { name: "Story A", exact: true }),
  ).toBeVisible();
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
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
  await expect(unread.locator(".session-entry")).toHaveCount(0);
  await expect(taken.locator(".session-entry")).toHaveCount(1);
  await expect(taken.locator(".session-unread-report")).toHaveText(
    "Unread report: Unfinished work",
  );
  await expect(taken.locator(".session-entry")).toContainText(
    "Live observation unavailable: Continue this conversation in Codex",
  );
  const review = await inspectDelivered(page, unread, receipt, origin.origin);
  await expect(
    review.getByRole("heading", { name: queuedIdentity, exact: true }),
  ).toBeVisible();
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    unread.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
  release();
  await expect(unread).toContainText("This done story could not be read.");
  await readReview(page, unread);
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    unread.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
  restore();
  await recent.getByRole("button", { name: "Retry done stories" }).click();
  const card = recent.getByRole("article", { name: "Story A", exact: true });
  await expect(card).toBeVisible();
  await expect(card.locator(".session-entry")).toHaveCount(0);
  await expect(recent.locator(".stage-count")).toHaveText("1 entry");
  await readReview(page, card);
  await expect(
    review.getByRole("heading", { name: "Story A", exact: true }),
  ).toBeVisible();
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
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
