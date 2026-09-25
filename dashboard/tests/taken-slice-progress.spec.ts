// Each Taken card shows its recorded slice progress: one segment per slice,
// filled for each slice recorded complete, and the count in words, from the
// plan already read at the snapshot's revision -- or that plan's gap. The fake
// GitHub only publishes the backlog, seed, and plan texts; the local read
// boundary, the shared story-state and plan readers, and the page decide
// everything shown.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";

const repository = "terryyin/open-dough";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const seedPath = ".planning/seeds/SEED-090-progress.md";
const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);

const counted = "Count recorded slices on the card";
const planless = "Taken before plans were associated";
const unreadable = "Plan with a status the reader refuses";
const queued = "Queued story with a plan";

const countedPlanPath = ".planning/quick/090-counted/PLAN.md";
const unreadablePlanPath = ".planning/quick/090-unreadable/PLAN.md";
const queuedPlanPath = ".planning/quick/090-queued/PLAN.md";

const backlog = `# Product backlog

## Taken

- [${counted}](seeds/SEED-090-progress.md#counted) — SEED-090#counted
- [${planless}](seeds/SEED-090-progress.md#planless) — SEED-090#planless
- [${unreadable}](seeds/SEED-090-progress.md#unreadable) — SEED-090#unreadable

## Backlog list

- [${queued}](seeds/SEED-090-progress.md#queued) — SEED-090#queued
`;

function storyState(plan: string): string {
  return `\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"${plan}"}
\`\`\``;
}

const seed = `---
id: SEED-090
---

# Slice progress fixture

<a id="counted"></a>

### ${counted}

**Identity:** SEED-090#counted
${storyState("../quick/090-counted/PLAN.md")}

<a id="planless"></a>

### ${planless}

**Identity:** SEED-090#planless

**Status:** Taken before structured story state existed.

<a id="unreadable"></a>

### ${unreadable}

**Identity:** SEED-090#unreadable
${storyState("../quick/090-unreadable/PLAN.md")}

<a id="queued"></a>

### ${queued}

**Identity:** SEED-090#queued
${storyState("../quick/090-queued/PLAN.md")}
`;

function plan(statuses: readonly string[]): string {
  const slices = statuses
    .map(
      (status, index) => `### ${index + 1}. Slice ${index + 1}
Type: Behavior
Status: ${status}
Proof: A journey observes slice ${index + 1}.
`,
    )
    .join("\n");
  return `# Plan

## Ordered slices

${slices}`;
}

function publishedAt(revision: string, countedStatuses: readonly string[]) {
  return {
    repository,
    revision,
    files: {
      [backlogPath]: backlog,
      [seedPath]: seed,
      [countedPlanPath]: plan(countedStatuses),
      [unreadablePlanPath]: plan(["done", "merged into slice 1"]),
      [queuedPlanPath]: plan(["done", "planned"]),
    },
  };
}

// The bar's segments, in order, by the recorded status each one shows.
function segments(bar: Locator): Locator {
  return bar.locator("[data-slice-status]");
}

test("each Taken card shows its recorded slice progress as a bar and count, or the plan's gap", async ({
  page,
}) => {
  await publishFiles(
    page,
    publishedAt(revisionA, ["done", "planned", "planned"]),
  );

  await page.goto("/");

  const { taken, backlog: queue, source, refresh } = parts(page);
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

  await test.step("after a refresh, the bar shows the plan recorded at the new revision", async () => {
    await publishFiles(
      page,
      publishedAt(revisionB, ["done", "done", "planned"]),
    );
    await refresh.click();
    await expect(source).toContainText(revisionB);
    const bar = card(counted).getByRole("img", {
      name: "2 of 3 slices recorded complete",
    });
    await expect(bar.locator("[data-slice-status='done']")).toHaveCount(2);
    await expect(segments(bar)).toHaveCount(3);
  });
});
