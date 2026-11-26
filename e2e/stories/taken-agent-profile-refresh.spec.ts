// A Taken card's owner when the revision publishes no agent profiles, and
// after a reload at a revision that publishes one. The fake GitHub only
// publishes the files; the page decides everything shown.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectPublishedRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { defaultRepository as repository } from "../../dashboard/test-support/publishedOrigin.ts";
import { publishCommittedFileHistory } from "../../dashboard/test-support/committedFiles.ts";
import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  expectMark,
  expectPortrait,
} from "../../dashboard/test-support/agentPortrait.ts";
import { credit } from "../../dashboard/test-support/agentCredit.ts";
import {
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";

const trunkStory = "See who owns Taken work";
const identity = "SEED-021#identify-taken-work-owner";

// Revision A publishes no agent profiles; revision B adds Akiho's.
const history = makeMe.aRepository
  .withRevision("A", {
    backlog: {
      taken: [
        makeMe.aBacklogEntry
          .with({
            title: trunkStory,
            identity,
            href: "seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner",
          })
          .please(),
      ],
    },
  })
  .withRevision("B", {
    agentProfiles: [
      makeMe.anAgentProfile
        .executing({
          name: "Akiho",
          identity,
          mode: "trunk",
          branch: "origin/main",
        })
        .please(),
    ],
  })
  .please();

test("a project without agent profiles still loads, and a reload shows a profile published since", async ({
  page,
  afterGitHubStops,
}) => {
  const published = await publishCommittedFileHistory(page, history, {
    repository,
    trunk: "A",
    afterGitHubStops,
  });
  const { A, B } = published.published;
  expectServedHomesReach(githubFor(page), repository, A.revision);

  await openUntilRead(page);

  const { taken, problem } = parts(page);
  const card = storyCard(taken, trunkStory);

  await test.step("with no profile directory at the revision, the owner is not recorded and nothing fails", async () => {
    await expectPublishedRevision(page, A.revision);
    await expect(card).toContainText("Owner not recorded");
    await expect(credit(card).portrait).toHaveCount(0);
    await expect(card.locator("img")).toHaveCount(0);
    await expect(problem).toHaveCount(0);
  });

  await test.step("after a reload, the profile published at the new revision is shown", async () => {
    published.moveTrunk(B);
    expectServedHomesReach(githubFor(page), repository, B.revision);
    await reloadUntilRead(page);
    await expectPublishedRevision(page, B.revision);
    await expect(card).not.toContainText("Owner not recorded");
    await expectPortrait(card, "Akiho-chan", {
      atlas: 1,
      position: "50% 12.5%",
    });
    // The scan view shows the unrecorded host and model as gaps; the mode is
    // in the card's detail.
    const { line, host, hostMark } = credit(card);
    await expect(line).toHaveText(
      "Akiho-chan · Fixture Committer · host not recorded · model not recorded",
    );
    await inspectedDetail(card);
    await expect(card).toContainText(
      "Akiho-chan · Trunk Mode · host not recorded · model not recorded",
    );
    // The unrecorded host stays a text gap, on the scan line and in the
    // detail: no tool mark is invented.
    await expect(host).toHaveText(["host not recorded", "host not recorded"]);
    await expect(hostMark).toHaveCount(0);
    await expectMark(card, "mode", "Trunk Mode", "mode-icons/trunk.svg");
    await expect(card.locator("img")).toHaveCount(1);
  });
});
