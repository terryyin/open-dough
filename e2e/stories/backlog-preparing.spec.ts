// Preparing on queued cards from published preparation assignments. Each
// named step in preparingJourney.ts is served from a real Git revision.

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  expectReadableContrast,
  zoomedWindow,
} from "../../dashboard/tests/accessibleReading.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "../../dashboard/tests/pageLayout.ts";
import { expectMark } from "../../dashboard/tests/agentPortrait.ts";
import { credit } from "../../dashboard/tests/agentCredit.ts";
import {
  hideDetail,
  inspectedDetail,
  storyCard,
} from "../../dashboard/tests/storyCardControls.ts";
import {
  badgeLabels,
  expectBadges,
} from "../../dashboard/tests/storyCardFacts.ts";
import {
  contentPathsRead,
  publishCommittedOrigin,
} from "../../dashboard/tests/committedOrigin.ts";
import {
  shortRevision,
  expectMembership,
  expectSettledPage,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { noConnection } from "../../dashboard/tests/originAnswers.ts";
import {
  publishPreparingJourney,
  storyA,
  storyB,
  storyC,
  type PreparingJourney,
} from "../../dashboard/tests/preparingJourney.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";

let journey: PreparingJourney;
test.beforeAll(async () => {
  journey = await publishPreparingJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as PreparingJourney | undefined)?.cleanup());

const order = [storyA, storyB, storyC];
const profileFile = (agent: string) =>
  `.planning/agents/${agent.toLowerCase()}.json`;

test("a queued card shows Preparing and its developer from published assignments until preparation lands or is abandoned", async ({
  page,
}) => {
  const { preparers } = journey;
  const origin = await publishCommittedOrigin(page, {
    repoDir: journey.origin,
    revision: journey.queued,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const { backlog, taken, readRevision } = parts(page);
  const card = (title: string) => storyCard(backlog, title);
  const badges = (title: string) => badgeLabels(card(title));
  const show = async (revision: string) => {
    origin.advanceTo(revision);
    await reloadUntilRead(page);
    await expect(readRevision).toContainText(shortRevision(revision));
    await expectSettledPage(page, { taken: [], backlog: order });
  };
  const expectNotPreparing = async (title: string) => {
    await expect(card(title)).not.toContainText("Preparing");
    await expect(credit(card(title)).agent).toHaveCount(0);
  };
  // The scan view names each preparing developer beside its portrait with
  // its credited human, tool, and model; the human's explanation is in the
  // story's detail. Hiding it returns the keyboard to the card.
  const hidden = async (title: string) => {
    await hideDetail(card(title));
    await expect(card(title)).toBeFocused();
  };

  await expectMembership(page, { taken: [], backlog: order });
  await expectBadges(card(storyB), { shown: ["Ready for execution"] });
  const before = { b: await badges(storyB), c: await badges(storyC) };

  await test.step("before any announcement, no queued card claims Preparing", async () => {
    for (const title of order) await expectNotPreparing(title);
  });

  await test.step("announcements show Preparing and each developer on its queued card, keeping priority and badges", async () => {
    await show(journey.announced);
    for (const title of [storyC, storyB]) {
      const { activity } = credit(card(title));
      await expect(activity).toHaveText("Preparing");
      await expectReadableContrast(activity);
    }
    const preparingC = credit(card(storyC));
    const preparingB = credit(card(storyB));
    await expect(preparingC.agent).toHaveText(preparers.refining);
    await expect(preparingB.agent).toHaveText(preparers.reconsidering);
    // The developer's portrait is decorative beside the name.
    const portrait = credit(preparingC.agent).portrait;
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute("aria-hidden", "true");
    // The scan view reads the credited human, tool, and model after
    // Preparing, without opening Inspect story; the detail repeats them.
    await expect(preparingC.preparing).toHaveText(
      `Preparing${preparers.refining} · Fixture Committer · Claude Code · claude-opus-5-5`,
    );
    await expect(preparingC.line).toHaveText(
      `${preparers.refining} · Fixture Committer · Claude Code · claude-opus-5-5`,
    );
    await expectMark(
      preparingC.owner,
      "host",
      "Claude Code",
      "tool-avatars/claude.png",
    );
    await expect(card(storyC)).not.toContainText("Human developer");
    await expect(preparingC.summary).toHaveCount(0);
    // No tool or model was recorded: each stays a text gap with no mark.
    await expect(preparingB.line).toHaveText(
      `${preparers.reconsidering} · Fixture Committer · host not recorded · model not recorded`,
    );
    await expect(preparingB.hostMark).toHaveCount(0);
    const detailC = credit(await inspectedDetail(card(storyC)));
    await expect(detailC.summary).toHaveText(
      `${preparers.refining} · Claude Code · claude-opus-5-5`,
    );
    await expect(detailC.human).toHaveText(
      "Human developer: Fixture Committer",
    );
    // The detail keeps the host beside its mark.
    await expect(detailC.host).toHaveText("Claude Code");
    await expect(detailC.hostMark).toHaveCount(1);
    await hidden(storyC);
    // No tool or model was recorded: each stays a text gap with no mark.
    const detailB = credit(await inspectedDetail(card(storyB)));
    await expect(detailB.summary).toHaveText(
      `${preparers.reconsidering} · host not recorded · model not recorded`,
    );
    await expect(detailB.hostMark).toHaveCount(0);
    await hidden(storyB);
    await expect(card(storyA)).not.toContainText("Preparing");
    // The same priorities and preparation facts as before preparation began.
    for (const [index, title] of order.entries()) {
      await expect(card(title).locator(".story-card-priority")).toHaveText(
        `Priority ${index + 1}`,
      );
    }
    expect(await badges(storyB)).toEqual(before.b);
    expect(await badges(storyC)).toEqual(before.c);
    // An undertaking, not a running agent, and never a Taken owner.
    await expect(backlog).not.toContainText(
      /\b(?:running|online|active|Trunk Mode|Story Branch Mode)\b/i,
    );
    await expect(taken.getByRole("article")).toHaveCount(0);
  });

  await test.step("each assignment is read at the shown revision", () => {
    const paths = contentPathsRead(origin);
    for (const agent of [preparers.refining, preparers.reconsidering]) {
      expect(paths).toContain(`${profileFile(agent)}?ref=${journey.announced}`);
    }
  });

  await test.step("landing refinement alone ends Preparing and shows recorded refinement, not readiness", async () => {
    await show(journey.refinedLanded);
    await expectNotPreparing(storyC);
    await expectBadges(card(storyC), {
      shown: ["Refined"],
      absent: ["Ready for execution"],
    });
    await expect(credit(card(storyB)).agent).toHaveText(
      preparers.reconsidering,
    );
  });

  await test.step("abandonment ends Preparing and leaves the previously ready facts", async () => {
    await show(journey.abandoned);
    await expectNotPreparing(storyB);
    expect(await badges(storyB)).toEqual(before.b);
  });

  await test.step("landing a planned result shows its recorded plan and readiness, prepared by the next developer in rotation", async () => {
    await show(journey.plannedLanded);
    await expectNotPreparing(storyC);
    await expectBadges(card(storyC), {
      shown: ["Slice planned", "Ready for execution"],
    });
    expect(preparers.planning).not.toBe(preparers.refining);
  });

  await test.step("unreadable profiles leave Preparing unknown on each queued card", async () => {
    const restore = origin.answerWith(".planning/agents", noConnection);
    await show(journey.conflicting);
    for (const title of order) {
      const { gap: unknown, agent } = credit(card(title));
      await expect(unknown).toHaveText(
        "Preparation assignment unknown. Agent profiles could not be read.",
      );
      await expect(unknown).toBeVisible();
      await expectReadableContrast(unknown);
      await expect(agent).toHaveCount(0);
    }
    restore();
  });

  await test.step("two preparation assignments for one entry are shown as conflicting records", async () => {
    await reloadUntilRead(page);
    const [first, second] = preparers.conflicting;
    // The conflict stays in the scan view, naming both developers.
    const conflicting = credit(card(storyA));
    await expect(conflicting.agent).toHaveText([first, second]);
    await expect(conflicting.line).toHaveText([
      `${first} · Fixture Committer · host not recorded · model not recorded`,
      `${second} · Fixture Committer · host not recorded · model not recorded`,
    ]);
    await expect(conflicting.gap).toHaveText(
      "Conflicting records: 2 preparation assignments name this entry.",
    );
    const detailA = credit(await inspectedDetail(card(storyA)));
    await expect(detailA.summary).toHaveText([
      `${first} · host not recorded · model not recorded`,
      `${second} · host not recorded · model not recorded`,
    ]);
    await expect(card(storyA)).not.toContainText(
      "Preparation assignment unknown",
    );
    // At 320px, as with 400% browser zoom, both developers stay readable.
    await page.setViewportSize(zoomedWindow);
    await card(storyA).scrollIntoViewIfNeeded();
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  });
});
