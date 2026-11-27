import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PageReads } from "../../src/pageReads.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { inertCiReads, openDoughSource } from "./intent-ci-status-fixtures.ts";

export const projectRevision = "a1".repeat(20);
export const freshRevision = "b2".repeat(20);
export const firstCompletion = "c3".repeat(20);
export const secondCompletion = "d4".repeat(20);
export const storyA = { identity: "SEED-A#a", title: "Story A" };
export const storyB = { identity: "SEED-B#b", title: "Story B" };

export function locationsOf(folder: string, ...files: string[]) {
  return makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(folder)
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting(...files)
        .please(),
    )
    .please();
}

export async function openDoneReading({
  readLocations,
  readFile,
  review,
  fileDiff,
  fileText,
  coverage,
  withSecondStory = false,
}: Pick<PageReads["intent"], "readLocations" | "readFile"> &
  Pick<PageReads["review"], "review"> &
  Partial<Pick<PageReads["review"], "fileDiff" | "fileText">> & {
    readonly coverage?: string;
    readonly withSecondStory?: boolean;
  }) {
  const completedAt = new Date().toISOString();
  const first = makeMe.aDoneRecord.completed({ ...storyA, completedAt });
  if (coverage !== undefined) first.withIntentCoverage({ report: coverage });
  const records = [first.please()];
  if (withSecondStory)
    records.push(
      makeMe.aDoneRecord.completed({ ...storyB, completedAt }).please(),
    );
  const { done, doneReads } = makeMe.aDoneCatalog.holding(records).please();
  const workAt = (revision: string) =>
    makeMe.aPublishedWork
      .with({
        ...makeMe.aPublishedWork.of(openDoughSource).at(revision).please(),
        done: { ...done, revision },
      })
      .please();
  const machine = makeMe.aMachineAnswer;
  if (withSecondStory)
    machine.observingDone(
      makeMe.aLaunchRecord
        .executing(storyB)
        .inClaudeSession({
          sessionId: "completed-story-b",
          shortId: "story-b",
        })
        .markedDoneAt(completedAt)
        .please(),
    );

  const reads = pageReadsSupplying({});
  const opened = await mountIntentCiPage({
    work: workAt(projectRevision),
    machine: machine.please(),
    selected: storyA.identity,
    reads: {
      ci: inertCiReads(),
      intent: { ...reads.intent, readLocations, readFile },
      review: {
        ...reads.review,
        review,
        ...(fileDiff === undefined ? {} : { fileDiff }),
        ...(fileText === undefined ? {} : { fileText }),
      },
      done: doneReads,
    },
  });
  return {
    showFreshWork: () => opened.showWork(workAt(freshRevision)),
  };
}

export async function selectSecondStoryInSidebar() {
  await userEvent.keyboard("{Meta>}b{/Meta}");
  const sidebar = page.getByRole("complementary", {
    name: "Sessions sidebar",
    exact: true,
  });
  const done = sidebar.getByRole("region", {
    name: "Recently done sessions",
    exact: true,
  });
  const disclosure = done.getByRole("button", {
    name: "Recently done sessions",
    exact: true,
  });
  await expect.element(disclosure).toHaveAttribute("aria-expanded", "false");
  await disclosure.click();
  await done.getByRole("button", { name: storyB.title, exact: true }).click();
}
