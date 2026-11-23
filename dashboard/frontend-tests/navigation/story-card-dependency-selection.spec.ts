import { expect, test } from "vitest";
import type { WorkDependencies } from "../../src/storyDependencies.ts";
import { mountBoard } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

const reason =
  "Both externally valuable stories need the published endpoint before the consumer can execute.";
type Dependency = Extract<
  WorkDependencies,
  { entries: unknown }
>["entries"][number];

test("a dependency disclosure and its explanation text do not change the selected story or open detail", async () => {
  const first = story("Story B", 21);
  const second = story("Story C", 22);
  const supplier = (entry: typeof first) => ({
    supplier: { identity: entry.identity, href: entry.canonical.recorded },
    supplierLink: entry.canonical,
    implementation: "Shared endpoint contract",
    rationale: reason,
    condition: "The shared endpoint contract is integrated and verified.",
  });
  const dependencies: readonly Dependency[] = [
    { ...supplier(first), state: "waiting" },
    {
      ...supplier(second),
      state: "decision-needed",
      decision:
        "Which endpoint compatibility behavior does the consumer promise?",
    },
  ];
  const consumer = story("Story A", 20, {
    preparation: {
      status: "recorded",
      refinement: "refined",
      approach: { kind: "planless" },
      assessment: {
        status: "not-ready",
        changedSinceReview: false,
        reasons: ["Unrelated consumer design decision remains."],
      },
    },
    dependencies: {
      status: "recorded",
      entries: dependencies,
      blocking: dependencies,
    },
  });
  await mountBoard([boardWork([consumer, first, second], { taken: [] })], {
    width: 1280,
    height: 900,
  });
  const card = board
    .column("Backlog")
    .getByRole("article", { name: consumer.title, exact: true });
  const disclosure = card.getByText("Dependencies · 2 blocking", {
    exact: true,
  });
  const explanation = card
    .getByText(`Why this must finish first: ${reason}`, { exact: true })
    .first();
  const detail = card.getByRole("region", { name: /^Detail for / });
  const area = card.getByRole("heading", { name: consumer.title });

  await disclosure.click();
  await expect.element(explanation).toBeVisible();
  await board.expectStorySelection(card, false);
  await explanation.click();
  await board.expectStorySelection(card, false);
  await expect.element(detail).not.toBeInTheDocument();
  await expect.element(explanation).toBeVisible();

  await area.click();
  await board.expectStorySelection(card, true);
  await expect.element(explanation).toBeVisible();
  await explanation.click();
  await board.expectStorySelection(card, true);
  await expect.element(detail).not.toBeInTheDocument();
  await area.click();
  await board.expectStorySelection(card, false);
});
