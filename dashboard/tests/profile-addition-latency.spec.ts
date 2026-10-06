// One read asks each agent profile's addition once, for both its human's
// credit and, for a Taken profile, its Take's slice clock. A slow or stalled
// addition walk delays or leaves a gap in only its own profile's details,
// never another card's or the snapshot's read. The fake GitHub only publishes
// the slice clock records (sliceClockRecords.ts) and each profile's history,
// holding one addition commit's answer; the page clock is paused, and the
// local read boundary and the page decide everything shown.

import type { Locator, Page } from "@playwright/test";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import { publishes } from "./support/fakeGitHub.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { pathChange } from "./pathHistoryAnswers.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  afterTake,
  backlogPath,
  committed,
  files,
  history,
  justTaken,
  opened,
  profilePath,
  repository,
  revision,
  stories,
  takes,
} from "./sliceClockRecords.ts";
import { credited, preparer } from "./agentAttributionRecords.ts";

// The slice clock records (sliceClockRecords.ts), where `credited` added the
// Taken work's profile, beside a queued story `preparer` prepares. GitHub
// answers one profile's addition commit only once `release` is called.
const takenAddition = {
  ...takes.Akiho,
  committer: credited,
  login: "terryyin",
};
const preparing = "Prepared beside the clocked work";
const preparation = pathChange(0x22, "added", preparer);

async function openedWithHeldAddition(page: Page, heldSha: string) {
  await pausePageClockAt(page, opened);
  const published = publishes({
    revision,
    files: {
      ...files,
      [backlogPath]: `${files[backlogPath] ?? ""}- [${preparing}](seeds/SEED-091-clock.md#preparing) — SEED-091#preparing\n`,
      [profilePath("Kirara")]: renderAgentProfile({
        name: "Kirara",
        identity: "SEED-091#preparing",
        activity: "preparation",
      }),
    },
    committed,
    history: {
      ...history,
      [profilePath("Akiho")]: [takenAddition],
      [profilePath("Kirara")]: [preparation],
    },
  });
  const isHeld = (request: GhRequest) =>
    request.kind === "commit" && request.sha === heldSha;
  const { answer, release } = holdingAnswer(published, isHeld);
  const github = githubFor(page);
  github.serve(repository, answer);
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [preparing],
  });
  // The held addition commit has reached GitHub through the local `gh`.
  await expect
    .poll(() => github.calls.some(({ request }) => isHeld(request)))
    .toBe(true);
  const { taken, backlog, problem } = parts(page);
  return {
    card: taken.getByRole("article", { name: afterTake }),
    otherTaken: taken.getByRole("article", { name: justTaken }),
    preparingCard: backlog.getByRole("article", { name: preparing }),
    problem,
    release,
  };
}

// A card's credited human, read in its detail.
async function humanOf(card: Locator): Promise<Locator> {
  return (await inspectedDetail(card)).locator(".owner-human");
}

test("another profile's slow human credit never holds back a Taken card's slice clock, and fills in when its addition commit answers", async ({
  page,
}) => {
  const { card, preparingCard, problem, release } =
    await openedWithHeldAddition(page, preparation.sha);

  await test.step("while the preparer's addition commit is held, the Taken card's clock and human are shown and the preparer is still being read", async () => {
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(await humanOf(card)).toHaveText(
      `Human developer: ${credited}`,
    );
    await expect(await humanOf(preparingCard)).toHaveText(
      "Reading human developer…",
    );
  });

  await test.step("the addition commit's answer names the preparer, and the clock stays", async () => {
    release();
    await expect(await humanOf(preparingCard)).toHaveText(
      `Human developer: ${preparer}`,
    );
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(problem).toHaveCount(0);
  });
});

test("a Taken profile's slow addition leaves only its own card's clock and human reading, until both fill from that one addition", async ({
  page,
}) => {
  const { card, otherTaken, problem, release } = await openedWithHeldAddition(
    page,
    takenAddition.sha,
  );

  await test.step("while the Take's addition commit is held, its card's clock and human are still being read, and another Taken card's clock is shown", async () => {
    await expect(otherTaken).toContainText("Current slice started 5 min ago");
    await expect(card).toContainText("Reading current slice time…");
    // Reading is detail-only: the scan view shows no warning meanwhile.
    await expect(card.locator(".owner-human-gap")).toHaveCount(0);
    await expect(await humanOf(card)).toHaveText("Reading human developer…");
  });

  await test.step("the addition commit's answer starts the clock and names the human", async () => {
    release();
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(await humanOf(card)).toHaveText(
      `Human developer: ${credited}`,
    );
    await expect(problem).toHaveCount(0);
  });
});

test("a Taken profile's addition walk still unanswered at the wait bound is its clock's and its human's gap, not the snapshot's read problem", async ({
  page,
}) => {
  const { card, otherTaken, problem } = await openedWithHeldAddition(
    page,
    takenAddition.sha,
  );
  await expect(otherTaken).toContainText("Current slice started 5 min ago");
  await page.clock.runFor(30_000);
  await expect(card).toContainText(
    "Current slice time unavailable: GitHub did not answer within 30 seconds while reading the last plan commit or the Take.",
  );
  // The scan view warns beside the developer before inspection; the detail
  // explains why.
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toBeVisible();
  await expect(card.locator(".card-owner .owner-human-gap")).toHaveText(
    "Human developer unknown",
  );
  await expect(card).not.toContainText(
    "while reading the commit that added this agent profile",
  );
  await expect(await humanOf(card)).toHaveText(
    "Human developer unknown. GitHub did not answer within 30 seconds while reading the commit that added this agent profile.",
  );
  await expect(card.locator(".card-owner .owner-human-gap")).toHaveText(
    "Human developer unknown",
  );
  await expect(otherTaken).toContainText("Current slice started 5 min ago");
  await expect(problem).toHaveCount(0);
});
