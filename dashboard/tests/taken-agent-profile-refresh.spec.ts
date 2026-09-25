// A Taken card's owner when the revision publishes no agent profiles, and
// after a refresh to a revision that publishes one. The fake GitHub only
// publishes the files; the page decides everything shown.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  defaultRepository as repository,
  publishFiles,
} from "./publishedOrigin.ts";
import { expectMark, expectPortrait } from "./agentPortrait.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const agents = ".planning/agents";
const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);
const trunkStory = "See who owns Taken work";

test("a project without agent profiles still loads, and a refresh shows a profile published since", async ({
  page,
}) => {
  const onlyBacklog = `# Product backlog

## Taken

- [${trunkStory}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — SEED-021#identify-taken-work-owner

## Backlog list
`;
  await publishFiles(page, {
    repository,
    revision: revisionA,
    files: { [backlogPath]: onlyBacklog },
  });

  await page.goto("/");

  const { taken, source, refresh, problem } = parts(page);
  const card = taken.getByRole("article", { name: trunkStory });

  await test.step("with no profile directory at the revision, the owner is not recorded and nothing fails", async () => {
    await expect(source).toContainText(revisionA);
    await expect(card).toContainText("Owner not recorded");
    await expect(card.locator(".agent-portrait")).toHaveCount(0);
    await expect(card.locator("img")).toHaveCount(0);
    await expect(problem).toHaveCount(0);
  });

  await test.step("after a refresh, the profile published at the new revision is shown", async () => {
    await publishFiles(page, {
      repository,
      revision: revisionB,
      files: {
        [backlogPath]: onlyBacklog,
        [`${agents}/akiho-chan.json`]: renderAgentProfile({
          name: "Akiho",
          identity: "SEED-021#identify-taken-work-owner",
          mode: "trunk",
          branch: "origin/main",
          host: undefined,
          model: undefined,
        }),
      },
    });
    await refresh.click();
    await expect(source).toContainText(revisionB);
    await expect(card).toContainText(
      "Akiho-chan · Trunk Mode · host not recorded · model not recorded",
    );
    await expect(card).not.toContainText("Owner not recorded");
    await expectPortrait(card, "Akiho-chan", {
      atlas: 1,
      position: "50% 12.5%",
    });
    // The unrecorded host stays a text gap: no tool mark is invented.
    await expect(card.locator(".owner-host")).toHaveText("host not recorded");
    await expect(card.locator(".owner-host img")).toHaveCount(0);
    await expectMark(card, "mode", "Trunk Mode", "mode-icons/trunk.svg");
    await expect(card.locator("img")).toHaveCount(1);
  });
});
