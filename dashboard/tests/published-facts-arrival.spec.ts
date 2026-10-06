// Complete backlog membership precedes independent preparation, profile, and
// done groups. These journeys hold raw GitHub answers behind the built preview's
// real local `gh` boundary; no dashboard snapshot or product hook is supplied.
// Different release orders also exercise later human and clock publications.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { rosterParts } from "./dashboardPage.ts";
import {
  heldFactGroups,
  preparing,
  preparer,
  type FactGroup,
} from "./publishedFactsArrival.ts";
import { afterTake, revision } from "./sliceClockRecords.ts";
import {
  expectCanonicalFacts,
  expectCardAssignments,
  expectDoneFacts,
} from "./publishedFactsAssertions.ts";

async function expectAssignments(
  page: Page,
  branchCard: Locator,
  queuedCard: Locator,
) {
  await expectCardAssignments(branchCard, queuedCard);
  const { opener, member, back, roster } = rosterParts(page);
  await opener("Akiho-chan").click();
  await expect(roster).toContainText(
    `profiles published at revision ${revision.slice(0, 7)}`,
  );
  await expect(member("Akiho-chan")).toContainText(afterTake);
  await expect(member("Akiho-chan")).toContainText("Taken");
  await expect(member("Akiho-chan")).toContainText(
    "Human developer: Fixture Committer",
  );
  await expect(member("Kirara-chan")).toContainText(preparing);
  await expect(member("Kirara-chan")).toContainText("Preparing");
  await expect(member("Kirara-chan")).toContainText(
    `Human developer: ${preparer}`,
  );
  await back.click();
}

for (const order of [
  ["profiles", "done", "preparation"],
  ["preparation", "done", "profiles"],
  ["done", "profiles", "preparation"],
  ["profiles", "preparation", "done"],
] as const) {
  test(`published facts accumulate as ${order.join(", then ")} answer`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const { branchCard, trunkCard, queuedCard, doneCard, problem, release } =
      await heldFactGroups(page);
    const complete = new Set<FactGroup>();
    await expect(branchCard).toContainText("Reading preparation…");
    await expect(branchCard).toContainText("Reading agent profile…");
    await expect(doneCard).toHaveCount(0);

    for (const group of order) {
      await test.step(`${group} appears while other groups keep their own read state`, async () => {
        release(group);
        complete.add(group);
        if (complete.has("preparation")) {
          await expectCanonicalFacts(queuedCard);
          await expect(
            branchCard.getByText("Slice planned", { exact: true }),
          ).toBeVisible();
        } else {
          await expect(branchCard).toContainText("Reading preparation…");
          await expect(queuedCard).toContainText("Reading preparation…");
        }
        if (complete.has("profiles")) {
          await expectAssignments(page, branchCard, queuedCard);
        } else {
          await expect(branchCard).toContainText("Reading agent profile…");
          await expect(branchCard).not.toContainText("Owner not recorded");
          await expect(queuedCard.locator(".card-preparing")).toHaveCount(0);
        }
        if (complete.has("done")) {
          await expectDoneFacts(doneCard);
        } else {
          await expect(doneCard).toHaveCount(0);
        }
        if (complete.has("profiles") && complete.has("preparation")) {
          await expect(branchCard.locator(".card-progress")).toContainText(
            "0 of 2 slices recorded complete",
          );
          await expect(branchCard).toContainText(
            "From story branch; not in trunk.",
          );
          await expect(branchCard).toContainText(
            "Current slice started 7 min ago",
          );
          await expect(trunkCard).toContainText(
            "1 of 2 slices recorded complete",
          );
          await expect(trunkCard).toContainText(
            "Current slice started 5 min ago",
          );
        } else {
          for (const card of [branchCard, trunkCard]) {
            await expect(card.locator(".card-progress")).toContainText(
              "Reading plan slices…",
            );
            await expect(
              card.getByRole("img", { name: /slices recorded complete/ }),
            ).toHaveCount(0);
            await expect(card).not.toContainText("Current slice started");
            await expect(card.locator(".progress-source")).toHaveCount(0);
          }
        }
        await expect(problem).toHaveCount(0);
      });
    }
    await expect(page.getByText("Reading agent profile…")).toHaveCount(0);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
