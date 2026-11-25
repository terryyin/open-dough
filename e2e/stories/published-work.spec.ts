import type { Locator } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectMembership,
  expectOwnersNotRecorded,
  openDirection,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { expectSideBySideInOrder } from "../../dashboard/test-support/pageLayout.ts";
import {
  canonicalRecord,
  focusCanonicalRecord,
  hideDetail,
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { storyDetail } from "../../dashboard/test-support/storyCardSelection.ts";

const revision = "4f2a9c1e7b3d5a6089c0d1e2f3a4b5c6d7e8f901";
const installTitle = "Repair the installer's update report";
const overviewTitle = "See the project's published work in a story dashboard";
const sourceTitle = "Prepare stories in a clear developer workspace workflow";
const queueTitle = "Queue trunk integration for agents on the same machine";
const externalNoteTitle = "Show <em>markup</em> in a title as the text it is";
const externalNote = "https://status.example.com/notes/2026-09?view=full#api";
const installPlan = "slice-plans/059-installer-update-report/PLAN.md";
const workspaceFile = `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`;
const workspaceSource = `${workspaceFile}#planning-workspace-procedure`;

// Exact bytes under proof: the shared reader reads each spelling a published
// backlog may hold, among them the older identity shorthand (`— SEED-008`)
// the backlog encoder no longer writes.
const publishedBacklog = `# Product backlog

## Near-future direction

Give developers visibility into a project's published work.
Derive it solely from Git state published to origin.

## Taken

- [${installTitle}](${installPlan})
- [${overviewTitle}](seeds/SEED-021-observe-published-story-progress.md#see-published-work) — SEED-021#see-published-work ([plan](slice-plans/061-published-story-dashboard/PLAN.md))

## Backlog list

- [${sourceTitle}](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure) — SEED-008#planning-workspace-procedure
- [${queueTitle}](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008
- [${externalNoteTitle}](${externalNote}) — SEED-030#markup-as-text
`;

// "Owner not recorded" states that no agent profile names an owner.
const claimsBeyondMembership =
  /\b(live|running|online|active|in progress|started|completed?|done|finished|owner(?! not recorded)|mode)\b/i;

async function showsInspectedIdentity(card: Locator, identity: string) {
  await expect(card).not.toContainText(identity);
  await inspectedDetail(card);
  await expect(card).toContainText(identity);
  await hideDetail(card);
}

test("published Board shows Backlog and Taken work read at one revision", async ({
  page,
}) => {
  const retrievedAt = new Date("2026-09-20T08:30:00.000Z");
  await page.clock.setFixedTime(retrievedAt);
  let releaseRef: () => void = () => undefined;
  const requests = await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(publishedBacklog) },
    refHeldUntil: new Promise<void>((resolve) => {
      releaseRef = resolve;
    }),
  });
  const externalReads: string[] = [];
  await page.context().route("https://status.example.com/**", async (route) => {
    externalReads.push(route.request().url());
    await route.abort();
  });

  await page.goto("/");

  const dashboard = parts(page);
  const { board, backlog, taken, recentlyDone, direction } = dashboard;
  await test.step("reading is shown before any work or count", async () => {
    await expect(dashboard.status).toHaveText("Reading published work…");
    await expect(board).toHaveCount(0);
    await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
    releaseRef();
  });

  await test.step("membership and recorded order", async () => {
    await expectMembership(page, {
      taken: [installTitle, overviewTitle],
      backlog: [sourceTitle, queueTitle, externalNoteTitle],
    });
    await expect(dashboard.reading).toHaveCount(0);
  });

  await test.step("Then the details show the recorded identities", async () => {
    await showsInspectedIdentity(storyCard(taken, installTitle), installPlan);
    await showsInspectedIdentity(
      storyCard(taken, overviewTitle),
      "SEED-021#see-published-work",
    );
    await showsInspectedIdentity(
      storyCard(backlog, queueTitle),
      "SEED-008#same-machine-merge-queue",
    );
  });
  await test.step("And the story omits the plan annotation", async () => {
    await expect(storyCard(taken, overviewTitle)).not.toContainText("([plan]");
  });

  await test.step("titles are text, never markup", async () => {
    await expect(board.locator("em")).toHaveCount(0);
  });
  await test.step("the external note shows its recorded address", async () => {
    const card = storyCard(backlog, externalNoteTitle);
    await expect(canonicalRecord(await inspectedDetail(card))).toHaveAttribute(
      "href",
      externalNote,
    );
    await hideDetail(card);
  });

  await test.step("Given the published source is available", async () => {
    await page.context().route(workspaceFile, (route) =>
      route.fulfill({
        body: "<h1>Published source</h1>",
        contentType: "text/html",
      }),
    );
  });
  const source = await test.step("When I use Enter on the link", async () => {
    const link = await focusCanonicalRecord(storyCard(backlog, sourceTitle));
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      link.press("Enter"),
    ]);
    return popup;
  });
  await test.step("Then the source opens at the read revision", async () => {
    await expect(source).toHaveURL(workspaceSource);
    await expect(
      source.getByRole("heading", { name: "Published source" }),
    ).toBeVisible();
  });
  await test.step("When I return to the Board", async () => {
    await source.close();
    const card = storyCard(backlog, sourceTitle);
    await expect(storyDetail(card)).toBeVisible();
    await hideDetail(card);
  });

  await test.step("backlog priority and column counts", async () => {
    await expect(backlog.getByText(/^Priority \d+$/)).toHaveText([
      "Priority 1",
      "Priority 2",
      "Priority 3",
    ]);
    await expect(taken.getByText(/Priority/)).toHaveCount(0);
    await expect(backlog).toContainText("3 entries");
    await expect(taken).toContainText("2 entries");
  });

  await test.step("Backlog, Taken, and Recently done sit side by side", async () => {
    await expect(board.getByRole("region")).toHaveCount(3);
    await expect(
      recentlyDone.getByRole("heading", { name: "Recently done" }),
    ).toBeVisible();
    await expect(recentlyDone).toContainText(
      "Done stories for this project, newest first. Local sessions appear on their story cards.",
    );
    await expectSideBySideInOrder([backlog, taken, recentlyDone]);
  });

  await test.step("direction sits outside the Board", async () => {
    await openDirection(page);
    await expect(direction).toContainText(
      "Give developers visibility into a project's published work.",
    );
    await expect(direction).toContainText(
      "Derive it solely from Git state published to origin.",
    );
    await expect(dashboard.readRevision).toContainText(shortRevision(revision));
    await expect(dashboard.retrievedAt).toHaveAttribute(
      "datetime",
      retrievedAt.toISOString(),
    );
    await expect(board.getByText("Near-future direction")).toHaveCount(0);
    await expect(board.getByText(revision)).toHaveCount(0);
  });

  await test.step("membership makes no live or completion claim", async () => {
    await expectOwnersNotRecorded(page);
    // Only the Recently done column, which names finished work, may say done,
    // and only the Sessions sidebar, which names this machine's local
    // sessions, may say running.
    await expect
      .poll(async () => {
        const column = await recentlyDone.textContent();
        const sidebar = await page.locator("#sessions-sidebar").textContent();
        const body = await page.locator("body").textContent();
        return (body ?? "")
          .replace(column ?? "", "")
          .replace(sidebar ?? "", "");
      })
      .not.toMatch(claimsBeyondMembership);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  await test.step("Then gh reads main and the pinned backlog in order", () => {
    const repository = "repos/terryyin/open-dough";
    expect(requests.map((request) => request.argv)).toEqual([
      ["api", "--include", `${repository}/commits/main`, "--jq", ".sha"],
      [
        "api",
        "--include",
        "-H",
        "Accept: application/vnd.github.raw",
        `${repository}/contents/.planning/PRODUCT-BACKLOG.md?ref=${revision}`,
      ],
    ]);
    expect(externalReads).toEqual([]);
  });
});
