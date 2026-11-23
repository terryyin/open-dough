import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "../intent/intent-ci-page-mount.ts";
import {
  inertCiReads,
  unconfiguredIntentReads,
} from "../intent/intent-ci-status-fixtures.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { boardWork, story } from "../navigation/board-work.ts";

const advice = `Queue a story to show <b>advice</b> on the card.
- Keep the detail wording as it is.`;
const problem =
  "This plan’s “## Execution complete” record has no readable “Product advice:” entry.";

test("the story detail shows recorded advice as text, a completion gap, or no completion without reading the plan again", async () => {
  const completed = "Execution recorded complete";
  const unfinished = "Execution without a completion record";
  const adviceless = "Completion record without advice";
  const allDone = {
    status: "interpreted" as const,
    ...makeMe.aSlicePlan.withStatuses(["done"]).please(),
  };
  const work = boardWork([], {
    taken: [
      story(completed, 94, {
        planSlices: { ...allDone, completion: { advice } },
      }),
      story(unfinished, 95, { planSlices: allDone }),
      story(adviceless, 96, {
        planSlices: { ...allDone, completion: { problem } },
      }),
    ],
  });
  const observation = pageReadsSupplying({}).observation;
  const readDetailFile = vi.fn(observation.readDetailFile);
  await mountIntentCiPage({
    work,
    initialPerspective: "development",
    reads: {
      ci: inertCiReads(),
      intent: unconfiguredIntentReads,
      observation: { ...observation, readDetailFile },
    },
  });

  async function inspect(title: string) {
    const card = boardReading.column("Taken").getByRole("article", {
      name: title,
      exact: true,
    });
    await card.getByRole("button", { name: "Inspect story" }).click();
    const detail = page.getByRole("region", {
      name: `Detail for ${title}`,
      exact: true,
    });
    await expect
      .element(detail.getByText("1 of 1 slices recorded complete"))
      .toBeVisible();
    return detail;
  }

  const recorded = await inspect(completed);
  await expect
    .element(recorded.getByRole("heading", { name: "Execution complete" }))
    .toBeVisible();
  await expect.element(recorded.getByText("Product advice:")).toBeVisible();
  expect(recorded.element().querySelector(".product-advice")?.textContent).toBe(
    advice,
  );
  expect(recorded.element().querySelector("b")).toBeNull();

  const gap = await inspect(adviceless);
  await expect
    .element(gap.getByRole("heading", { name: "Execution complete" }))
    .toBeVisible();
  await expect.element(gap.getByText(problem, { exact: true })).toBeVisible();
  expect(gap.element().querySelector(".product-advice")).toBeNull();

  const missing = await inspect(unfinished);
  await expect
    .element(missing.getByText(/Execution complete|Product advice/))
    .not.toBeInTheDocument();
  expect(readDetailFile).not.toHaveBeenCalled();
});
