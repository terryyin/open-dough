// Following a story's pinned source links leaves the Board in place: a
// snapshot file opens at the inspected revision and an external reference
// opens as recorded, each in a new tab, while recorded markup and refused
// targets run nothing. The link rules and their rendering are
// ../../dashboard/frontend-tests/navigation/source-link-rules.spec.ts and
// ../../dashboard/frontend-tests/navigation/source-links.spec.ts.
import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  openDirection,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "../../dashboard/test-support/publishedOrigin.ts";
import {
  canonicalRecord,
  clickRecordedTarget,
  followInNewTab,
  inspectedDetail,
  slicePlanLink,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { storyDetail } from "../../dashboard/test-support/storyCardSelection.ts";

const revision = "9b1d4e6a2c8f0735be19d4c6a7f8e9d0c1b2a3f4";
const snapshotRoot = `https://github.com/terryyin/open-dough/blob/${revision}`;
const storyTitle = "See the project's published work in a story dashboard";
const noteTitle = "Read the hosting provider's note";
const noteAddress = "https://status.example.com/notes/2026-09?view=full#api";
const hostileTitle = `<img src=x onerror="document.title='title ran'">Run a script from a link`;
const refusedTarget = "javascript:document.title='canonical-ran'";
const directionMarkup = `<img src=x onerror="document.title='direction ran'">`;

const publishedBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("linked", {
      backlog: {
        direction: `Trace each entry to its ${directionMarkup} published source.`,
        taken: [
          makeMe.aBacklogEntry
            .with({
              identity: "SEED-021#see-published-work",
              title: storyTitle,
              href: "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
              plan: {
                label: "plan",
                target:
                  "./slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices",
              },
            })
            .please(),
        ],
        queued: [
          makeMe.aBacklogEntry
            .with({
              identity: "NOTE-7#api",
              title: noteTitle,
              href: noteAddress,
            })
            .please(),
          makeMe.aBacklogEntry
            .with({
              identity: "HOSTILE-1#x",
              title: hostileTitle,
              href: refusedTarget,
            })
            .please(),
        ],
      },
    })
    .please(),
);

// Every dialog the page raises, dismissed.
function dialogsRaised(page: Page): string[] {
  const dialogs: string[] = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });
  return dialogs;
}

// Every read the page makes of the external reference's host, or by a
// protocol other than the web's.
function externalOrRefusedReads(page: Page): URL[] {
  const reads: URL[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.hostname === "status.example.com" ||
      !["http:", "https:"].includes(url.protocol)
    )
      reads.push(url);
  });
  return reads;
}

// Opens the Board on the published backlog, with the snapshot host and the
// external host each answering a followed link, and returns its title and URL.
async function openBoard(page: Page) {
  await page
    .context()
    .route(/^https:\/\/(github\.com|status\.example\.com)\//, (route) =>
      route.fulfill({
        body: "<h1>Followed source</h1>",
        contentType: "text/html",
      }),
    );
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(publishedBacklog) },
  });
  await page.goto("/");
  await expectSettledPage(page);
  return { title: await page.title(), url: page.url() };
}

test("source links open the inspected revision or the recorded address in a new tab and run nothing recorded", async ({
  page,
}) => {
  const { dialogs, reads, opened } =
    await test.step("Given the Board shows pinned, external and refused source links", async () => {
      const dialogs = dialogsRaised(page);
      const reads = externalOrRefusedReads(page);
      return { dialogs, reads, opened: await openBoard(page) };
    });

  await test.step("Then showing their links reads no external or refused target", async () => {
    for (const title of [noteTitle, hostileTitle])
      await inspectedDetail(storyCard(parts(page).backlog, title));
    await expectSettledPage(page);
    expect(reads).toEqual([]);
  });

  await test.step("When I follow the canonical and plan records, they open at the inspected revision", async () => {
    const detail = await inspectedDetail(
      storyCard(parts(page).taken, storyTitle),
    );
    const reached = [
      await followInNewTab(canonicalRecord(detail)),
      await followInNewTab(slicePlanLink(detail)),
    ];
    expect(reached).toEqual([
      `${snapshotRoot}/.planning/seeds/SEED-021-observe-published-story-progress.md#see-published-work`,
      `${snapshotRoot}/.planning/slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices`,
    ]);
  });

  await test.step("When I follow an external reference, it opens as recorded", async () => {
    const detail = await inspectedDetail(
      storyCard(parts(page).backlog, noteTitle),
    );
    expect(await followInNewTab(canonicalRecord(detail))).toBe(noteAddress);
  });

  await test.step("Then the Board keeps the followed story's detail open", async () => {
    await expect(
      storyDetail(storyCard(parts(page).taken, storyTitle)),
    ).toBeVisible();
  });

  await test.step("And recorded markup shows as a story title", async () => {
    await expect(
      parts(page).board.getByRole("heading", { name: hostileTitle }),
    ).toBeVisible();
  });

  const refused =
    await test.step("And a refused target offers no link", async () => {
      const detail = await inspectedDetail(
        storyCard(parts(page).backlog, hostileTitle),
      );
      await expect(detail.getByRole("link")).toHaveCount(0);
      return detail;
    });

  await test.step("When I click the refused target and open the direction", async () => {
    await clickRecordedTarget(refused, refusedTarget);
    await openDirection(page);
  });

  await test.step("Then the direction shows its markup as text and nothing recorded ran", async () => {
    await expect(parts(page).direction).toContainText(directionMarkup);
    expect(dialogs).toEqual([]);
    expect({ title: await page.title(), url: page.url() }).toEqual(opened);
  });
});
