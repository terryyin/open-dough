// One read asks each agent profile's addition once, for both its human's
// credit and, for a Taken profile, its Take's slice clock. A slow or stalled
// addition walk delays or leaves a gap in only its own profile's details,
// never another card's or the snapshot's read. The fake GitHub only publishes
// the slice clock records (sliceClockRecords.ts) and each profile's history,
// holding one addition commit's answer; the page clock is paused, and the
// local read boundary and the page decide everything shown.

import type { Page } from "@playwright/test";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishes, type RepositoryAnswerer } from "./support/fakeGitHub.ts";
import { pathChange } from "./pathHistoryAnswers.ts";
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
// answers one profile's addition commit only when `held` settles.
const takenAddition = {
  ...takes.Akiho,
  committer: credited,
  login: "terryyin",
};
const preparing = "Prepared beside the clocked work";
const preparation = pathChange(0x22, "added", preparer);

async function openedWithHeldAddition(
  page: Page,
  heldSha: string,
  held: Promise<unknown>,
) {
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
  const answer: RepositoryAnswerer = async (call) => {
    if (call.request.kind === "commit" && call.request.sha === heldSha) {
      await held;
    }
    return published(call);
  };
  const github = githubFor(page);
  github.serve(repository, answer);
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [preparing],
  });
  // The held addition commit has reached GitHub through the local `gh`.
  await expect
    .poll(() =>
      github.calls.some(
        ({ request }) => request.kind === "commit" && request.sha === heldSha,
      ),
    )
    .toBe(true);
  const { taken, backlog, problem } = parts(page);
  return {
    card: taken.getByRole("article", { name: afterTake }),
    otherTaken: taken.getByRole("article", { name: justTaken }),
    preparingCard: backlog.getByRole("article", { name: preparing }),
    problem,
  };
}

function held() {
  let release: () => void = () => undefined;
  const answered = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { answered, release };
}

test("another profile's slow human credit never holds back a Taken card's slice clock, and fills in when its addition commit answers", async ({
  page,
}) => {
  const { answered, release } = held();
  const { card, preparingCard, problem } = await openedWithHeldAddition(
    page,
    preparation.sha,
    answered,
  );

  await test.step("while the preparer's addition commit is held, the Taken card's clock and human are shown and the preparer is still being read", async () => {
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(card.locator(".owner-human")).toHaveText(
      `Human developer: ${credited}`,
    );
    await expect(preparingCard.locator(".owner-human")).toHaveText(
      "Reading human developer…",
    );
  });

  await test.step("the addition commit's answer names the preparer, and the clock stays", async () => {
    release();
    await expect(preparingCard.locator(".owner-human")).toHaveText(
      `Human developer: ${preparer}`,
    );
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(problem).toHaveCount(0);
  });
});

test("a Taken profile's slow addition leaves only its own card's clock and human reading, until both fill from that one addition", async ({
  page,
}) => {
  const { answered, release } = held();
  const { card, otherTaken, problem } = await openedWithHeldAddition(
    page,
    takenAddition.sha,
    answered,
  );

  await test.step("while the Take's addition commit is held, its card's clock and human are still being read, and another Taken card's clock is shown", async () => {
    await expect(otherTaken).toContainText("Current slice started 5 min ago");
    await expect(card).toContainText("Reading current slice time…");
    await expect(card.locator(".owner-human")).toHaveText(
      "Reading human developer…",
    );
  });

  await test.step("the addition commit's answer starts the clock and names the human", async () => {
    release();
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(card.locator(".owner-human")).toHaveText(
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
    new Promise<never>(() => undefined),
  );
  await expect(otherTaken).toContainText("Current slice started 5 min ago");
  await page.clock.runFor(30_000);
  await expect(card).toContainText(
    "Current slice time unavailable: GitHub did not answer within 30 seconds while reading the last plan commit or the Take.",
  );
  await expect(card.locator(".owner-human")).toHaveText(
    "Human developer unknown. GitHub did not answer within 30 seconds while reading the commit that added this agent profile.",
  );
  await expect(otherTaken).toContainText("Current slice started 5 min ago");
  await expect(problem).toHaveCount(0);
});
