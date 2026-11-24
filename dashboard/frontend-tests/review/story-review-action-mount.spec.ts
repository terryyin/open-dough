// Review changes on a Backlog or Taken story's card, in the mounted Board
// frame: it follows Inspect story and Notes in the card's inspection group,
// below the launch group's Starts, wraps in reading order, and the keyboard
// reaches it from Inspect story. Opening it shows Intent's Changes for that
// story with the Changes tab focused. Which inputs offer it is the production
// rule's (`storyComparisonOffered`, proven in
// ../../backend-tests/review/story-review-workspace.spec.ts); these cases
// render a launch, a preparation, a claim and no workspace across the columns.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { paintContrast } from "../configuration/system-settings-reading.ts";
import { intentStoryCompare } from "../intent/intent-story-compare-page.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { emptyMachineAnswer } from "../navigation/board-frame-observation-supply.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { boardWork, story } from "../navigation/board-work.ts";

type Region = ReturnType<typeof page.getByRole>;

const subject = story("Review the story's changes", 71);
const workspace = { workspace: "/tmp/card-review", branch: "claude/story" };

const sources = {
  launch: () =>
    makeMe.aMachineAnswer
      .observingOpen(
        makeMe.aLaunchRecord
          .executing(subject)
          .onStoryBranch(workspace)
          .please(),
      )
      .please(),
  preparation: () =>
    makeMe.aMachineAnswer
      .observingOpen(
        makeMe.aLaunchRecord
          .refining(subject)
          .onStoryBranch(workspace)
          .please(),
      )
      .please(),
  claim: () =>
    makeMe.aMachineAnswer
      .holdingWorkspaces({
        ...workspace,
        source: "open-dough",
        identity: subject.identity,
        agent: "Yui",
      })
      .please(),
  none: () => makeMe.aMachineAnswer.please(),
};

async function mountCard(
  column: "Backlog" | "Taken",
  answer: MachineAnswer,
  viewport = { width: 1920, height: 900 },
) {
  await mountBoardFrame(
    boardWork(
      column === "Backlog" ? [subject] : [],
      column === "Taken" ? { taken: [subject] } : {},
    ),
    viewport,
    "stories",
    { answer: { ...emptyMachineAnswer(), ...answer } },
  );
  const card = boardReading
    .column(column)
    .getByRole("article", { name: subject.title, exact: true });
  await expect.element(card).toBeVisible();
  return card;
}

const inspection = (card: Region) =>
  card.getByRole("group", { name: "Inspection actions" });
const reviewChanges = (card: Region) =>
  inspection(card).getByRole("button", { name: "Review changes" });

async function expectChangesOpened() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const changes = intentStoryCompare().viewTab("Changes");
  await expect.element(changes).toHaveAttribute("aria-selected", "true");
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", subject.identity);
  await expect.element(changes).toHaveFocus();
}

const box = (region: Region) => region.element().getBoundingClientRect();

test.each([
  { width: 1920, height: 900, oneLine: true },
  { width: 320, height: 900, oneLine: false },
])(
  "at $width px the inspection group sits below the Starts in reading order, and the keyboard reaches Review changes from Inspect story and opens Changes focused",
  async ({ width, height, oneLine }) => {
    const card = await mountCard("Backlog", sources.launch(), {
      width,
      height,
    });
    const starts = card.getByRole("group", { name: "Launch actions" });
    const inspect = inspection(card).getByRole("button", {
      name: "Inspect story",
    });
    const notes = inspection(card).getByRole("button", {
      name: /^Notes(?: \(\d+\))?$/,
    });
    const action = reviewChanges(card);
    await expect.element(action).toBeVisible();
    expect(box(inspection(card)).top).toBeGreaterThanOrEqual(
      box(starts).bottom,
    );
    const [a, b, c] = [box(inspect), box(notes), box(action)] as const;
    const inOrder = (x: DOMRect, y: DOMRect) =>
      y.top >= x.bottom - 1 || (Math.abs(y.top - x.top) < 4 && y.left > x.left);
    expect(inOrder(a, b) && inOrder(b, c)).toBe(true);
    if (oneLine) expect(Math.abs(a.top - c.top)).toBeLessThan(4);
    const glyphs = action.element().querySelectorAll("svg");
    expect(action.element().firstElementChild).toBe(
      action.element().querySelector("svg.lucide-git-compare"),
    );
    expect(glyphs[glyphs.length - 1]).toBe(
      action.element().querySelector("svg.lucide-arrow-right"),
    );
    await expect.element(action).toHaveAccessibleName("Review changes");
    for (const glyph of glyphs) {
      expect(glyph.getAttribute("aria-hidden")).toBe("true");
      expect(
        paintContrast(glyph, [getComputedStyle(glyph).color]),
      ).toBeGreaterThanOrEqual(3);
    }
    inspect.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(inspection(card).getByRole("button", { name: "Hide detail" }))
      .toHaveFocus();
    await expect
      .element(
        card.getByRole("region", { name: `Detail for ${subject.title}` }),
      )
      .toBeVisible();
    await userEvent.tab();
    await expect.element(notes).toHaveFocus();
    await userEvent.tab();
    await expect.element(action).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expectChangesOpened();
  },
);

test.each([
  { column: "Backlog", source: "claim" },
  { column: "Taken", source: "preparation" },
  { column: "Backlog", source: "launch" },
] as const)(
  "a $column card offered Review changes by a $source opens its Changes with the tab focused",
  async ({ column, source }) => {
    const card = await mountCard(column, sources[source]());
    await reviewChanges(card).click();
    await expectChangesOpened();
  },
);

test.each(["Backlog", "Taken"] as const)(
  "a %s card with no workspace offers no Review changes",
  async (column) => {
    const card = await mountCard(column, sources.none());
    await expect
      .element(inspection(card).getByRole("button", { name: "Inspect story" }))
      .toBeVisible();
    await expect.element(reviewChanges(card)).not.toBeInTheDocument();
  },
);
