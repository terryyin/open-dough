// Published records and a paused page clock for the Taken completion journey.

import { renderSlicePlan } from "../../../tests/support/published-plan.mjs";
import { renderStorySection } from "../../../tests/support/published-seed.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";
import { expect, pausePageClockAt } from "../dashboardTest.ts";
import { expectMembership, parts } from "../dashboardPage.ts";
import { publishFiles } from "../publishedOrigin.ts";
import { profilePath } from "../branchProgressRecords.ts";
import { addedAt } from "../pathHistoryAnswers.ts";
import { describedRevisions } from "../describedRevisions.ts";

const repository = "terryyin/open-dough";
const revision = "a7".repeat(20);
export const branchHead = "b8".repeat(20);
export const branch = "story/complete";
const opened = new Date("2026-09-25T09:00:00.000Z");

const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

export const onBranch = "Completed on its story branch";
export const onTrunk = "Completed on trunk without product change";
export const allDone = "All slices done without a completion record";
export const adviceless = "Completion record without advice";
export const queued = "Queued story whose plan records completion";

export const noChange =
  "no product change, because the story delivered what it promised.";

type Story = {
  readonly title: string;
  readonly anchor: string;
  readonly agent?: string;
  readonly mode?: "trunk" | "story-branch";
};

const taken: readonly Story[] = [
  {
    title: onBranch,
    anchor: "on-branch",
    agent: "Akiho",
    mode: "story-branch",
  },
  { title: onTrunk, anchor: "on-trunk", agent: "Yuma", mode: "trunk" },
  { title: allDone, anchor: "all-done", agent: "Sola", mode: "trunk" },
  { title: adviceless, anchor: "adviceless", agent: "Mana", mode: "trunk" },
];
const queuedStory: Story = { title: queued, anchor: "queued" };
const stories: readonly Story[] = [...taken, queuedStory];

const planPath = (anchor: string) =>
  `.planning/slice-plans/094-${anchor}/PLAN.md`;
const seedPath = ".planning/seeds/SEED-094-complete.md";
const href = (anchor: string) => `seeds/SEED-094-complete.md#${anchor}`;

const entry = ({ title, anchor }: Story) =>
  makeMe.aBacklogEntry
    .with({ title, identity: `SEED-094#${anchor}`, href: href(anchor) })
    .please();

const membership = stories.map(entry);

// The seed prose the dashboard reads; each story's state is a declared fact.
const seed = `# Execution complete card fixture

${membership.map((story) => renderStorySection(story)).join("\n")}`;

const { trunk, branchTip } = describedRevisions(
  makeMe.aRepository
    .withRevision("trunk", {
      backlog: {
        taken: membership.slice(0, taken.length),
        queued: membership.slice(taken.length),
      },
      files: {
        [seedPath]: seed,
        // Trunk's copy of the branch story's plan is as it was at Take.
        [planPath("on-branch")]: renderSlicePlan(
          makeMe.aSlicePlan
            .withStatuses(["planned", "planned", "planned"])
            .please(),
          { heading: "Slices" },
        ),
        [planPath("on-trunk")]: renderSlicePlan(
          makeMe.aSlicePlan
            .withStatuses(["done", "done"], { advice: noChange })
            .please(),
          { heading: "Slices" },
        ),
        [planPath("all-done")]: renderSlicePlan(
          makeMe.aSlicePlan.withStatuses(["done", "done"]).please(),
          { heading: "Slices" },
        ),
        // A completion record whose advice section is not readable advice.
        [planPath("adviceless")]: `${renderSlicePlan(
          makeMe.aSlicePlan.withStatuses(["done", "done"]).please(),
          { heading: "Slices" },
        )}
## Execution complete

The retrospective found nothing to record.
`,
        [planPath("queued")]: renderSlicePlan(
          makeMe.aSlicePlan
            .withStatuses(["done"], { advice: "Queue the next story." })
            .please(),
          { heading: "Slices" },
        ),
      },
      storyStates: stories.map(({ anchor }) => ({
        identity: `SEED-094#${anchor}`,
        href: href(anchor),
        ...makeMe.aStoryPreparation
          .plannedIn(`../slice-plans/094-${anchor}/PLAN.md`)
          .please(),
      })),
      agentProfiles: taken.flatMap(({ anchor, agent, mode }) =>
        agent === undefined || mode === undefined
          ? []
          : [
              makeMe.anAgentProfile
                .executing({
                  name: agent,
                  identity: `SEED-094#${anchor}`,
                  mode,
                  branch: mode === "trunk" ? "origin/main" : branch,
                  host: "claude",
                })
                .please(),
            ],
      ),
    })
    .withRevision("branchTip", {
      files: {
        [planPath("on-branch")]: renderSlicePlan(
          makeMe.aSlicePlan
            .withStatuses(["done", "done", "done"], {
              advice: "Queue a story to show the advice on the card.",
            })
            .please(),
          { heading: "Slices" },
        ),
      },
    })
    .please(),
  { trunk: revision, branchTip: branchHead },
);

export async function openTakenExecutionComplete(page: Page) {
  await pausePageClockAt(page, opened);
  await publishFiles(page, {
    repository,
    revision,
    files: trunk.files,
    committed: {
      [planPath("on-branch")]: minutesBefore(3 * 24 * 60),
      [planPath("on-trunk")]: minutesBefore(15),
      [planPath("all-done")]: minutesBefore(20),
      [planPath("adviceless")]: minutesBefore(25),
    },
    history: {
      [profilePath("Akiho")]: [addedAt(0x71, minutesBefore(90))],
      [profilePath("Yuma")]: [addedAt(0x72, minutesBefore(60))],
      [profilePath("Sola")]: [addedAt(0x73, minutesBefore(60))],
      [profilePath("Mana")]: [addedAt(0x74, minutesBefore(60))],
    },
    branches: {
      [branch]: {
        ...branchTip,
        committed: { [planPath("on-branch")]: minutesBefore(40) },
      },
    },
  });
  await page.goto("/");
  await expectMembership(page, {
    taken: taken.map(({ title }) => title),
    backlog: [queued],
  });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  await expect(page.getByText("Reading completion time…")).toHaveCount(0);
  return parts(page);
}
