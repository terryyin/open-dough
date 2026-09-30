// A Taken card whose profile agent is an Odd-e nerds member shows that member's
// local cartoon avatar (agent-avatars/odd-e-nerds/cartoon/<lowercase name>.webp, git-ignored) as
// its portrait; without the photo it shows the name alone. The photo request is
// answered by the test, since the photos are never in the repository.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { enlargedView, expectPortrait } from "./agentPortrait.ts";
import { avatarPng } from "./avatarAnswers.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const nerdStory = "See who owns Taken work";
const atlasStory = "Show every agent's portrait";
const photoUrl = /\/agent-avatars\/odd-e-nerds\/cartoon\/stanly\.webp$/;

const profile = (name: string, identity: string) =>
  renderAgentProfile({
    name,
    identity,
    mode: "trunk",
    branch: "origin/main",
    host: "claude",
    model: "claude-opus-5-5",
  });

async function openBoard(page: Page) {
  await publishFiles(page, {
    repository: "terryyin/open-dough",
    revision: "a1".repeat(20),
    files: {
      ".planning/PRODUCT-BACKLOG.md": `# Product backlog

## Taken

- [${nerdStory}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — SEED-021#identify-taken-work-owner
- [${atlasStory}](seeds/SEED-038-agent-and-tool-avatars.md#recognize-agents-and-tools-by-avatar) — SEED-038#recognize-agents-and-tools-by-avatar

## Backlog list
`,
      ".planning/agents/stanly-chan.json": profile(
        "stanly",
        "SEED-021#identify-taken-work-owner",
      ),
      ".planning/agents/rina-chan.json": profile(
        "Rina",
        "SEED-038#recognize-agents-and-tools-by-avatar",
      ),
    },
  });
  await page.goto("/");
  await expectMembership(page, { taken: [nerdStory, atlasStory], backlog: [] });
  return parts(page).taken;
}

test("a nerds member's card shows the photo as its portrait, enlarged on hover, while a current agent keeps its atlas tile", async ({
  page,
}) => {
  const photo = avatarPng(40);
  await page.route(photoUrl, (route) => route.fulfill(photo));
  const taken = await openBoard(page);
  const card = taken.getByRole("article", { name: nerdStory });

  const portrait = card.locator(".agent-portrait");
  await expect(card.locator(".owner-agent")).toHaveText("stanly-chan");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute("aria-hidden", "true");
  await expect(portrait).toHaveCSS("background-image", /stanly\.webp"\)$/);
  await portrait.hover();
  await expect
    .poll(async () => {
      const { shown, layers } = await enlargedView(portrait);
      return shown && layers.every((layer) => photoUrl.test(layer));
    })
    .toBe(true);

  await page.mouse.move(0, 0);
  await expectPortrait(
    taken.getByRole("article", { name: atlasStory }),
    "Rina-chan",
    { atlas: 5, position: "50% 87.5%" },
  );
});

test("a nerds member's card without the photo shows the name and no portrait, and no error", async ({
  page,
}) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    // The browser logs every non-OK resource (the absent photo, the unserved
    // human avatars); those are not errors of the page.
    if (
      message.type() === "error" &&
      !message.text().startsWith("Failed to load resource")
    )
      problems.push(message.text());
  });
  await page.route(photoUrl, (route) => route.fulfill({ status: 404 }));
  const taken = await openBoard(page);
  const card = taken.getByRole("article", { name: nerdStory });

  await expect(card.locator(".owner-agent")).toHaveText("stanly-chan");
  await expect(card.locator(".agent-portrait")).toHaveCount(0);
  await expect(card).not.toContainText(/error|failed|missing/i);
  expect(problems).toEqual([]);
});
