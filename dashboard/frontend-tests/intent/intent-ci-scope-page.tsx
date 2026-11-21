// A selected story's CI comparison beside its Summary and file Proof: the
// actual evidence owner (../../src/IntentCiEvidence.tsx) and the one Show %
// preference in the production reading place, the story's comparison shown
// by IntentCiStatus, and the real location tree, Summary and file Proof
// (../../test-support/comparison-mount/scope.tsx) over the story's typed
// locations and overlay, all reading through typed sources.
import type { ReactElement } from "react";
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { IntentCiStatus } from "../../src/IntentCiStatus.tsx";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import {
  IntentReadSourceOnPage,
  type IntentReadSource,
} from "../../src/intentReadSource.ts";
import { ComparisonMountScope } from "../../test-support/comparison-mount/scope.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  activeComparisonIn,
  rowTextsOf,
  textsIn,
  visibleText,
} from "./intent-ci-comparison-page.ts";
import { ciReadsOf, StoryCiEvidence } from "./intent-ci-evidence-page.tsx";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import "../../src/intent-page.css";

// The comparison's figure columns after its Counts.
const columns = ["Counts", "Baseline", "Branch", "Landed"] as const;
type Column = (typeof columns)[number];

function scopeOf(
  story: ComparedStory,
  ci: IntentCiReadSource,
  reads: IntentReadSource,
): ReactElement {
  return (
    <IntentReadSourceOnPage value={reads}>
      <StoryCiEvidence story={story} reads={ci}>
        <section aria-label="CI comparison">
          <IntentCiStatus />
        </section>
        {story.scope !== undefined && (
          <ComparisonMountScope key={story.identity} facts={story.scope} />
        )}
      </StoryCiEvidence>
    </IntentReadSourceOnPage>
  );
}

// Source text the Summary or file Proof asks for; a Summary asks for none.
function textReads() {
  const asked: string[] = [];
  const reads: IntentReadSource = {
    readLocations: () => Promise.reject(new Error("No locations arranged")),
    readCandidates: () => Promise.resolve({ status: "absent" }),
    readFile: (...[, path]) => {
      asked.push(path);
      return Promise.resolve("");
    },
  };
  return { asked, reads };
}

// Where a relative mark's bar extends, and how far as a fraction of one side.
export function markOf(figure: Locator) {
  const mark = figure.element().querySelector(".intent-ci-time-mark");
  if (mark === null) throw new Error("Mark not drawn.");
  const box = mark.getBoundingClientRect();
  const bar = mark.querySelector(".intent-ci-time-bar");
  if (bar === null) throw new Error("Mark not drawn.");
  return {
    direction: mark.getAttribute("data-direction"),
    reach: bar.getBoundingClientRect().width / (box.width / 2),
  };
}

// One shown region's comparison readings and controls.
function comparisonIn(region: Locator) {
  const texts = textsIn(region);
  return {
    region,
    ...activeComparisonIn(region),
    framing: () => texts(".intent-ci-comparison-framing"),
    // Every comparison frame or framing paragraph the region shows.
    frames: () =>
      texts(".intent-ci-comparison-frame, .intent-ci-comparison-framing"),
    percentages: () => texts(".intent-ci-time-percent"),
    // The words heard in STORY's comparison identity strip, in order.
    labels: (story: string) =>
      [
        ...(region
          .element()
          .querySelector(`[aria-label="CI timing comparison of ${story}"]`)
          ?.querySelectorAll(".intent-evidence-label-heard") ?? []),
      ].map(visibleText),
    showPercent: region.getByRole("checkbox", { name: "Show %", exact: true }),
    // Opens a Summary child or file by keyboard, which skips the pointer's
    // frame-paced stability wait. A child with several units heads one
    // row per unit; the first opens it.
    async open(name: string) {
      const child = region
        .getByRole("table")
        .getByRole("rowheader")
        .getByRole("button", { name, exact: true })
        .first();
      await expect.element(child).toBeVisible();
      (child.element() as HTMLElement).focus();
      await userEvent.keyboard("{Enter}");
    },
    // PATH's own comparison figure under COLUMN.
    figure: (path: string, column: Column) =>
      region
        .getByRole("group", { name: `CI proof of ${path}` })
        .getByRole("definition")
        .nth(columns.indexOf(column)),
    // One child's comparison figure; the Change cell precedes the columns.
    cell: (path: string, child: string, column: Column) =>
      region
        .getByRole("table", {
          name: `CI proof of the immediate folders and files of ${path}`,
        })
        .getByRole("row")
        .filter({ has: page.getByRole("rowheader", { name: child }) })
        .getByRole("cell")
        .nth(1 + columns.indexOf(column)),
    // The own figures group NAME (`CI proof of <path>: <unit>`), Parts last.
    figuresOf: (name: string) =>
      region
        .getByRole("group", { name, exact: true })
        .getByRole("definition")
        .elements()
        .map(visibleText),
    // Each body row of the table named NAME: its header, then its cells.
    rowsOf: (name: string) =>
      rowTextsOf(region.getByRole("table", { name, exact: true })),
    // The file Proof's comparison figure under COLUMN.
    fileCell: (path: string, column: Column) =>
      region
        .getByRole("table", { name: `CI proof of ${path}`, exact: true })
        .getByRole("cell")
        .nth(columns.indexOf(column)),
  };
}

// The story's CI reads, each run's proof answered with its published entries.
export function scopeReadsOf(story: ComparedStory) {
  const reads = ciReadsOf(story);
  reads.answers.proof = (subject) =>
    story.entryProof(subject.runId as number).proof;
  return reads;
}

export async function mountCiScope(
  story: ComparedStory,
  ci: IntentCiReadSource,
) {
  const text = textReads();
  const mounted = await mountComponent(scopeOf(story, ci, text.reads), {
    viewport: { width: 1280, height: 600 },
  });
  return {
    textReads: text.asked,
    story: comparisonIn(
      page.getByRole("region", { name: "CI comparison", exact: true }),
    ),
    summary: comparisonIn(
      page.getByRole("region", { name: "Summary", exact: true }),
    ),
    proof: comparisonIn(
      page.getByRole("region", { name: "Proof", exact: true }),
    ),
    // The page selects another story.
    selects(next: ComparedStory) {
      mounted.rerender(scopeOf(next, ci, text.reads));
    },
  };
}
