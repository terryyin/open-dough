// Each Taken card shows its recorded slice progress: one segment per slice,
// filled for each slice recorded complete, and the count in words, from the
// plan already read at the snapshot's revision -- or that plan's gap. The fake
// GitHub only publishes the backlog, seed, and plan texts; the local read
// boundary, the shared story-state and plan readers, and the page decide
// everything shown.

import type { Locator } from "@playwright/test";
import type { PlanSlice } from "../../src/storyPlan.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { renderSlicePlan } from "../../../tests/support/published-plan.mjs";
import { renderStorySection } from "../../../tests/support/published-seed.mjs";
import { expect, test } from "../dashboardTest.ts";
import { shortRevision, expectMembership, parts } from "../dashboardPage.ts";
import { publishFiles } from "../publishedOrigin.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import { describedRevisions } from "../describedRevisions.ts";

const repository = "terryyin/open-dough";
const seedPath = ".planning/seeds/SEED-090-progress.md";

const counted = "Count recorded slices on the card";
const planless = "Taken before plans were associated";
const unreadable = "Plan with a status the reader refuses";
const queued = "Queued story with a plan";

const countedPlanPath = ".planning/slice-plans/090-counted/PLAN.md";

const story = (title: string, anchor: string) =>
  makeMe.aBacklogEntry
    .with({
      title,
      identity: `SEED-090#${anchor}`,
      href: `seeds/SEED-090-progress.md#${anchor}`,
    })
    .please();

const countedStory = story(counted, "counted");
const planlessStory = story(planless, "planless");
const unreadableStory = story(unreadable, "unreadable");
const queuedStory = story(queued, "queued");

// Each planned story's state, recorded in the seed.
const planned = (anchor: string) => ({
  identity: `SEED-090#${anchor}`,
  href: `seeds/SEED-090-progress.md#${anchor}`,
  ...makeMe.aStoryPreparation
    .plannedIn(`../slice-plans/090-${anchor}/PLAN.md`)
    .please(),
});

// The seed prose the dashboard reads; the planless story keeps the status
// line written before structured story state existed.
const seed = `---
id: SEED-090
---

# Slice progress fixture

${renderStorySection(countedStory)}
${renderStorySection(planlessStory, {
  body: "**Status:** Taken before structured story state existed.",
})}
${renderStorySection(unreadableStory)}
${renderStorySection(queuedStory)}`;

// The exact plan bytes the reader refuses: a status it does not know.
const unreadablePlan = `${renderSlicePlan(
  makeMe.aSlicePlan.withStatuses(["done"]).please(),
)}
### 2. Slice 2
Type: Behavior
Status: merged into slice 1
Proof: A journey observes slice 2.
`;

const countedPlan = (statuses: readonly PlanSlice["status"][]) =>
  renderSlicePlan(makeMe.aSlicePlan.withStatuses(statuses).please());

// Revision A records one of the counted story's three slices done; B, two.
const { A, B } = describedRevisions(
  makeMe.aRepository
    .withRevision("A", {
      backlog: {
        taken: [countedStory, planlessStory, unreadableStory],
        queued: [queuedStory],
      },
      files: {
        [seedPath]: seed,
        [countedPlanPath]: countedPlan(["done", "planned", "planned"]),
        ".planning/slice-plans/090-unreadable/PLAN.md": unreadablePlan,
        ".planning/slice-plans/090-queued/PLAN.md": countedPlan([
          "done",
          "planned",
        ]),
      },
      storyStates: ["counted", "unreadable", "queued"].map(planned),
    })
    .withRevision("B", {
      files: { [countedPlanPath]: countedPlan(["done", "done", "planned"]) },
    })
    .please(),
  { A: "a1".repeat(20), B: "b2".repeat(20) },
);

// The bar's segments, in order, by the recorded status each one shows.
function segments(bar: Locator): Locator {
  return bar.locator("[data-slice-status]");
}

test("each Taken card shows its recorded slice progress as a bar and count, or the plan's gap", async ({
  page,
}) => {
  await publishFiles(page, { repository, ...A });

  await page.goto("/");

  const { taken, backlog: queue, readRevision } = parts(page);
  await expectMembership(page, {
    taken: [counted, planless, unreadable],
    backlog: [queued],
  });
  const card = (title: string) => taken.getByRole("article", { name: title });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);

  await test.step("a plan of three slices with one done shows three segments, one filled, and the count as the bar's name", async () => {
    const bar = card(counted).getByRole("img", {
      name: "1 of 3 slices recorded complete",
    });
    await expect(bar).toBeVisible();
    await expect(segments(bar)).toHaveCount(3);
    await expect(bar.locator("[data-slice-status='done']")).toHaveCount(1);
    await expect(segments(bar).first()).toHaveAttribute(
      "data-slice-status",
      "done",
    );
    await expect(card(counted)).toContainText(
      "1 of 3 slices recorded complete",
    );
  });

  await test.step("a Taken entry without an associated plan shows that gap, not zero progress", async () => {
    await expect(card(planless)).toContainText(
      "No associated plan is recorded for this story. This is not zero recorded completion.",
    );
    await expect(card(planless).getByRole("img")).toHaveCount(0);
    await expect(card(planless)).not.toContainText("slices recorded complete");
  });

  await test.step("a plan the shared reader cannot interpret shows its gap on the card, not a count", async () => {
    await expect(card(unreadable)).toContainText(
      "Plan slices uninterpretable:",
    );
    await expect(card(unreadable).getByRole("img")).toHaveCount(0);
    await expect(card(unreadable)).not.toContainText(
      "slices recorded complete",
    );
  });

  await test.step("a queued planned entry shows no progress bar", async () => {
    await expect(queue.getByRole("article", { name: queued })).toBeVisible();
    await expect(queue.getByRole("img")).toHaveCount(0);
    await expect(queue).not.toContainText("slices recorded complete");
  });

  await test.step("the detail slice list is unchanged beside the card's bar", async () => {
    await card(counted).getByRole("button", { name: "Inspect story" }).click();
    const detail = card(counted).getByRole("region", {
      name: `Detail for ${counted}`,
    });
    await expect(detail).toContainText("1 of 3 slices recorded complete");
    await expect(detail.locator(".slice-list > li")).toHaveCount(3);
  });

  await test.step("after a reload, the bar shows the plan recorded at the new revision", async () => {
    await publishFiles(page, { repository, ...B });
    await reloadUntilRead(page);
    await expect(readRevision).toContainText(shortRevision(B.revision));
    const bar = card(counted).getByRole("img", {
      name: "2 of 3 slices recorded complete",
    });
    await expect(bar.locator("[data-slice-status='done']")).toHaveCount(2);
    await expect(segments(bar)).toHaveCount(3);
  });
});
