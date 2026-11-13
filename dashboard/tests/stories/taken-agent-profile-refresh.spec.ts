// A Taken card's owner when the revision publishes no agent profiles, and
// after a reload at a revision that publishes one. The fake GitHub only
// publishes the files; the page decides everything shown.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../dashboardTest.ts";
import { shortRevision, parts } from "../dashboardPage.ts";
import {
  defaultRepository as repository,
  publishFiles,
} from "../publishedOrigin.ts";
import { expectMark, expectPortrait } from "../agentPortrait.ts";
import { credit } from "../agentCredit.ts";
import { inspectedDetail, storyCard } from "../storyCardControls.ts";
import { openUntilRead, reloadUntilRead } from "../pageRequestNotes.ts";
import { describedRevisions } from "../describedRevisions.ts";

const trunkStory = "See who owns Taken work";
const identity = "SEED-021#identify-taken-work-owner";

// Revision A publishes no agent profiles; revision B adds Akiho's.
const { A, B } = describedRevisions(
  makeMe.aRepository
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
    .please(),
  { A: "a1".repeat(20), B: "b2".repeat(20) },
);

test("a project without agent profiles still loads, and a reload shows a profile published since", async ({
  page,
}) => {
  await publishFiles(page, { repository, ...A });

  await openUntilRead(page);

  const { taken, problem, readRevision } = parts(page);
  const card = storyCard(taken, trunkStory);

  await test.step("with no profile directory at the revision, the owner is not recorded and nothing fails", async () => {
    await expect(readRevision).toContainText(shortRevision(A.revision));
    await expect(card).toContainText("Owner not recorded");
    await expect(credit(card).portrait).toHaveCount(0);
    await expect(card.locator("img")).toHaveCount(0);
    await expect(problem).toHaveCount(0);
  });

  await test.step("after a reload, the profile published at the new revision is shown", async () => {
    await publishFiles(page, { repository, ...B });
    await reloadUntilRead(page);
    await expect(readRevision).toContainText(shortRevision(B.revision));
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
