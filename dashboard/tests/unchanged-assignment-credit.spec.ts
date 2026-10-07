// Assignments keep their credited humans across a publication that touches
// none of their agent profiles: once the page credited seven assignments to
// one human at revision A, the check that finds B shows each credit again on
// its card, its detail, and the roster without listing any profile's history
// or reading any addition commit beyond the commit between. A profile a later
// commit modifies has only its own history listed and walked, and a profile
// removed and re-added with identical text credits the re-adding commit's
// committer and time, never what the same text was credited with before. The
// fake GitHub only publishes the commits and histories (./publishedFiles.ts,
// ./assignmentCreditRecords.ts); the local read boundary, its memo, and the
// page decide what is asked and shown.

import type { Page } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts, rosterParts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { avatarPathsRead } from "./avatarAnswers.ts";
import { avatarHost, creditedAvatar } from "./agentAttributionRecords.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  additionOf,
  agents,
  atA,
  human,
  opened,
  planned,
  planPath,
  profileOf,
  readder,
  repository,
  titleOf,
  toB,
  toC,
  toD,
  type Move,
} from "./assignmentCreditRecords.ts";

// The planned card's clock runs from its plan's last commit, half an hour
// before the page opened, until a Take is recorded later.
const sincePlan = /Current slice started 3\d min ago/;
const sinceReadded = /Current slice started 1\d min ago/;

// The page once every card, its detail, and the roster credit `credits`
// (the one human where none is given) at `at`, and the planned card's slice
// clock says when it started, as page time passes with each check.
async function expectCreditedAt(
  page: Page,
  at: string,
  credits: Readonly<Record<string, string>>,
  clock: RegExp,
) {
  const { source, taken } = parts(page);
  const { member, opener, back } = rosterParts(page);
  await expect(source).toContainText(at);
  await expectMembership(page, { taken: agents.map(titleOf), backlog: [] });
  for (const agent of agents) {
    const card = taken.getByRole("article", { name: titleOf(agent) });
    await expect(card.locator(".owner-line .owner-human-name")).toHaveText(
      credits[agent] ?? human,
    );
    await expect(
      (await inspectedDetail(card)).locator(".owner-human-credit .owner-human"),
    ).toHaveText(`Human developer: ${credits[agent] ?? human}`);
  }
  await expect(
    taken.getByRole("article", { name: titleOf(planned) }),
  ).toContainText(clock);
  await opener(`${agents[0] ?? ""}-chan`).click();
  for (const agent of agents) {
    await expect(member(`${agent}-chan`).locator(".owner-human")).toHaveText(
      `Human developer: ${credits[agent] ?? human}`,
    );
  }
  await back.click();
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
}

// The history listings and commit reads among `asked`: what a credit costs,
// apart from the comparison and from avatar images, which the avatar host
// answers.
const historyCalls = (asked: ReturnType<typeof readsBesideChecks>) =>
  asked.filter((call) => call.startsWith("commit-list "));

test("seven assignments crediting one human keep their own credit after an unrelated publication without reading any history; a modified profile's walk and a re-added profile's credit are their own", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, opened);
  const github = githubFor(page);
  github.serveAvatars(avatarHost);
  const origin = publishMovingFiles(page, { repository, ...atA });
  const commitsAsked = (from: number) =>
    origin.requests
      .slice(from)
      .flatMap(({ request }) =>
        request.kind === "commit" ? [request.sha.slice(0, 2)] : [],
      );
  // Moves the ref, lets the check find it, and says what GitHub was asked
  // once the page shows it settled.
  const published = async (
    { at, by }: Move,
    credits: Readonly<Record<string, string>>,
    clock: RegExp,
  ) => {
    const before = origin.requests.length;
    origin.moveTrunk(at, by);
    await passTimeUntilChecked(page);
    await expectCreditedAt(page, at.revision, credits, clock);
    const asked = readsBesideChecks(origin.requests.slice(before));
    expect(asked.filter((call) => call === "compare")).toHaveLength(1);
    return { asked, commits: commitsAsked(before) };
  };

  await page.goto("/");
  await expectCreditedAt(page, atA.revision, {}, sincePlan);
  // Each assignment's history was walked to its own addition.
  expect(historyCalls(readsBesideChecks(origin.requests)).sort()).toEqual(
    agents
      .map((agent) => `commit-list ${profileOf(agent)}@${atA.revision}`)
      .concat(`commit-list ${planPath}@${atA.revision}`)
      .sort(),
  );

  await test.step("an unrelated publication keeps every credit without listing any history or reading any addition commit", async () => {
    const { asked, commits } = await published(toB, {}, sincePlan);
    expect(historyCalls(asked)).toEqual([]);
    expect(commits).toEqual(["81"]);
    // Each assignment's addition at B is still its own commit, answered
    // from what the boundary holds.
    const before = origin.requests.length;
    for (const agent of agents) {
      const response = await rawRequest({
        url: `${dashboard.baseURL}/__authenticated-read?source=open-dough&revision=${toB.at.revision}&path=${encodeURIComponent(profileOf(agent))}&committed=added`,
        headers: { Origin: dashboard.origin },
      });
      expect(JSON.parse(response.body)).toMatchObject({
        revision: toB.at.revision,
        added: {
          commit: additionOf(agent).sha,
          committerName: human,
          login: "terryyin",
        },
      });
    }
    expect(readsBesideChecks(origin.requests.slice(before))).toEqual([]);
    // The one human's avatar was read once, whichever assignment shows it.
    expect(
      avatarPathsRead(github.avatarReads).filter(
        (read) => read === creditedAvatar,
      ),
    ).toHaveLength(1);
  });

  await test.step("a modified profile alone has its history listed and walked; the others reuse their own evidence", async () => {
    const { asked, commits } = await published(toC, {}, sincePlan);
    expect(historyCalls(asked)).toEqual([
      `commit-list ${profileOf("Kirara")}@${toC.at.revision}`,
    ]);
    // The walk passes the modifying commit, already read as the commit
    // between, to Kirara's own addition, already read at A.
    expect(commits).toEqual(["82"]);
  });

  await test.step("a profile removed and re-added with identical text credits the re-adding commit's committer and time", async () => {
    const { asked, commits } = await published(
      toD,
      { [planned]: readder },
      sinceReadded,
    );
    expect(historyCalls(asked)).toEqual([
      `commit-list ${profileOf(planned)}@${toD.at.revision}`,
    ]);
    expect(commits.sort()).toEqual(["83", "84"]);
  });
});
