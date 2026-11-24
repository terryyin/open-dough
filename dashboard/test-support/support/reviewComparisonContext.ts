// Facts shown in the details of a kept comparison.
import { expect, type Locator } from "@playwright/test";
import { showReviewDetails } from "./reviewControls.ts";

export interface LandedContextFacts {
  readonly launchedAt: string;
  readonly remoteTarget: string;
  readonly base: string;
  readonly revision: string;
}

export interface SessionCommitsContextFacts {
  readonly launchedAt: string;
  readonly doneAt: string;
  readonly base: string;
  readonly revision: string;
}

export async function expectLandedContext(
  review: Locator,
  facts: LandedContextFacts,
) {
  await showReviewDetails(review);
  await expect(
    review.getByRole("heading", { name: "Landed run", exact: true }),
  ).toBeVisible();
  await expect(
    review.locator(`time[datetime="${facts.launchedAt}"]`),
  ).toBeVisible();
  await expect(
    review.getByText(facts.remoteTarget, { exact: true }),
  ).toBeVisible();
  await expect(review.getByText(facts.base, { exact: true })).toBeVisible();
  await expect(review.getByText(facts.revision, { exact: true })).toBeVisible();
}

export async function expectSessionCommitsContext(
  review: Locator,
  facts: SessionCommitsContextFacts,
) {
  await showReviewDetails(review);
  const context = review
    .getByRole("heading", { name: "Session commits", exact: true })
    .locator("..");
  await expect(context).toContainText(
    "Commits made in the execution checkout while the session was open",
  );
  for (const at of [facts.launchedAt, facts.doneAt])
    await expect(context.locator(`time[datetime="${at}"]`)).toBeVisible();
  await expect(context).toContainText(
    `From ${facts.base} to ${facts.revision}.`,
  );
  await expect(
    review.getByRole("heading", { name: "Landed run", exact: true }),
  ).toHaveCount(0);
}

export async function expectSharedCheckoutNote(
  review: Locator,
  shown: boolean,
) {
  const note = review.getByText(
    "the comparison may include that session's work.",
  );
  await showReviewDetails(review);
  await (shown ? expect(note).toBeVisible() : expect(note).toHaveCount(0));
}
