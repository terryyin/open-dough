// While the dashboard reads a new revision of the selected project, every
// story it already shows keeps what it shows and where it stands until that
// revision answers for it; membership and order are the new revision's at
// once. The journey's commits and records are those of ../refreshJourney.ts
// and ../autoRefreshJourney.ts; one record's reads are held so the read stays
// under way to be seen. The page's clock is paused and advanced by the test.
// An open inspection and assignment credits: ./steady-refresh-inspection.spec.ts.

import type { Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  shortRevision,
  parts,
} from "../dashboardPage.ts";
import { inspectedDetail } from "../storyCardControls.ts";
import {
  contentReads,
  openSettledAtA,
  passTimeUntilChecked,
  queueStory,
  recordsAt,
} from "../autoRefreshJourney.ts";
import {
  backlogA,
  backlogB,
  dashboardStory,
  revisionB,
  titlesOfA,
  titlesOfB,
  workspaceStory,
} from "../refreshJourney.ts";
import { givePageItsTurns } from "../pageRequestNotes.ts";
import type { MovingOrigin } from "../publishedOrigin.ts";
import {
  notePlaceholders,
  shownCards,
  type ShownCard,
} from "../retainedFacts.ts";

const dashboardRecord = ".planning/seeds/SEED-021-progress.md";
const syncRecord = ".planning/seeds/SEED-008-sync.md";
const claimsRecord = ".planning/seeds/SEED-040-claims.md";
const claimsStory = "Publish shared backlog claims";

// B's membership is shown, and the held record has been asked for at B.
async function untilBShownWhileHeld(
  page: Page,
  origin: MovingOrigin,
  held: string,
) {
  await expect(parts(page).readRevision).toContainText(
    shortRevision(revisionB),
  );
  await expect
    .poll(() => contentReads(origin.requests))
    .toContain(`${held}?ref=${revisionB}`);
  await givePageItsTurns(page);
}

test("an unchanged revision keeps every card's content and place while it is read", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const before = await shownCards(page);
  const placeholders = await notePlaceholders(page);
  const release = origin.hold(dashboardRecord);
  origin.push(revisionB, backlogA, recordsAt("A"));
  await passTimeUntilChecked(page);

  await test.step("while B's record is held, every card shows what it showed, where it showed it", async () => {
    await untilBShownWhileHeld(page, origin, dashboardRecord);
    expect(await shownCards(page)).toEqual(before);
    expect(await placeholders()).toEqual([]);
  });

  await test.step("once B answers, every card still shows the same, and the source shows B", async () => {
    release();
    await expectSettledPage(page, titlesOfA);
    expect((await shownCards(page)).map(({ text }) => text)).toEqual(
      before.map(({ text }) => text),
    );
    expect(await placeholders()).toEqual([]);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revisionB),
    );
  });
});

// The open detail's pinned links name the revision shown, which is B's as
// soon as its membership is: those links are part of B's membership.
const pinnedAtB = (shown: readonly ShownCard[]) =>
  shown.map((card) => ({
    ...card,
    text: card.text.replace(/at revision [0-9a-f]{7}/g, "at revision b2b2b2b"),
  }));

test("only the story B changed updates, when B answers for it", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { board } = parts(page);
  const dashboardCard = board.getByRole("article", { name: dashboardStory });
  const detail = await inspectedDetail(dashboardCard);
  await expect(detail).toContainText(`${dashboardStory}, as published at A.`);
  const before = await shownCards(page);
  const placeholders = await notePlaceholders(page);
  const releaseDashboard = origin.hold(dashboardRecord);
  origin.push(revisionB, backlogA, {
    ...recordsAt("A"),
    [dashboardRecord]: recordsAt("B")[dashboardRecord] ?? "",
  });
  await passTimeUntilChecked(page);

  await test.step("while B's record is held, the inspected purpose is still A's and no card changes", async () => {
    await untilBShownWhileHeld(page, origin, dashboardRecord);
    await expect(detail).toContainText(`${dashboardStory}, as published at A.`);
    expect(pinnedAtB(await shownCards(page))).toEqual(pinnedAtB(before));
  });

  await test.step("B's answer for the changed story updates its purpose in place; the others keep theirs", async () => {
    releaseDashboard();
    await expect(detail).toContainText(`${dashboardStory}, as published at B.`);
    const after = await shownCards(page);
    const others = (all: readonly ShownCard[]) =>
      all.filter(({ title }) => title !== dashboardStory);
    expect(others(after)).toEqual(others(before));
    expect(await placeholders()).toEqual([]);
  });

  await test.step("the unchanged stories read as published at A in B's answer", async () => {
    await expectSettledPage(page, titlesOfA);
    const queueDetail = await inspectedDetail(
      board.getByRole("article", { name: queueStory }),
    );
    await expect(queueDetail).toContainText(
      `${queueStory}, as published at A.`,
    );
    expect(await placeholders()).toEqual([]);
  });
});

test("a new entry reads as on a first visit, a removed one leaves, and the rest keep their facts", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { board, taken, backlog } = parts(page);
  // The queue card's text but for its priority, which B changes.
  const queueText = async () =>
    (await shownCards(page))
      .find(({ title }) => title === queueStory)
      ?.text.replace(/Priority \d+/, "Priority");
  const queueAtA = await queueText();
  expect(queueAtA).toBeDefined();
  const placeholders = await notePlaceholders(page);
  const releaseClaims = origin.hold(claimsRecord);
  const releaseDashboard = origin.hold(dashboardRecord);
  const releaseSync = origin.hold(syncRecord);
  origin.push(revisionB, backlogB, recordsAt("A"));
  await passTimeUntilChecked(page);

  await test.step("B's membership shows at once: the new claims card reads, the workspace card leaves, and the others keep their facts", async () => {
    await expectMembership(page, titlesOfB);
    await untilBShownWhileHeld(page, origin, claimsRecord);
    const claimsCard = backlog.getByRole("article", { name: claimsStory });
    await expect(claimsCard).toContainText("Reading preparation…");
    await expect(
      board.getByRole("article", { name: workspaceStory }),
    ).toHaveCount(0);
    expect(await queueText()).toBe(queueAtA);
    const dashboardCard = taken.getByRole("article", { name: dashboardStory });
    await expect(dashboardCard).not.toContainText("Reading preparation…");
    const detail = await inspectedDetail(dashboardCard);
    await expect(detail).toContainText(`${dashboardStory}, as published at A.`);
    // The new card reads as on a first visit; the moved card reads only
    // what its new column shows, its owner and slice progress.
    expect(await placeholders()).toEqual(
      expect.arrayContaining([`${claimsStory}: Reading preparation…`]),
    );
    expect(
      (await placeholders()).filter(
        (seen) =>
          !seen.startsWith(`${claimsStory}: `) &&
          !/^[^:]+: Reading (agent profile|plan slices)…$/.test(seen),
      ),
    ).toEqual([]);
    expect(
      (await placeholders()).filter((seen) =>
        seen.startsWith(`${dashboardStory}: `),
      ),
    ).not.toContain(`${dashboardStory}: Reading preparation…`);
  });

  await test.step("once B answers, the page settles on B's membership", async () => {
    releaseClaims();
    releaseDashboard();
    releaseSync();
    await expectSettledPage(page, titlesOfB);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revisionB),
    );
  });
});
