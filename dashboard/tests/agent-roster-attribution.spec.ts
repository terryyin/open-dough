// Each current assignment names the human developer credited for it: the Git
// committer of the commit that added its agent profile's current allocation,
// shown on its Taken or Preparing card and in the agent roster. The fake
// GitHub only publishes files and each profile's history
// (agentAttributionRecords.ts); the local read boundary walks that history
// at the pinned revision, and the page decides everything shown. How a slow
// or stalled walk delays only its own profile's details is
// profile-addition-latency.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import {
  credited,
  firstRevision,
  modifier,
  olderAllocator,
  preparer,
  reallocator,
  secondRevision,
} from "./agentAttributionRecords.ts";
import {
  doughnut,
  publishUnlistableProfiles,
  queuedStory,
  takenStory,
} from "./agentRosterRecords.ts";

test("each assignment credits the committer of its profile allocation's addition on its card and in the roster, and says when that cannot be established", async ({
  page,
}) => {
  const origin = publishMovingFiles(page, firstRevision);
  publishUnlistableProfiles(page);
  await page.goto("/");

  const { taken, backlog, project, refresh } = parts(page);
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

  await test.step("the Taken and Preparing cards credit the committers who added their current allocations", async () => {
    await expect(takenCard.locator(".owner-human")).toHaveText(
      `Human developer: ${credited}`,
    );
    await expect(preparingCard.locator(".owner-human")).toHaveText(
      `Human developer: ${preparer}`,
    );
    for (const card of [takenCard, preparingCard]) {
      await expect(card).not.toContainText(modifier);
      await expect(card).not.toContainText(olderAllocator);
    }
  });

  await test.step("the roster credits the same humans, and names a missing addition and a failed read as unknown without guessing", async () => {
    await openRoster("Akiho-chan");
    await expect(member("Akiho-chan").locator(".owner-human")).toHaveText(
      `Human developer: ${credited}`,
    );
    await expect(member("Kirara-chan").locator(".owner-human")).toHaveText(
      `Human developer: ${preparer}`,
    );
    await expect(
      member("Yuma-chan").locator(".owner-human.assignment-gap"),
    ).toHaveText(
      "Human developer unknown: no commit adding this agent profile was found in its recent published history.",
    );
    await expect(member("Sola-chan").locator(".owner-human")).toHaveText(
      `Human developer unknown. The local GitHub CLI could not reach GitHub while reading the commit that added .planning/agents/sola-chan.json at ${firstRevision.revision}.`,
    );
    await expect(roster).not.toContainText(modifier);
    await expect(roster).not.toContainText(olderAllocator);
    // An unreadable profile has no assignment to credit.
    await expect(member("Mana-chan").locator(".owner-human")).toHaveCount(0);
  });

  await test.step("each history is read at the pinned revision, and the walk stops at the current allocation's addition", () => {
    const asked = origin.requests.map(({ request }) => request);
    const listed = asked.flatMap((request) =>
      request.kind === "commit-list" ? [request] : [],
    );
    expect(listed.map((request) => request.path).sort()).toEqual([
      ".planning/agents/akiho-chan.json",
      ".planning/agents/kirara-chan.json",
      ".planning/agents/sola-chan.json",
      ".planning/agents/yuma-chan.json",
    ]);
    expect(
      listed.every((request) => request.revision === firstRevision.revision),
    ).toBe(true);
    const commits = asked.flatMap((request) =>
      request.kind === "commit" ? [request.sha.slice(0, 2)] : [],
    );
    // Akiho's walk stops at its addition (12), before the older allocation's
    // removal and addition (13, 14); Yuma's stops at the removal (32).
    expect(commits.sort()).toEqual(["11", "12", "21", "31", "32"]);
  });

  await test.step("after the Taken agent is allocated again at a new revision, only the new allocation's committer is credited", async () => {
    await back.click();
    origin.moveTrunk(secondRevision);
    await refresh.click();
    await expect(takenCard.locator(".owner-human")).toHaveText(
      `Human developer: ${reallocator}`,
    );
    await expect(takenCard).not.toContainText(credited);
    await openRoster("Akiho-chan");
    await expect(member("Akiho-chan").locator(".owner-human")).toHaveText(
      `Human developer: ${reallocator}`,
    );
    await expect(member("Kirara-chan").locator(".owner-human")).toHaveText(
      `Human developer: ${preparer}`,
    );
  });

  await test.step("another project's roster carries no human from the previous project", async () => {
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );
    await expect(roster).not.toContainText("Human developer");
    await back.click();
    await expect(taken).not.toContainText("Human developer");
  });
});
