// Preparing on queued cards, from preparation assignments the production
// commands published (preparingJourney.ts). Each snapshot is the local
// origin's main after one published step, served as those exact Git bytes;
// nothing here writes a profile or a story-state record.

import { expect, test } from "./dashboardTest.ts";
import { expectReadableContrast, zoomedWindow } from "./accessibleReading.ts";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import { expectMark } from "./agentPortrait.ts";
import { contentPathsRead, publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { noConnection } from "./originAnswers.ts";
import {
  publishPreparingJourney,
  storyA,
  storyB,
  storyC,
  type PreparingJourney,
} from "./preparingJourney.ts";

let journey: PreparingJourney;
// Publishing the journey runs every production preparation command against a
// local origin (about 6s idle); give it its own budget so a busy machine
// cannot starve it inside the default per-test timeout.
test.beforeAll(async () => {
  test.setTimeout(120_000);
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
  const { backlog, taken, source, refresh } = parts(page);
  const card = (title: string) => backlog.getByRole("article", { name: title });
  const badges = (title: string) =>
    card(title).locator(".badge").allTextContents();
  const show = async (revision: string) => {
    origin.advanceTo(revision);
    await refresh.click();
    await expect(source).toContainText(revision);
    await expectMembership(page, { taken: [], backlog: order });
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  };
  const expectNotPreparing = async (title: string) => {
    await expect(card(title)).not.toContainText("Preparing");
    await expect(card(title).locator(".owner-summary")).toHaveCount(0);
  };

  await expectMembership(page, { taken: [], backlog: order });
  await expect(
    card(storyB).getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  const before = { b: await badges(storyB), c: await badges(storyC) };

  await test.step("before any announcement, no queued card claims Preparing", async () => {
    for (const title of order) await expectNotPreparing(title);
  });

  await test.step("announcements show Preparing and each developer on its queued card, keeping priority and badges", async () => {
    await show(journey.announced);
    for (const title of [storyC, storyB]) {
      await expect(card(title).locator(".preparing-activity")).toHaveText(
        "Preparing",
      );
      await expectReadableContrast(card(title).locator(".preparing-activity"));
    }
    await expect(card(storyC).locator(".owner-summary")).toHaveText(
      `${preparers.refining} · Claude Code · claude-opus-5-5`,
    );
    await expectMark(
      card(storyC),
      "host",
      "Claude Code",
      "tool-avatars/claude.png",
    );
    // The developer's portrait is decorative beside the name.
    const portrait = card(storyC).locator(".owner-agent .agent-portrait");
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute("aria-hidden", "true");
    // No tool or model was recorded: each stays a text gap with no mark.
    await expect(card(storyB).locator(".owner-summary")).toHaveText(
      `${preparers.reconsidering} · host not recorded · model not recorded`,
    );
    await expect(card(storyB).locator(".owner-host img")).toHaveCount(0);
    await expect(card(storyA)).not.toContainText("Preparing");
    // The same priorities and preparation facts as before preparation began.
    for (const [index, title] of order.entries()) {
      await expect(card(title).locator(".card-priority")).toHaveText(
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
    await expect(
      card(storyC).getByText("Refined", { exact: true }),
    ).toBeVisible();
    await expect(
      card(storyC).getByText("Ready for execution", { exact: true }),
    ).toHaveCount(0);
    await expect(card(storyB).locator(".owner-summary")).toContainText(
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
    for (const label of ["Slice planned", "Ready for execution"]) {
      await expect(
        card(storyC).getByText(label, { exact: true }),
      ).toBeVisible();
    }
    expect(preparers.planning).not.toBe(preparers.refining);
  });

  await test.step("unreadable profiles leave Preparing unknown on each queued card", async () => {
    const restore = origin.answerWith(".planning/agents", noConnection);
    await show(journey.conflicting);
    for (const title of order) {
      const unknown = card(title).getByText(
        "Preparation assignment unknown. Agent profiles could not be read.",
      );
      await expect(unknown).toBeVisible();
      await expectReadableContrast(unknown);
      await expect(card(title).locator(".owner-summary")).toHaveCount(0);
    }
    restore();
  });

  await test.step("two preparation assignments for one entry are shown as conflicting records", async () => {
    await refresh.click();
    const [first, second] = preparers.conflicting;
    await expect(card(storyA).locator(".owner-summary")).toHaveText([
      `${first} · host not recorded · model not recorded`,
      `${second} · host not recorded · model not recorded`,
    ]);
    await expect(card(storyA)).toContainText(
      "Conflicting records: 2 preparation assignments name this entry.",
    );
    await expect(card(storyA)).not.toContainText(
      "Preparation assignment unknown",
    );
    // At 320px, as with 400% browser zoom, both developers stay readable.
    await page.setViewportSize(zoomedWindow);
    await card(storyA).scrollIntoViewIfNeeded();
    await expectNoSidewaysScrollAndWholeText(page);
  });
});
