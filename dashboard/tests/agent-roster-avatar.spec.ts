// Each current assignment credits the human developer who made it: the Git
// committer of the commit that added its agent profile's current allocation,
// with their GitHub avatar, on its Taken or Preparing card and in the agent
// roster. The avatar is served by the local boundary from one read of
// GitHub's avatar host per avatar source however often it is shown; without
// a matched account, a usable avatar source, or a fetched image, the name
// stays with its initials, and without a found addition the human is a gap.
// The fake GitHub publishes files, each profile's history, and the avatar
// host's images (agentAttributionRecords.ts); the boundary walks each history
// at the pinned revision (authenticated-read-profile-addition.spec.ts) and
// fetches each avatar (authenticated-avatar.spec.ts), and the page decides
// everything shown. How a slow or stalled walk delays only its own profile's
// details is profile-addition-latency.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import { expectMembership, parts, rosterParts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { avatarPathsRead } from "./avatarAnswers.ts";
import { loadedWidth } from "./agentPortrait.ts";
import {
  avatarHost,
  credited,
  creditedAvatar,
  creditedWidth,
  firstRevision,
  modifier,
  modifierAvatar,
  offHost,
  offHostAvatar,
  olderAllocator,
  olderAvatar,
  preparer,
  reallocator,
  reallocatorAvatar,
  reallocatorWidth,
  secondRevision,
  unfetched,
  unfetchedAvatar,
} from "./agentAttributionRecords.ts";
import {
  doughnut,
  publishUnlistableProfiles,
  queuedStory,
  takenStory,
} from "./agentRosterRecords.ts";

// The credited human beside an agent: their avatar or initials, and name.
function creditOf(holder: Locator) {
  const credit = holder.locator(".owner-human-credit");
  return {
    name: credit.locator(".owner-human"),
    image: credit.locator("img.human-avatar"),
    initials: credit.locator(".human-avatar-fallback"),
  };
}

async function expectAvatar(
  page: Page,
  holder: Locator,
  name: string,
  width: number,
  revision: string,
) {
  const { name: named, image, initials } = creditOf(holder);
  await expect(named).toHaveText(`Human developer: ${name}`);
  await expect(image).toBeVisible();
  await expect.poll(() => loadedWidth(image)).toBe(width);
  await expect(initials).toHaveCount(0);
  const src = new URL(
    await image.evaluate((element: HTMLImageElement) => element.currentSrc),
  );
  expect(src.origin).toBe(new URL(page.url()).origin);
  expect(src.searchParams.get("revision")).toBe(revision);
}

async function expectInitials(holder: Locator, name: string, shown: string) {
  const { name: named, image, initials } = creditOf(holder);
  await expect(named).toHaveText(`Human developer: ${name}`);
  await expect(initials).toHaveText(shown);
  await expect(initials).toBeVisible();
  await expect(image).toHaveCount(0);
}

