// Typed observation, Intent, Candidates, review and CI for Project Intent
// visits on the production Board frame (../navigation/board-frame-mount.ts).
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardReading as board } from "../navigation/board-reading-page.ts";
import {
  inertCiReads,
  judgedStatus,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

export const storyA = {
  identity: "SEED-1#story-a",
  title: "Story A",
  branch: "claude/story-a",
};
const revision = "a1".repeat(20);
export const candidatePath = "dashboard/tests/a.spec.ts";
const deepPath = "dashboard/tests/boundary/deep/long.spec.ts";
export const deepSpec = `Added ${deepPath}`;
export const changed = {
  modified: "Modified dashboard/tests/a.spec.ts",
} as const;

const publishedA = [...Array(12).keys()].map((n) => `a ${n}\n`).join("");
const longLines = [...Array(120).keys()].map((n) => `long ${n + 1}`);
const longDiff = makeMe.aReviewedFileDiff
  .adding(deepPath, ...longLines)
  .please();
const longText: ReviewedFileText = {
  kind: "text",
  baseline: null,
  tree: `${longLines.join("\n")}\n`,
};
const location = makeMe.anIntentLocation
  .at("dashboard/tests")
  .ofKind("typescript", ["**/*.spec.ts"])
  .selecting(
    candidatePath,
    "dashboard/tests/boundary/kept.spec.ts",
    "dashboard/tests/other/c.spec.ts",
    "dashboard/tests/out/leaving.spec.ts",
  )
  .please();
const storyReview = makeMe.aStoryReview
  .modifying(candidatePath)
  .adding("dashboard/tests/boundary/b.spec.ts")
  .adding(deepPath, 120)
  .please();
const candidatesText = makeMe.aTestOptimizationCandidatesRecord
  .pending("a-spec-cost", `\`${candidatePath}\``)
  .please();

export const intent = page.getByRole("main", { name: "Intent", exact: true });
export const development = page.getByRole("radio", {
  name: "Development",
  exact: true,
});
export const intentChoice = page.getByRole("radio", {
  name: "Intent",
  exact: true,
});
export const story = intentStoryCompare();

export const intentContext = () =>
  intent
    .element()
    .querySelector(".intent-page-frame")
    ?.getAttribute("data-intent-context");

function projectVisitCard() {
  return board
    .column("Taken")
    .getByRole("article", { name: storyA.title, exact: true });
}

export async function mountProjectVisit() {
  const reads: string[] = [];
  const work = makeMe.aPublishedWork
    .of(openDoughSource)
    .at(revision)
    .taking(storyA)
    .please();
  const filesRead = new Set<string>();
  let candidatesOnce:
    { readonly status: "present"; readonly text: string } | undefined;
  const intentReads: IntentReadSource = {
    readLocations: () =>
      Promise.resolve({ status: "configured", locations: [location] }),
    readFile: (...[, path]) => {
      // Match answerMemo: record one published-text fetch per path.
      if (!filesRead.has(path)) {
        filesRead.add(path);
        reads.push(`text ${path}`);
      }
      return Promise.resolve(path === candidatePath ? publishedA : `${path}\n`);
    },
    readCandidates: () => {
      if (candidatesOnce === undefined) {
        reads.push("candidates");
        candidatesOnce = { status: "present", text: candidatesText };
      }
      return Promise.resolve(candidatesOnce);
    },
  };
  const review: ReviewSource = {
    review: () => Promise.resolve(storyReview),
    range: () => Promise.reject(new Error("Unexpected review range")),
    fileDiff: (query) => {
      if (query.path === deepPath) return Promise.resolve(longDiff);
      if (query.path === candidatePath)
        return Promise.resolve(
          makeMe.aReviewedFileDiff.adding(candidatePath, "more").please(),
        );
      return Promise.reject(new Error(`Unexpected diff ${query.path}`));
    },
    fileText: (query) => {
      if (query.path === deepPath) return Promise.resolve(longText);
      return Promise.resolve({
        kind: "text",
        baseline: publishedA,
        tree: `${publishedA}more\n`,
      });
    },
  };
  await mountBoardFrame(
    work,
    { width: 1280, height: 800 },
    "stories",
    {
      answer: makeMe.aMachineAnswer
        .holdingWorkspaces({
          source: openDoughSource.id,
          identity: storyA.identity,
          agent: "claude",
          workspace: "/tmp/intent-story",
          branch: storyA.branch,
        })
        .please(),
    },
    {
      intentReads,
      review,
      ci: inertCiReads({
        readStatus: (...[, branch]) =>
          Promise.resolve(
            judgedStatus(branch, "unread", revision, "No readable result", {
              reason:
                "No result of the selected check was found in the readable history",
            }),
          ),
      }),
    },
  );
  return { reads, work };
}

export async function selectTakenStoryInIntent() {
  const card = projectVisitCard();
  await card.getByRole("heading", { name: storyA.title, exact: true }).click();
  await board.expectStorySelection(card, true);
  await intentChoice.click();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", storyA.identity);
  await story.chooseTab("Changes");
  return card;
}
