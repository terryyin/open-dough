// Assignments credit the committer of the current profile allocation. Cards
// and the roster show a fetched avatar once per source, or initials; an
// unavailable allocation remains a gap. Fake GitHub supplies the profiles,
// histories and avatar images.
import { expect, githubFor, test } from "../dashboardTest.ts";
import {
  chooseProject,
  expectMembership,
  parts,
  rosterParts,
} from "../dashboardPage.ts";
import { inspectedDetail, storyCard } from "../storyCardControls.ts";
import {
  credit,
  expectHumanAvatar,
  expectHumanInitials,
} from "../agentCredit.ts";
import { publishMovingFiles } from "../publishedFiles.ts";
import { avatarPathsRead } from "../avatarAnswers.ts";
import { loadedWidth } from "../agentPortrait.ts";
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
} from "../agentAttributionRecords.ts";
import {
  doughnut,
  publishUnlistableProfiles,
  queuedStory,
  takenStory,
} from "../agentRosterRecords.ts";
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

  const { taken, backlog, reading } = parts(page);
  await expectMembership(page, { taken: [takenStory], backlog: [queuedStory] });
  const takenStoryCard = storyCard(taken, takenStory);
  const preparingCard = storyCard(backlog, queuedStory);
  const { roster, member, opener, back } = rosterParts(page);
  const openRoster = (agent: string) => opener(agent).click();
  const reads = (path: string) =>
    avatarPathsRead(github.avatarReads).filter((read) => read === path);

  await test.step("the Taken card shows the addition committer with their avatar from the local boundary, and the unmatched Preparing human keeps initials", async () => {
    const { revision } = firstRevision;
    await expectHumanAvatar(await inspectedDetail(takenStoryCard), credited, {
      width: creditedWidth,
      revision,
    });
    await expectHumanInitials(
      await inspectedDetail(preparingCard),
      preparer,
      "PP",
    );
    // The card's scan line shows the same avatar beside the credited name;
    // a name with no matched account stands alone there.
    const takenScan = credit(credit(takenStoryCard).line);
    await expect(takenScan.humanName).toHaveText(credited);
    await expect(takenScan.avatar).toBeVisible();
    await expect.poll(() => loadedWidth(takenScan.avatar)).toBe(creditedWidth);
    await expect(credit(credit(preparingCard).line).avatar).toHaveCount(0);
    for (const card of [takenStoryCard, preparingCard]) {
      await expect(card).not.toContainText(modifier);
      await expect(card).not.toContainText(olderAllocator);
    }
  });

  await test.step("the roster credits the same humans, a rejected or failed avatar leaves the name with initials, and a missing addition or a failed read is unknown without guessing", async () => {
    await openRoster("Akiho-chan");
    const { revision } = firstRevision;
    await expectHumanAvatar(member("Akiho-chan"), credited, {
      width: creditedWidth,
      revision,
    });
    await expectHumanInitials(member("Kirara-chan"), preparer, "PP");
    await expectHumanInitials(member("Yuma-chan"), offHost, "RR");
    await expectHumanInitials(member("Sola-chan"), unfetched, "FF");
    await expect(credit(member("Rina-chan")).human).toHaveText(
      "Human developer unknown: no commit adding this agent profile was found in its recent published history.",
    );
    await expect(credit(member("Rina-chan")).human).toHaveClass(
      /\bassignment-gap\b/,
    );
    await expect(credit(member("Nana-chan")).human).toHaveText(
      `Human developer unknown. The local GitHub CLI could not reach GitHub while reading the commit that added .planning/agents/nana-chan.json at ${revision}.`,
    );
    await expect(roster).not.toContainText(modifier);
    await expect(roster).not.toContainText(olderAllocator);
    // An unreadable profile has no assignment to credit.
    await expect(credit(member("Mana-chan")).human).toHaveCount(0);
  });

  await test.step("showing the avatar again, after Back and a reload at the same revision, reads the avatar host no more", async () => {
    await back.click();
    const refsRead = () =>
      origin.requests.filter(({ request }) => request.kind === "ref").length;
    const before = refsRead();
    await page.reload();
    await expect.poll(refsRead).toBeGreaterThan(before);
    await expect(reading).toHaveCount(0);
    const shown = { width: creditedWidth, revision: firstRevision.revision };
    await expectHumanAvatar(
      await inspectedDetail(takenStoryCard),
      credited,
      shown,
    );
    await openRoster("Akiho-chan");
    await expectHumanAvatar(member("Akiho-chan"), credited, shown);
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
    const reallocated = { width: reallocatorWidth, revision };
    const carried = { width: creditedWidth, revision };
    await expectHumanAvatar(
      await inspectedDetail(takenStoryCard),
      reallocator,
      reallocated,
    );
    await expect(takenStoryCard).not.toContainText(credited);
    // The Preparing agent's new allocation credits the account the Taken
    // card showed before: its avatar is served from the boundary's memory.
    await expectHumanAvatar(
      await inspectedDetail(preparingCard),
      credited,
      carried,
    );
    await openRoster("Akiho-chan");
    await expectHumanAvatar(member("Akiho-chan"), reallocator, reallocated);
    await expectHumanAvatar(member("Kirara-chan"), credited, carried);
    expect(reads(reallocatorAvatar)).toHaveLength(1);
    expect(reads(creditedAvatar)).toHaveLength(1);
  });

  await test.step("another project's roster and cards show no human or avatar from the previous project", async () => {
    await chooseProject(page, "Doughnut");
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );
    await expect(roster).not.toContainText("Human developer");
    await expect(credit(roster).avatar).toHaveCount(0);
    await back.click();
    for (const card of await taken.getByRole("article").all()) {
      await inspectedDetail(card);
      await expect(card).not.toContainText("Human developer");
      await expect(credit(card).avatar).toHaveCount(0);
    }
  });

  await test.step("the page itself never asked GitHub or its avatar host", () => {
    const offPage = pageRequests.filter((url) =>
      /(^|\.)(github\.com|githubusercontent\.com)$/.test(new URL(url).hostname),
    );
    expect(offPage).toEqual([]);
  });
});
