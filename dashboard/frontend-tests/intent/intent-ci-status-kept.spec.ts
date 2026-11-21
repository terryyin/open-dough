// Intent's CI homepage shows again after a perspective switch; Optimization
// Candidates stays chosen across Development and back; a project change
// starts again on Intent (SEED-219 examples 2, 10). A new trunk revision
// asks for the homepage judgment again, while time alone and another branch
// moving ask for none. The GitHub reads behind each judgment are
// ../../../e2e/intent/intent-ci-status.spec.ts and
// ../../../e2e/intent/intent-ci-status-story.spec.ts.

import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { watchedBranchHeads } from "../../src/progressSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { intentCandidates, intentViewTab } from "./intent-candidates-page.ts";
import {
  doughnutSource,
  filesColumnVisible,
  mountIntentPerspective,
  workOf,
} from "./intent-ci-perspective-mount.ts";
import {
  failingStory,
  fullSha,
  inertCiReads,
  judgedStatus,
  openDoughSource,
  takenStoryEntry,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const login = judgedStatus("main", "pass", "a1b2c3d", "Add login");

const configuredLocations: IntentLocations = {
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting("dashboard/tests/browse.spec.ts")
      .please(),
  ],
};

test("CI homepage shows again across Development and back; Optimization Candidates stays chosen; a project change starts again on Intent", async () => {
  const openDoughWork = workOf(openDoughSource, "e5e5e5e");
  const doughnutWork = workOf(doughnutSource, "f7f7f7f");
  const candidatesMarkdown = makeMe.aTestOptimizationCandidatesRecord.please();
  const readSource: IntentReadSource = {
    readLocations: (source) =>
      Promise.resolve(
        source.id === doughnutSource.id
          ? { status: "not-configured" }
          : configuredLocations,
      ),
    readFile: () => Promise.resolve(""),
    readCandidates: () =>
      Promise.resolve({ status: "present", text: candidatesMarkdown }),
  };

  const mounted = await mountIntentPerspective({
    work: openDoughWork,
    readSource,
    ciReads: inertCiReads({
      readStatus: () => Promise.resolve(login),
    }),
  });
  const ci = intentCiStatus();
  const candidates = intentCandidates();
  const intentMain = page.getByRole("main", { name: "Intent", exact: true });

  // CI homepage shows again across Development and back.
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await ci.answers("Passed at a1b2c3d (Add login)");
  mounted.showDevelopment();
  await expect.element(intentMain).not.toBeInTheDocument();
  mounted.showIntent();
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await ci.answers("Passed at a1b2c3d (Add login)");
  await expect.poll(filesColumnVisible).toBe(true);

  // Optimization Candidates is kept across Development and back.
  await candidates.choose();
  await expect.poll(filesColumnVisible).toBe(false);
  mounted.showDevelopment();
  await expect.element(intentMain).not.toBeInTheDocument();
  mounted.showIntent();
  await candidates.isChosen();
  await candidates.isRecordedAt(openDoughWork.revision);
  expect(
    [...candidates.record.element().querySelectorAll("code")].filter(
      (code) => code.textContent === openDoughWork.revision,
    ),
  ).toHaveLength(1);
  await expect.poll(filesColumnVisible).toBe(false);

  // A project change starts again on Intent, and so does returning.
  await mounted.showWork(doughnutWork);
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(
      page.getByText("No Intent locations are configured for Doughnut.", {
        exact: false,
      }),
    )
    .toBeVisible();

  await mounted.showWork(openDoughWork);
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(candidates.record).not.toBeInTheDocument();
  await expect.poll(filesColumnVisible).toBe(true);
  await expect.element(ci.panel).toBeVisible();
});

test("a new trunk revision asks for the homepage judgment again at the new head; time alone and another branch moving ask for none", async () => {
  const initialTrunk = fullSha("a1b2c3d");
  const initialBranchHead = "f1".repeat(20);
  const movedBranchHead = "f6".repeat(20);
  const nextTrunkHead = "e8".repeat(20);

  const workAt = (
    revision: string,
    retrievedAt: string,
    storyBranchHead: string,
  ): PublishedWork =>
    makeMe.aPublishedWork
      .with({
        source: openDoughSource,
        revision,
        retrievedAt: new Date(retrievedAt),
        direction: "",
        taken: [
          {
            ...takenStoryEntry({ ...failingStory, agent: "Akiho" }),
            planPath: ".planning/slice-plans/example/PLAN.md",
            planSlices: {
              status: "interpreted",
              slices: [
                {
                  index: 1,
                  name: "Slice 1",
                  type: "Behavior",
                  status: "planned",
                },
              ],
            },
            progressSource: {
              kind: "branch",
              branch: failingStory.branch,
              head: storyBranchHead,
              profilePath: ".planning/agents/Akiho.json",
            },
          },
        ],
        backlog: [],
      })
      .please();

  const reads = { fresh: 0, kept: 0 };
  let currentAnswer = judgedStatus("main", "pass", "a1b2c3d", "Add login", {
    checkedAt: "2026-11-05T12:00:00.000Z",
  });

  const initialWork = workAt(
    initialTrunk,
    "2026-11-05T12:00:00.000Z",
    initialBranchHead,
  );
  expect(watchedBranchHeads(initialWork).get(failingStory.branch)).toBe(
    initialBranchHead,
  );

  const mounted = await mountIntentPerspective({
    work: initialWork,
    readSource: {
      readLocations: () => Promise.resolve(configuredLocations),
      readFile: () => Promise.resolve(""),
      readCandidates: () => Promise.resolve({ status: "absent" }),
    },
    ciReads: inertCiReads({
      readKeptStatus: () => {
        reads.kept += 1;
        return Promise.resolve({ none: true });
      },
      readStatus: () => {
        reads.fresh += 1;
        return Promise.resolve(currentAnswer);
      },
    }),
  });
  const ci = intentCiStatus();
  await ci.answers("Passed at a1b2c3d (Add login)");
  const firstCheck = await ci.showsChecked();
  const firstReads = { ...reads };

  // Time alone and another watched branch moving ask for no homepage judgment.
  await mounted.showWork(
    workAt(initialTrunk, "2026-11-05T12:01:00.000Z", initialBranchHead),
  );
  await mounted.showWork(
    workAt(initialTrunk, "2026-11-05T12:02:00.000Z", initialBranchHead),
  );
  const movedBranchWork = workAt(
    initialTrunk,
    "2026-11-05T12:02:30.000Z",
    movedBranchHead,
  );
  expect(watchedBranchHeads(movedBranchWork).get(failingStory.branch)).toBe(
    movedBranchHead,
  );
  await mounted.showWork(movedBranchWork);
  expect(reads).toEqual(firstReads);
  expect(await ci.showsChecked()).toBe(firstCheck);

  // Trunk moving to a new head asks for the homepage judgment again.
  currentAnswer = judgedStatus(
    "main",
    "failed",
    nextTrunkHead,
    "Plan the next story",
    { checkedAt: "2026-11-05T12:03:00.000Z" },
  );
  await mounted.showWork(
    workAt(nextTrunkHead, "2026-11-05T12:03:00.000Z", movedBranchHead),
  );
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await ci.answers("Failed at e8e8e8e (Plan the next story)");
  expect(ci.panel.element().textContent).not.toContain("later commits");
  await expect.poll(() => ci.showsChecked()).not.toBe(firstCheck);
  expect(reads.fresh).toBe(firstReads.fresh + 1);
});
