// The agent roster lists the agents of the collection the selected project
// chose in .planning/open-dough.json (read beside the profiles at the shown
// revision, authenticated-read-agent-settings.spec.ts): the current collection
// when the file or key is absent, the Odd-e nerds with their local photos when
// "nerds" is true, and no guess when the setting cannot be read. An agent of
// the other collection that still holds an assignment stays listed. The fake
// GitHub only publishes files; the shared rotation reader and the page decide
// everything shown.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { rosterParts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { avatarPng } from "./avatarAnswers.ts";
import {
  agentIdentity,
  agentNames,
  nerdAgentNames,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const story = "See who owns Taken work";
const identity = "SEED-021#identify-taken-work-owner";
const settingsPath = ".planning/open-dough.json";
const agentsOf = (names: readonly string[]) =>
  names.map((name) => agentIdentity(name).agent);

// Yui, a current-collection agent, holds the Taken story; stanly is a nerd.
const profile = (name: string) =>
  renderAgentProfile({
    name,
    identity,
    mode: "trunk",
    branch: "origin/main",
    host: "claude",
  });

async function openRoster(page: Page, settings?: string) {
  await publishFiles(page, {
    repository: "terryyin/open-dough",
    revision: "b3".repeat(20),
    files: {
      ".planning/PRODUCT-BACKLOG.md": `# Product backlog

## Taken

- [${story}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — ${identity}

## Backlog list
`,
      ".planning/agents/yui-chan.json": profile("Yui"),
      ...(settings === undefined ? {} : { [settingsPath]: settings }),
    },
  });
  await page.goto("/?project=open-dough&view=roster");
  return rosterParts(page);
}

test("without the setting the roster lists the current collection, with no nerds member", async ({
  page,
}) => {
  const { roster, members, member } = await openRoster(page);
  await expect(members.getByRole("heading")).toHaveText(agentsOf(agentNames));
  await expect(members).toHaveCount(29);
  await expect(member("Yui-chan")).toContainText(story);
  await expect(roster).not.toContainText("stanly-chan");
  await expect(roster).not.toContainText("collection unknown");
});

test("with nerds set the roster lists the 30 nerds, portraits where a photo exists and names alone where not, and Yui's existing assignment stays visible", async ({
  page,
}) => {
  const photo = avatarPng(40);
  await page.route(
    /\/agent-avatars\/odd-e-nerds\/cartoon\/[^/]+\.webp$/,
    (route) =>
      route.request().url().endsWith("/terry.webp")
        ? route.fulfill({ status: 404 })
        : route.fulfill(photo),
  );
  const { members, member } = await openRoster(page, '{"nerds":true}');

  await expect(members.getByRole("heading")).toHaveText([
    ...agentsOf(nerdAgentNames),
    "Yui-chan",
  ]);
  await expect(members).toHaveCount(31);
  // Every nerd but terry has a photo, and Yui keeps her atlas tile.
  await expect(members.locator(".agent-portrait")).toHaveCount(
    nerdAgentNames.length,
  );
  await expect(member("terry-chan").locator(".agent-portrait")).toHaveCount(0);
  await expect(member("stanly-chan").locator(".agent-portrait")).toBeVisible();
  await expect(member("stanly-chan")).toContainText("No assignment recorded");
  const yui = member("Yui-chan");
  await expect(yui.locator(".roster-activity")).toHaveText("Taken");
  await expect(yui).toContainText(story);
});

for (const [why, settings, problem] of [
  [
    "is not JSON",
    "{ not json",
    '.planning/open-dough.json is not readable JSON, so the "nerds" key cannot be read',
  ],
  [
    "holds a nerds value other than true",
    '{"nerds":"yes"}',
    '.planning/open-dough.json key "nerds" must be true when set',
  ],
] as const) {
  test(`when the setting ${why} the roster says the collection is unknown and lists no agent`, async ({
    page,
  }) => {
    const { roster, members } = await openRoster(page, settings);
    await expect(roster).toContainText(`Agent collection unknown. ${problem}.`);
    await expect(members).toHaveCount(0);
    await expect(roster).not.toContainText("No assignment recorded");
  });
}
