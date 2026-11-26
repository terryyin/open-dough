// A card's review opens its first changed file once the comparison settles
// (../../src/useFirstStoryChangedFile.ts), unless the reader has chosen a
// file. A choice made as the settled comparison is shown, before React runs
// that render's effects, stays chosen.

import { createElement, useState } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import {
  StoryReviewOpeningProvider,
  useOpenStoryChanges,
} from "../../src/pageStoryReviewOpening.tsx";
import {
  StorySelectionProvider,
  usePageStorySelection,
} from "../../src/pageStorySelection.tsx";
import type { IntentTreeFile } from "../../src/intentStoryOverlay.ts";
import { useFirstStoryChangedFile } from "../../src/useFirstStoryChangedFile.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const story = { project: "open-dough", identity: "SEED-A#a" };
const changedFiles: readonly IntentTreeFile[] = [
  { path: "first.txt", kind: "modified", published: true },
];

type Shown = { readonly settled: boolean; readonly round: number };

function Review({ settled, round }: Shown) {
  const openChanges = useOpenStoryChanges();
  const [selected, setSelected] = useState("none");
  const noteChoice = useFirstStoryChangedFile({
    project: story.project,
    storyIdentity: story.identity,
    canChooseFile: settled,
    changedFiles,
    hasSelection: selected !== "none",
    open: ({ path }) => {
      setSelected(path);
    },
  });
  return createElement(
    "div",
    { "data-settled": String(settled), "data-round": String(round) },
    createElement(
      "button",
      { type: "button", onClick: () => openChanges?.(story) },
      "Review changes",
    ),
    createElement(
      "button",
      {
        type: "button",
        id: "chosen",
        onClick: () => {
          noteChoice();
          setSelected("chosen.txt");
        },
      },
      "chosen.txt",
    ),
    createElement("output", { role: "status" }, selected),
  );
}

function ReviewPage(shown: Shown) {
  const selection = usePageStorySelection();
  return createElement(StorySelectionProvider, {
    selection,
    children: createElement(StoryReviewOpeningProvider, {
      intentProject: story.project,
      children: createElement(Review, shown),
    }),
  });
}

// Opens the review, then shows its settled comparison; `choose` runs as that
// render reaches the page, before its effects.
async function openThenSettle(choose?: () => void) {
  const review = await mountComponent(
    createElement(ReviewPage, { settled: false, round: 0 }),
  );
  await page.getByRole("button", { name: "Review changes" }).click();
  const shown = new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-settled="true"]') === null) return;
      observer.disconnect();
      choose?.();
      resolve();
    });
    observer.observe(document.body, { attributes: true, subtree: true });
  });
  review.rerender(createElement(ReviewPage, { settled: true, round: 0 }));
  await shown;
  // A later render applies every update queued before it.
  review.rerender(createElement(ReviewPage, { settled: true, round: 1 }));
  await expect.element(page.getByRole("status")).toBeInTheDocument();
  await expect
    .poll(() => document.querySelector('[data-round="1"]'))
    .not.toBeNull();
  return page.getByRole("status");
}

test("the settled comparison opens its first changed file", async () => {
  const selected = await openThenSettle();
  await expect.element(selected).toHaveTextContent("first.txt");
});

test("a file chosen as the settled comparison is shown stays chosen", async () => {
  const selected = await openThenSettle(() => {
    document.querySelector<HTMLButtonElement>("#chosen")?.click();
  });
  await expect.element(selected).toHaveTextContent("chosen.txt");
});