test("each assignment credits the committer who added its profile's current allocation, with an avatar read once through the local boundary, on cards and the roster, and says when that cannot be established", async ({
  page,
}) => {
  const github = githubFor(page);
  github.serveAvatars(avatarHost);
  const origin = publishMovingFiles(page, firstRevision);
  publishUnlistableProfiles(page);
  const pageRequests: string[] = [];
  page.on("request", (request) => pageRequests.push(request.url()));
  await page.goto("/");

  const { taken, backlog, project, reading } = parts(page);
  await expectMembership(page, { taken: [takenStory], backlog: [queuedStory] });
  const takenCard = taken.getByRole("article", { name: takenStory });
  const preparingCard = backlog.getByRole("article", { name: queuedStory });
  const { roster, member, opener, back } = rosterParts(page);
  const openRoster = (agent: string) => opener(agent).click();
  const reads = (path: string) =>
    avatarPathsRead(github.avatarReads).filter((read) => read === path);

  await test.step("the Taken card shows the addition committer with their avatar from the local boundary, and the unmatched Preparing human keeps initials", async () => {
    const { revision } = firstRevision;
    await expectAvatar(
      page,
      await inspectedDetail(takenCard),
      credited,
      creditedWidth,
      revision,
    );
    await expectInitials(await inspectedDetail(preparingCard), preparer, "PP");
    // The card's scan line shows the same avatar beside the credited name;
    // a name with no matched account stands alone there.
    const takenScan = takenCard.locator(".owner-line");
    await expect(takenScan.locator(".owner-human-name")).toHaveText(credited);
    const scanImage = takenScan.locator("img.human-avatar");
    await expect(scanImage).toBeVisible();
    await expect.poll(() => loadedWidth(scanImage)).toBe(creditedWidth);
    await expect(
      preparingCard.locator(".owner-line .human-avatar"),
    ).toHaveCount(0);
    for (const card of [takenCard, preparingCard]) {
      await expect(card).not.toContainText(modifier);
      await expect(card).not.toContainText(olderAllocator);
    }
  });

  await test.step("the roster credits the same humans, a rejected or failed avatar leaves the name with initials, and a missing addition or a failed read is unknown without guessing", async () => {
    await openRoster("Akiho-chan");
    const { revision } = firstRevision;
    await expectAvatar(
      page,
      member("Akiho-chan"),
      credited,
      creditedWidth,
      revision,
    );
    await expectInitials(member("Kirara-chan"), preparer, "PP");
    await expectInitials(member("Yuma-chan"), offHost, "RR");
    await expectInitials(member("Sola-chan"), unfetched, "FF");
    await expect(
      member("Rina-chan").locator(".owner-human.assignment-gap"),
    ).toHaveText(
      "Human developer unknown: no commit adding this agent profile was found in its recent published history.",
    );
    await expect(member("Nana-chan").locator(".owner-human")).toHaveText(
      `Human developer unknown. The local GitHub CLI could not reach GitHub while reading the commit that added .planning/agents/nana-chan.json at ${revision}.`,
    );
    await expect(roster).not.toContainText(modifier);
    await expect(roster).not.toContainText(olderAllocator);
    // An unreadable profile has no assignment to credit.
    await expect(member("Mana-chan").locator(".owner-human")).toHaveCount(0);
  });

  await test.step("showing the avatar again, after Back and a reload at the same revision, reads the avatar host no more", async () => {
    await back.click();
    const refsRead = () =>
      origin.requests.filter(({ request }) => request.kind === "ref").length;
    const before = refsRead();
    await page.reload();
    await expect.poll(refsRead).toBeGreaterThan(before);
    await expect(reading).toHaveCount(0);
    await expectAvatar(
      page,
      await inspectedDetail(takenCard),
      credited,
      creditedWidth,
      firstRevision.revision,
    );
    await openRoster("Akiho-chan");
    await expectAvatar(
      page,
      member("Akiho-chan"),
      credited,
      creditedWidth,
      firstRevision.revision,
    );
    expect(reads(creditedAvatar)).toHaveLength(1);
    expect(reads(unfetchedAvatar).length).toBeGreaterThanOrEqual(1);
    // Only the addition committer's account is ever fetched, never the
    // modifier's or the older allocation's, nor an avatar off GitHub's host.
    expect(reads(modifierAvatar)).toEqual([]);
    expect(reads(olderAvatar)).toEqual([]);
    expect(reads(offHostAvatar)).toEqual([]);
  });

  await test.step("at a new revision, each card shows only its new allocation's human, and an account already fetched is not read again", async () => {
    await back.click();
    origin.moveTrunk(secondRevision);
    await page.reload();
    const { revision } = secondRevision;
    await expectAvatar(
      page,
      await inspectedDetail(takenCard),
      reallocator,
      reallocatorWidth,
      revision,
    );
    await expect(takenCard).not.toContainText(credited);
    // The Preparing agent's new allocation credits the account the Taken
    // card showed before: its avatar is served from the boundary's memory.
    await expectAvatar(
      page,
      await inspectedDetail(preparingCard),
      credited,
      creditedWidth,
      revision,
    );
    await openRoster("Akiho-chan");
    await expectAvatar(
      page,
      member("Akiho-chan"),
      reallocator,
      reallocatorWidth,
      revision,
    );
    await expectAvatar(
      page,
      member("Kirara-chan"),
      credited,
      creditedWidth,
      revision,
    );
    expect(reads(reallocatorAvatar)).toHaveLength(1);
    expect(reads(creditedAvatar)).toHaveLength(1);
  });

  await test.step("another project's roster and cards show no human or avatar from the previous project", async () => {
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );
    await expect(roster).not.toContainText("Human developer");
    await expect(roster.locator(".human-avatar")).toHaveCount(0);
    await back.click();
    for (const card of await taken.getByRole("article").all()) {
      await inspectedDetail(card);
      await expect(card).not.toContainText("Human developer");
      await expect(card.locator(".human-avatar")).toHaveCount(0);
    }
  });

  await test.step("the page itself never asked GitHub or its avatar host", () => {
    const offPage = pageRequests.filter((url) =>
      /(^|\.)(github\.com|githubusercontent\.com)$/.test(new URL(url).hostname),
    );
    expect(offPage).toEqual([]);
  });
});
