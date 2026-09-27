// A credited human's GitHub avatar appears beside their name on the Taken or
// Preparing card and in the agent roster, served by the local boundary from
// one read of GitHub's avatar host however often it is shown. Without a
// matched account, a usable avatar source, or a fetched image, the name
// stays with its initials. The fake GitHub publishes files, each profile's
// history (agentAvatarRecords.ts), and the avatar host's images
// (avatarAnswers.ts); the boundary finds each account and fetches its avatar,
// and the page decides everything shown.

import type { Locator, Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { avatarPathsRead } from "./avatarAnswers.ts";
import {
  avatarHost,
  credited,
  creditedAvatar,
  creditedWidth,
  firstRevision,
  modifierAvatar,
  offHost,
  olderAvatar,
  reallocator,
  reallocatorAvatar,
  reallocatorWidth,
  secondRevision,
  unfetched,
  unfetchedAvatar,
  unmatched,
} from "./agentAvatarRecords.ts";
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

// The width of the avatar image shown, once it has loaded.
function shownWidth(image: Locator): Promise<number> {
  return image.evaluate((element: HTMLImageElement) =>
    element.complete ? element.naturalWidth : 0,
  );
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
  await expect.poll(() => shownWidth(image)).toBe(width);
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

test("a credited human's avatar is read once through the local boundary and shown on cards and the roster, and a missing, rejected, or failed avatar leaves the name with initials", async ({
  page,
}) => {
  const github = githubFor(page);
  github.serveAvatars(avatarHost);
  const origin = publishMovingFiles(page, firstRevision);
  publishUnlistableProfiles(page);
  const pageRequests: string[] = [];
  page.on("request", (request) => pageRequests.push(request.url()));
  await page.goto("/");

  const { taken, backlog, project, refresh, reading } = parts(page);
  await expectMembership(page, { taken: [takenStory], backlog: [queuedStory] });
  const takenCard = taken.getByRole("article", { name: takenStory });
  const preparingCard = backlog.getByRole("article", { name: queuedStory });
  const roster = page.getByRole("region", { name: "Agent roster" });
  const member = (agent: string) =>
    roster.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: agent, exact: true }),
    });
  const openRoster = (agent: string) =>
    page
      .getByRole("button", { name: `Show ${agent} in the agent roster` })
      .click();
  const back = roster.getByRole("button", { name: "Back to stories" });
  const reads = (path: string) =>
    avatarPathsRead(github.avatarReads).filter((read) => read === path);

  await test.step("the Taken card shows the addition committer's avatar from the local boundary, and the unmatched Preparing human keeps initials", async () => {
    const { revision } = firstRevision;
    await expectAvatar(page, takenCard, credited, creditedWidth, revision);
    await expectInitials(preparingCard, unmatched, "PP");
  });

  await test.step("the roster shows the same avatar, and a rejected or failed avatar leaves the name with initials", async () => {
    await openRoster("Akiho-chan");
    const { revision } = firstRevision;
    await expectAvatar(
      page,
      member("Akiho-chan"),
      credited,
      creditedWidth,
      revision,
    );
    await expectInitials(member("Kirara-chan"), unmatched, "PP");
    await expectInitials(member("Yuma-chan"), offHost, "RR");
    await expectInitials(member("Sola-chan"), unfetched, "FF");
  });

  await test.step("showing the avatar again, after Back and a Refresh at the same revision, reads the avatar host no more", async () => {
    await back.click();
    const refsRead = () =>
      origin.requests.filter(({ request }) => request.kind === "ref").length;
    const before = refsRead();
    await refresh.click();
    await expect.poll(refsRead).toBeGreaterThan(before);
    await expect(reading).toHaveCount(0);
    await expectAvatar(
      page,
      takenCard,
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
    expect(avatarPathsRead(github.avatarReads)).not.toContain("/u/102");
  });

  await test.step("at a new revision, each card shows only its new allocation's human, and an account already fetched is not read again", async () => {
    await back.click();
    origin.moveTrunk(secondRevision);
    await refresh.click();
    const { revision } = secondRevision;
    await expectAvatar(
      page,
      takenCard,
      reallocator,
      reallocatorWidth,
      revision,
    );
    // The Preparing agent's new allocation credits the account the Taken
    // card showed before: its avatar is served from the boundary's memory.
    await expectAvatar(page, preparingCard, credited, creditedWidth, revision);
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

  await test.step("another project's roster and cards show no human avatar from the previous project", async () => {
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );
    await expect(roster.locator(".human-avatar")).toHaveCount(0);
    await back.click();
    await expect(taken.locator(".human-avatar")).toHaveCount(0);
  });

  await test.step("the page itself never asked GitHub or its avatar host", () => {
    const offPage = pageRequests.filter((url) =>
      /(^|\.)(github\.com|githubusercontent\.com)$/.test(new URL(url).hostname),
    );
    expect(offPage).toEqual([]);
  });
});
