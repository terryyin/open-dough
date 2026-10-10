// While the dashboard reads a new revision, an open story inspection keeps its
// purpose and focus, and each assignment it already shows keeps its agent,
// its credited human, and its portrait on the card and in the agent roster,
// until that revision answers for them. A record's reads, or GitHub's account
// of what changed, are held so the read stays under way to be seen. The fake
// GitHub only publishes the commits, records, and histories
// (./publishedOrigin.ts, ./publishedFiles.ts, ./assignmentCreditRecords.ts);
// the page decides what is shown.

import type { Page } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
  rosterParts,
} from "./dashboardPage.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { avatarHost } from "./agentAttributionRecords.ts";
import { inspectedDetail } from "./cardControls.ts";
import {
  contentReads,
  openSettledAtA,
  passTimeUntilChecked,
  queueStory,
  recordsAt,
} from "./autoRefreshJourney.ts";
import { backlogB, revisionB, titlesOfB } from "./refreshJourney.ts";
import {
  agents,
  atA,
  human,
  opened,
  repository,
  titleOf,
  toB,
} from "./assignmentCreditRecords.ts";

const syncRecord = ".planning/seeds/SEED-008-sync.md";

// Every Taken card's owner line.
const cardCredits = (page: Page) =>
  Promise.all(
    agents.map((agent) =>
      parts(page)
        .taken.getByRole("article", { name: titleOf(agent) })
        .locator(".card-owner")
        .innerText(),
    ),
  );

// Every Taken card's owner line and every roster member's credit, the roster
// opened from the first card's portrait.
async function credits(page: Page) {
  const { member, opener, roster, back } = rosterParts(page);
  const cards = await cardCredits(page);
  await opener(`${agents[0] ?? ""}-chan`).click();
  await expect(roster).toBeVisible();
  const members = await Promise.all(
    agents.map((agent) => member(`${agent}-chan`).innerText()),
  );
  await back.click();
  return { cards, members };
}

test("assignments keep their agents, credited humans, and portraits on cards and the roster while a new revision is read", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  githubFor(page).serveAvatars(avatarHost);
  const origin = publishMovingFiles(page, { repository, ...atA });
  await page.goto("/");
  await expectSettledPage(page);
  const { taken } = parts(page);
  await expect(taken.locator(".owner-line .owner-human-name")).toHaveText(
    agents.map(() => human),
  );
  const before = await credits(page);
  const portraits = await taken.locator(".agent-portrait").count();

  const release = origin.holdComparisons();
  origin.moveTrunk(toB.at, toB.by);
  await passTimeUntilChecked(page);

  await test.step("while B's account of what changed is held, every credit and portrait stays as shown", async () => {
    await expect(parts(page).source).toContainText(toB.at.revision);
    expect(await cardCredits(page)).toEqual(before.cards);
    expect(await credits(page)).toEqual(before);
    await expect(page.getByText("Reading human developer…")).toHaveCount(0);
    await expect(page.getByText("Reading agent profile…")).toHaveCount(0);
    await expect(taken.locator(".agent-portrait")).toHaveCount(portraits);
  });

  await test.step("once B answers, the same credits show", async () => {
    release();
    await expectSettledPage(page);
    expect(await credits(page)).toEqual(before);
  });
});

test("an inspection open at A keeps its purpose while B is read", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const queueCard = parts(page).stages.getByRole("article", {
    name: queueStory,
  });
  const detail = await inspectedDetail(queueCard);
  await expect(detail).toContainText(`${queueStory}, as published at A.`);
  const toggle = queueCard.getByRole("button", { name: "Hide detail" });
  await toggle.focus();
  const release = origin.hold(syncRecord);
  origin.push(revisionB, backlogB, recordsAt("B"));
  await passTimeUntilChecked(page);

  await test.step("while B's record is held, the inspection keeps A's purpose and focus", async () => {
    await expectMembership(page, titlesOfB);
    await expect(parts(page).source).toContainText(revisionB);
    await expect
      .poll(() => contentReads(origin.requests))
      .toContain(`${syncRecord}?ref=${revisionB}`);
    await expect(detail).toContainText(`${queueStory}, as published at A.`);
    await expect(detail).not.toContainText("Reading purpose…");
    await expect(toggle).toBeFocused();
  });

  await test.step("B's answer replaces the purpose in place", async () => {
    release();
    await expect(detail).toContainText(`${queueStory}, as published at B.`);
    await expectSettledPage(page, titlesOfB);
    await expect(toggle).toBeFocused();
  });
});
