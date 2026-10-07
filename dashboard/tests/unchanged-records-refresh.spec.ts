// A newly published commit that changes none of a project's planning records
// costs the page only GitHub's account of that commit: once the page showed
// revision A, the check that finds B has the local read boundary compare A
// with B and read the one commit between, and the page shows B with the same
// facts without any backlog, seed, plan, profile, setting, or done-record
// text or listing being read again. A second tab costs what a reload does,
// and a restarted dashboard process reads B in full. The fake GitHub only
// publishes the commits (./publishedFiles.ts); the local read boundary, its
// memo, and the page decide what is asked and shown.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  publishMovingFiles,
  type PublishedRevision,
} from "./publishedFiles.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { slicePlan } from "./branchProgressRecords.ts";
import { addedAt, type MadeCommit } from "./pathHistoryAnswers.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { startDashboardServer } from "./support/dashboardServer.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const repository = "terryyin/open-dough";
const revisionA = "7a".repeat(20);
const revisionB = "7b".repeat(20);
const opened = new Date("2026-10-07T09:00:00.000Z");
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const seedPath = ".planning/seeds/SEED-271-refresh.md";
const planPath = ".planning/slice-plans/271-refresh/PLAN.md";
const profilePath = ".planning/agents/akiho-chan.json";
const settingsPath = ".planning/open-dough.json";
const donePath = ".planning/done/SEED-270_done.json";

const takenTitle = "Refresh without rereading";
const queuedTitle = "Queued beside it";

const backlog = `# Product backlog

## Taken

- [${takenTitle}](seeds/SEED-271-refresh.md#refresh) — SEED-271#refresh

## Backlog list

- [${queuedTitle}](seeds/SEED-271-refresh.md#queued) — SEED-271#queued
`;

const seed = `# Refresh fixture

<a id="refresh"></a>

### ${takenTitle}

**Identity:** SEED-271#refresh
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/271-refresh/PLAN.md"}
\`\`\`

<a id="queued"></a>

### ${queuedTitle}

**Identity:** SEED-271#queued
`;

const files: Record<string, string> = {
  [backlogPath]: backlog,
  [seedPath]: seed,
  [planPath]: slicePlan(5, 2),
  [profilePath]: renderAgentProfile({
    name: "Akiho",
    identity: "SEED-271#refresh",
    mode: "trunk",
    branch: "main",
    host: "claude",
    model: undefined,
  }),
  [settingsPath]: "{}\n",
  [donePath]: `{"note":"an earlier story's done record"}\n`,
};

const atA: PublishedRevision = {
  revision: revisionA,
  files,
  committed: { [planPath]: minutesBefore(30) },
  history: { [profilePath]: [addedAt(0x71, minutesBefore(60))] },
};

// B changes only product code.
const atB: PublishedRevision = { ...atA, revision: revisionB };
const productCodeCommit: MadeCommit = {
  sha: "7c".repeat(20),
  committer: "Fixture Committer",
  files: [{ filename: "dashboard/src/app.ts", status: "modified" }],
};

// The page once the project's membership and every fact the Taken card waits
// on -- its progress, credited human, and slice clock -- are read at
// `revision`.
async function expectSettledAt(page: Page, revision: string) {
  const { source, taken } = parts(page);
  await expect(source).toContainText(revision);
  await expectMembership(page, { taken: [takenTitle], backlog: [queuedTitle] });
  const card = taken.getByRole("article", { name: takenTitle });
  await expect(
    card.getByRole("img", { name: "2 of 5 slices recorded complete" }),
  ).toBeVisible();
  await expect(card).toContainText("Akiho");
  await expect(card).toContainText("Fixture Committer");
  await expect(card).toContainText("Current slice started 30 min ago");
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
}

// The record texts and listings asked at `revision` among `asked`.
const recordsReadAt = (asked: readonly string[], revision: string) =>
  asked.filter(
    (call) =>
      (call.startsWith("content ") || call.startsWith("listing ")) &&
      call.endsWith(`@${revision}`),
  );

test("a commit that changes no planning record is shown without reading the unchanged records again; a second tab and a restarted dashboard cost what they did", async ({
  page,
  github,
}) => {
  await pausePageClockAt(page, opened);
  const origin = publishMovingFiles(page, { repository, ...atA });

  await page.goto("/");
  await expectSettledAt(page, revisionA);
  expect(recordsReadAt(readsBesideChecks(origin.requests), revisionA)).toEqual(
    expect.arrayContaining([
      `content ${backlogPath}@${revisionA}`,
      `content ${seedPath}@${revisionA}`,
      `content ${planPath}@${revisionA}`,
      `listing .planning/agents@${revisionA}`,
      `content ${profilePath}@${revisionA}`,
      `content ${settingsPath}@${revisionA}`,
      `listing .planning/done@${revisionA}`,
      `content ${donePath}@${revisionA}`,
    ]),
  );

  await test.step("the check finds B and the page shows it after one comparison and one commit read, reading no record", async () => {
    const before = origin.requests.length;
    origin.moveTrunk(atB, [productCodeCommit]);
    await passTimeUntilChecked(page);
    await expectSettledAt(page, revisionB);
    const asked = readsBesideChecks(origin.requests.slice(before));
    expect(asked.filter((call) => call === "compare")).toHaveLength(1);
    expect(asked.filter((call) => call === "commit")).toHaveLength(1);
    expect(recordsReadAt(asked, revisionB)).toEqual([]);
    expect(
      origin.requests
        .slice(before)
        .flatMap(({ request }) =>
          request.kind === "compare"
            ? [`${request.base}...${request.head}`]
            : request.kind === "commit"
              ? [request.sha]
              : [],
        ),
    ).toEqual([`${revisionA}...${revisionB}`, productCodeCommit.sha]);
  });

  await test.step("a second tab asks only which commit the ref names", async () => {
    const before = origin.requests.length;
    const second = await page.context().newPage();
    await second.goto("/");
    await expectSettledAt(second, revisionB);
    expect(readsBesideChecks(origin.requests.slice(before))).toEqual([
      "ref main",
    ]);
    await second.close();
  });

  await test.step("a restarted dashboard process holds nothing, so it reads B in full and compares nothing", async () => {
    const restarted = await startDashboardServer({ mode: "dev", github });
    try {
      const before = origin.requests.length;
      await page.goto(restarted.baseURL);
      await expectSettledAt(page, revisionB);
      const asked = readsBesideChecks(origin.requests.slice(before));
      expect(asked).not.toContain("compare");
      expect(recordsReadAt(asked, revisionB)).toEqual(
        expect.arrayContaining([
          `content ${backlogPath}@${revisionB}`,
          `content ${seedPath}@${revisionB}`,
          `content ${planPath}@${revisionB}`,
          `listing .planning/agents@${revisionB}`,
          `content ${profilePath}@${revisionB}`,
          `listing .planning/done@${revisionB}`,
          `content ${donePath}@${revisionB}`,
        ]),
      );
    } finally {
      await restarted.close();
    }
  });
});
