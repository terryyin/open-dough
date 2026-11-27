// Facts shown in the details of a kept comparison.
import { expect, type Locator } from "@playwright/test";
import { showReviewDetails } from "./reviewControls.ts";

export interface LandedContextFacts {
  readonly launchedAt: string;
  readonly remoteTarget: string;
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
