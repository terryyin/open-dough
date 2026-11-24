import { expect, onTestFinished, test } from "vitest";
import { page } from "vitest/browser";
import {
  agentIdentity,
  agentNames,
  nerdAgentNames,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import { browserSession } from "../review/browser-session.ts";

const storyHeldByYui = story("Repair the installer’s update report", 59);
const roster = page.getByRole("region", { name: "Agent roster", exact: true });
const members = roster.getByRole("listitem");
const member = (name: string) =>
  members.filter({ has: page.getByRole("heading", { name, exact: true }) });

async function openRoster(settings?: string) {
  const profile = makeMe.anAgentProfile
    .executing({
      name: "Yui",
      identity: storyHeldByYui.identity,
      host: "claude",
    })
    .please();
  const work = boardWork([], { taken: [storyHeldByYui] });
  await mountBoardFrame(
    work,
    { width: 1440, height: 900 },
    "roster",
    {},
    {
      readProfiles: () =>
        Promise.resolve({
          profiles: [
            {
              path: `.planning/${agentIdentity("Yui").path}`,
              text: renderAgentProfile(profile),
            },
          ],
          settings,
        }),
    },
  );
}

async function showsMembers(names: readonly string[]) {
  const headings = members.getByRole("heading");
  await expect
    .poll(() =>
      headings.elements().map((heading) => heading.textContent.trim()),
    )
    .toEqual(names.map((name) => agentIdentity(name).agent));
  expect(members.elements()).toHaveLength(names.length);
}

test("absent collection settings list the current roster and Yui's published assignment", async () => {
  await openRoster();
  await showsMembers(agentNames);
  expect(members.elements()).toHaveLength(29);
  await expect
    .element(
      member("Yui-chan").getByText(storyHeldByYui.title, { exact: true }),
    )
    .toBeVisible();
  await expect.element(member("stanly-chan")).not.toBeInTheDocument();
  await expect
    .element(roster.getByText(/Agent collection unknown/))
    .not.toBeInTheDocument();
});

test("nerds settings list Nerds with available portraits and keep Yui's existing assignment", async () => {
  const browser = browserSession();
  await browser.send("Network.enable");
  onTestFinished(async () => {
    await browser.send("Network.setBlockedURLs", { urls: [] });
    await browser.send("Network.disable");
  });
  await browser.send("Network.setBlockedURLs", {
    urls: ["*/agent-avatars/odd-e-nerds/cartoon/terry.webp"],
  });
  await openRoster('{"nerds":true}');

  await showsMembers([...nerdAgentNames, "Yui"]);
  expect(members.elements()).toHaveLength(31);
  await expect
    .poll(() => roster.element().querySelectorAll(".agent-portrait").length)
    .toBe(30);
  expect(
    member("terry-chan").element().querySelector(".agent-portrait"),
  ).toBeNull();
  const stanly = member("stanly-chan");
  await expect
    .element(stanly.getByText("No assignment recorded", { exact: true }))
    .toBeVisible();
  const portrait = stanly.element().querySelector(".agent-portrait");
  expect(portrait).not.toBeNull();
  if (portrait === null) throw new Error("Expected Stanly’s portrait.");
  expect(portrait.checkVisibility()).toBe(true);
  const yui = member("Yui-chan");
  await expect.element(yui.getByText("Taken", { exact: true })).toBeVisible();
  await expect
    .element(yui.getByText(storyHeldByYui.title, { exact: true }))
    .toBeVisible();
});

test("unreadable collection settings explain the invalid JSON and list no agent", async () => {
  await openRoster("{ not json");
  await expect
    .element(
      roster.getByText(
        'Agent collection unknown. .planning/open-dough.json is not readable JSON, so the "nerds" key cannot be read.',
        { exact: true },
      ),
    )
    .toBeVisible();
  expect(members.elements()).toHaveLength(0);
  await expect
    .element(roster.getByText("No assignment recorded", { exact: true }))
    .not.toBeInTheDocument();
});

test("an invalid nerds value explains the required setting and lists no agent", async () => {
  await openRoster('{"nerds":"yes"}');
  await expect
    .element(
      roster.getByText(
        'Agent collection unknown. .planning/open-dough.json key "nerds" must be true when set.',
        { exact: true },
      ),
    )
    .toBeVisible();
  expect(members.elements()).toHaveLength(0);
  await expect
    .element(roster.getByText("No assignment recorded", { exact: true }))
    .not.toBeInTheDocument();
});
