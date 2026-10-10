// A published project whose revision B changes only product code after A, and
// what the page shows once every fact of its Taken card is read, shared by
// the specs of what a newly published commit costs and when its cards show.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import type { PublishedRevision } from "./publishedFiles.ts";
import { slicePlan } from "./branchProgressRecords.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import { addedAt, type MadeCommit } from "./pathHistoryAnswers.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const repository = "terryyin/open-dough";
export const revisionA = "7a".repeat(20);
export const revisionB = "7b".repeat(20);
export const opened = new Date("2026-10-07T09:00:00.000Z");
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const seedPath = ".planning/seeds/SEED-271-refresh.md";
export const planPath = ".planning/slice-plans/271-refresh/PLAN.md";
export const profilePath = ".planning/agents/akiho-chan.json";
export const settingsPath = ".planning/open-dough.json";
export const donePath = ".planning/done/SEED-270_done.json";
export const doneCatalogPath = ".planning/done/.catalog.json";

export const takenTitle = "Refresh without rereading";
export const queuedTitle = "Queued beside it";

export const backlog = `# Product backlog

## Taken

- [${takenTitle}](seeds/SEED-271-refresh.md#refresh) — SEED-271#refresh

## Backlog list

- [${queuedTitle}](seeds/SEED-271-refresh.md#queued) — SEED-271#queued
`;

export const seed = `# Refresh fixture

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

// The done record is published with the done catalog beside it, which lists
// it as a record it could not read.
export const files: Record<string, string> = withDoneCatalog(
  {
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
  },
  ".planning/done",
);

export const atA: PublishedRevision = {
  revision: revisionA,
  files,
  committed: { [planPath]: minutesBefore(30) },
  history: { [profilePath]: [addedAt(0x71, minutesBefore(60))] },
};

// B changes only product code.
export const atB: PublishedRevision = { ...atA, revision: revisionB };
export const productCodeCommit: MadeCommit = {
  sha: "7c".repeat(20),
  committer: "Fixture Committer",
  files: [{ filename: "dashboard/src/app.ts", status: "modified" }],
};

// The page once the project's membership and every fact the Taken card waits
// on -- its progress, credited human, and slice clock -- are read at
// `revision`.
export async function expectSettledAt(
  page: Page,
  revision: string,
  backlogTitles = [queuedTitle],
) {
  const { source, taken } = parts(page);
  await expect(source).toContainText(revision);
  await expectMembership(page, { taken: [takenTitle], backlog: backlogTitles });
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
  // A card shown before keeps its facts while a new revision is read, so
  // only the page's own reads say that read has ended.
  await untilPageReadsAnswered(page);
}

// The record texts and listings asked at `revision` among `asked`.
export const recordsReadAt = (asked: readonly string[], revision: string) =>
  asked.filter(
    (call) =>
      (call.startsWith("content ") || call.startsWith("listing ")) &&
      call.endsWith(`@${revision}`),
  );
