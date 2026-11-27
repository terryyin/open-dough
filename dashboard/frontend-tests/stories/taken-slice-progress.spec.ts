import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PlanSlice } from "../../src/storyPlan.ts";
import { mountIntentCiPage } from "../intent/intent-ci-page-mount.ts";
import {
  inertCiReads,
  unconfiguredIntentReads,
} from "../intent/intent-ci-status-fixtures.ts";
import { intentStoryCompare } from "../intent/intent-story-compare-page.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { boardWork, story } from "../navigation/board-work.ts";

const counted = "Count recorded slices on the card";
const planless = "Taken before plans were associated";
const unreadable = "Plan with a status the reader refuses";
const queued = "Queued story with a plan";

const planWith = (statuses: readonly PlanSlice["status"][]) => ({
  status: "interpreted" as const,
  ...makeMe.aSlicePlan.withStatuses(statuses).please(),
});

const countedStory = (statuses: readonly PlanSlice["status"][]) =>
  story(counted, 90, { planSlices: planWith(statuses) });

test("each Taken card shows recorded slice progress or its plan's gap as the plan changes", async () => {
  const firstStatuses = ["done", "planned", "planned"] as const;
  const first = countedStory(firstStatuses);
  const work = boardWork(
    [story(queued, 93, { planSlices: planWith(["done", "planned"]) })],
    {
      taken: [
        first,
        story(planless, 91, { planSlices: { status: "absent" } }),
        story(unreadable, 92, {
          planSlices: {
            status: "uninterpretable",
            problem: "Slice 2 records an unsupported status.",
          },
        }),
      ],
    },
  );
  const board = await mountIntentCiPage({
    work,
    initialPerspective: "development",
    reads: { ci: inertCiReads(), intent: unconfiguredIntentReads },
  });
  const taken = boardReading.column("Taken");
  const backlog = boardReading.column("Backlog");
  const card = (name: string) =>
    taken.getByRole("article", { name, exact: true });
  const progress = card(counted);

  async function showsBar(count: string, statuses: readonly string[]) {
    const bar = progress.getByRole("img", { name: count, exact: true });
    await expect.element(bar).toBeVisible();
    expect(
      [...bar.element().querySelectorAll("[data-slice-status]")].map(
        (segment) => segment.getAttribute("data-slice-status"),
      ),
    ).toEqual(statuses);
    await expect
      .element(progress.getByText(count, { exact: true }))
      .toBeVisible();
  }

  await showsBar("1 of 3 slices recorded complete", firstStatuses);
  for (const [name, gap] of [
    [
      planless,
      "Plan slices: No associated plan is recorded for this story. This is not zero recorded completion.",
    ],
    [
      unreadable,
      "Plan slices uninterpretable: Slice 2 records an unsupported status.",
    ],
  ] as const) {
    const withoutCount = card(name);
    await expect
      .element(withoutCount.getByText(gap, { exact: true }))
      .toBeVisible();
    await expect.element(withoutCount.getByRole("img")).not.toBeInTheDocument();
    await expect
      .element(
        withoutCount.getByText(/^[0-9]+ of [0-9]+ slices recorded complete$/),
      )
      .not.toBeInTheDocument();
  }
  await expect
    .element(backlog.getByRole("article", { name: queued, exact: true }))
    .toBeVisible();
  await expect.element(backlog.getByRole("img")).not.toBeInTheDocument();
  await expect
    .element(backlog.getByText(/slices recorded complete/))
    .not.toBeInTheDocument();
  await expect
    .element(taken.getByText("Reading plan slices…"))
    .not.toBeInTheDocument();

  await progress.getByRole("button", { name: "Inspect story" }).click();
  const detail = page.getByRole("region", {
    name: `Detail for ${counted}`,
    exact: true,
  });
  await expect
    .element(detail.getByText("1 of 3 slices recorded complete"))
    .toBeVisible();
  expect(detail.element().querySelectorAll(".slice-list > li")).toHaveLength(3);
  await expect
    .element(
      detail.getByText("Prospective proof recipe: A journey observes slice 3."),
    )
    .toBeVisible();

  await progress.getByRole("button", { name: "Hide detail" }).click();
  const laterStatuses = ["done", "done", "planned"] as const;
  await board.showWork(
    makeMe.aPublishedWork
      .with({
        ...work,
        revision: "b2".repeat(20),
        taken: [countedStory(laterStatuses), ...work.taken.slice(1)],
      })
      .please(),
  );
  await showsBar("2 of 3 slices recorded complete", laterStatuses);

  await board.selectStory(first.identity);
  await intentStoryCompare().chooseTab("Intent coverage");
  const coverage = page.getByRole("region", {
    name: "Intent coverage",
    exact: true,
  });
  await expect
    .element(
      coverage.getByText(
        "If an Intent Coverage assessment is saved during feature story wrap-up, it appears here once this story is completed.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect
    .element(coverage.getByText(/A journey observes slice 3\.|Outcome:/))
    .not.toBeInTheDocument();
});
