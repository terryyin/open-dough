// A Taken card whose plan, where its progress is published, records the
// execution as complete says "Execution complete, awaiting wrap-up" and how
// long ago the plan's last commit there -- the completion commit -- was made,
// instead of the current slice's clock; the detail shows the recorded advice.
// All slices done without the record is ordinary slice progress, a record
// without advice is the record's gap, and queued work shows no progress at
// all. The fake GitHub only publishes trunk, one story branch, profiles
// spelled by the shared profile renderer, and when each path was last
// committed; the page clock is paused. The local read boundary, the shared
// readers, and the page decide everything shown.

import type { Page } from "@playwright/test";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  completedPlan,
  profilePath,
  slicePlan,
} from "./branchProgressRecords.ts";

const repository = "terryyin/open-dough";
const revision = "a7".repeat(20);
const branchHead = "b8".repeat(20);
const branch = "story/complete";
const opened = new Date("2026-09-25T09:00:00.000Z");

const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

const onBranch = "Completed on its story branch";
const onTrunk = "Completed on trunk without product change";
const allDone = "All slices done without a completion record";
const adviceless = "Completion record without advice";
const queued = "Queued story whose plan records completion";

const noChange =
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
const stories: readonly Story[] = [
  ...taken,
  { title: queued, anchor: "queued" },
];

const planPath = (anchor: string) =>
  `.planning/slice-plans/094-${anchor}/PLAN.md`;

const entry = ({ title, anchor }: Story) =>
  `- [${title}](seeds/SEED-094-complete.md#${anchor}) — SEED-094#${anchor}`;

const backlog = `# Product backlog

## Taken

${taken.map(entry).join("\n")}

## Backlog list

${entry(stories[stories.length - 1] as Story)}
`;

const seed = `# Execution complete card fixture

${stories
  .map(
    ({ title, anchor }) => `<a id="${anchor}"></a>

### ${title}

**Identity:** SEED-094#${anchor}
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/094-${anchor}/PLAN.md"}
\`\`\`
`,
  )
  .join("\n")}`;

const trunkFiles: Record<string, string> = {
  ".planning/PRODUCT-BACKLOG.md": backlog,
  ".planning/seeds/SEED-094-complete.md": seed,
  // Trunk's copy of the branch story's plan is as it was at Take.
  [planPath("on-branch")]: slicePlan(3, 0),
  [planPath("on-trunk")]: completedPlan(2, noChange),
  [planPath("all-done")]: slicePlan(2, 2),
  [planPath("adviceless")]: completedPlan(2),
  [planPath("queued")]: completedPlan(1, "Queue the next story."),
};
for (const { anchor, agent, mode } of taken) {
  if (agent !== undefined && mode !== undefined) {
    trunkFiles[profilePath(agent)] = renderAgentProfile({
      name: agent,
      identity: `SEED-094#${anchor}`,
      mode,
      branch: mode === "trunk" ? "origin/main" : branch,
      host: "claude",
      model: undefined,
    });
  }
}

async function openedAtOpening(page: Page) {
  await pausePageClockAt(page, opened);
  await publishFiles(page, {
    repository,
    revision,
    files: trunkFiles,
    committed: {
      [planPath("on-branch")]: minutesBefore(3 * 24 * 60),
      [profilePath("Akiho")]: minutesBefore(90),
      [planPath("on-trunk")]: minutesBefore(15),
      [profilePath("Yuma")]: minutesBefore(60),
      [planPath("all-done")]: minutesBefore(20),
      [profilePath("Sola")]: minutesBefore(60),
      [planPath("adviceless")]: minutesBefore(25),
      [profilePath("Mana")]: minutesBefore(60),
    },
    branches: {
      [branch]: {
        revision: branchHead,
        files: {
          ...trunkFiles,
          [planPath("on-branch")]: completedPlan(
            3,
            "Queue a story to show the advice on the card.",
          ),
        },
        committed: {
          [planPath("on-branch")]: minutesBefore(40),
          [profilePath("Akiho")]: minutesBefore(90),
        },
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

const complete = "Execution complete, awaiting wrap-up";

test("a Taken card whose plan records its execution as complete shows it awaiting wrap-up and since when, or the record's gap", async ({
  page,
}) => {
  const { taken: takenStage, backlog: backlogStage } =
    await openedAtOpening(page);
  const card = (title: string) =>
    takenStage.getByRole("article", { name: title });
  const progress = (title: string) => card(title).locator(".card-progress");

  await test.step("a Story Branch Mode plan completed 40 min ago on its branch is complete there, not in trunk, with no current slice clock", async () => {
    await expect(progress(onBranch)).toContainText(complete);
    await expect(progress(onBranch)).toContainText("Completed 40 min ago");
    await expect(progress(onBranch)).toContainText(
      `From branch ${branch} at ${branchHead.slice(0, 7)}; not in trunk.`,
    );
    await expect(progress(onBranch)).not.toContainText("Current slice started");
    await expect(progress(onBranch)).not.toContainText("0 of 3");
  });

  await test.step("a Trunk Mode record of no product change is complete, and the detail shows that advice", async () => {
    await expect(progress(onTrunk)).toContainText(complete);
    await expect(progress(onTrunk)).toContainText("Completed 15 min ago");
    await expect(progress(onTrunk).locator(".progress-source")).toHaveCount(0);
    await card(onTrunk).getByRole("button", { name: "Inspect story" }).click();
    const detail = card(onTrunk).getByRole("region", {
      name: `Detail for ${onTrunk}`,
    });
    await expect(detail.locator(".product-advice")).toHaveText(noChange);
  });

  await test.step("all slices done without the record is slice progress and its clock, not complete", async () => {
    await expect(
      progress(allDone).getByRole("img", {
        name: "2 of 2 slices recorded complete",
      }),
    ).toBeVisible();
    await expect(progress(allDone)).toContainText(
      "Current slice started 20 min ago",
    );
    await expect(progress(allDone)).not.toContainText("Execution complete");
    await expect(progress(allDone)).not.toContainText("Completed");
  });

  await test.step("a record without advice is the record's gap on the card, not complete", async () => {
    await expect(progress(adviceless)).toContainText(
      "This plan’s “## Execution complete” record has no readable “Product advice:” entry.",
    );
    await expect(progress(adviceless)).not.toContainText(complete);
    await expect(progress(adviceless)).not.toContainText("Completed");
  });

  await test.step("a queued entry whose plan records completion shows no complete state", async () => {
    const queuedCard = backlogStage.getByRole("article", { name: queued });
    await expect(queuedCard).toBeVisible();
    await expect(queuedCard).not.toContainText("Execution complete");
    await expect(queuedCard).not.toContainText("Completed");
  });

  await test.step("page time passing advances the waiting time", async () => {
    await page.clock.fastForward("02:00:00");
    await expect(progress(onBranch)).toContainText("Completed 2 h 40 min ago");
  });
});
