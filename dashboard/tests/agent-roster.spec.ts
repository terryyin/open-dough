// An agent portrait on a Taken or Preparing card opens the selected project's
// agent roster, derived from the same published snapshot as the cards, and
// Back returns to the stories as they were left. The fake GitHub only
// publishes files (agentRosterRecords.ts); the local read boundary, the shared
// profile reader, and the page decide everything shown.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  parts,
} from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  agentIdentity,
  agentNames,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  doughnut,
  doughnutStory,
  openDough,
  openDoughFiles,
  publishUnlistableProfiles,
  pygardon,
  queuedIdentity,
  queuedStory,
  takenIdentity,
  takenStory,
  unlistedIdentity,
} from "./agentRosterRecords.ts";

const everyAgent = agentNames.map((name) => agentIdentity(name).agent);
// Why Pygardon's read failed, as the page says it.
const backlogUnreadable = `GitHub answered HTTP 404 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${pygardon.revision}.`;

test("a card's agent portrait opens the project's agent roster, and Back returns to the stories as they were left", async ({
  page,
}) => {
  await publishFiles(page, { ...openDough, files: openDoughFiles });
  publishUnlistableProfiles(page);
  await publishFiles(page, pygardon);
  await page.goto("/");

  const { taken, backlog, project } = parts(page);
  await expectMembership(page, { taken: [takenStory], backlog: [queuedStory] });
  await expect(page.getByText("Reading agent profile…")).toHaveCount(0);
  const takenCard = taken.getByRole("article", { name: takenStory });
  const roster = page.getByRole("region", { name: "Agent roster" });
  const members = roster.getByRole("listitem");
  const member = (agent: string) =>
    members.filter({
      has: page.getByRole("heading", { name: agent, exact: true }),
    });
  const opener = (agent: string) =>
    page.getByRole("button", { name: `Show ${agent} in the agent roster` });
  const back = roster.getByRole("button", { name: "Back to stories" });

  await test.step("the Taken card's portrait opens the roster with every agent and the clicked one identified", async () => {
    await takenCard.getByRole("button", { name: "Inspect story" }).click();
    await opener("Akiho-chan").click();
    await expect(roster).toBeVisible();
    await expect(taken).toBeHidden();
    await expect(members.getByRole("heading")).toHaveText(everyAgent);
    await expect(members.locator(".agent-portrait")).toHaveCount(29);
    for (const portrait of await members.locator(".agent-portrait").all()) {
      await expect(portrait).toBeVisible();
    }
    await expect(roster.locator('[aria-current="true"]')).toHaveCount(1);
    await expect(member("Akiho-chan")).toHaveAttribute("aria-current", "true");
    await expect(member("Akiho-chan")).toBeFocused();
    await expect(roster).toContainText(
      `Open Dough: agent profiles published at revision ${openDough.revision.slice(0, 7)}.`,
    );
  });

  await test.step("each commission shows its task, activity, and recorded host and model, and unknowns stay distinct", async () => {
    const akiho = member("Akiho-chan");
    await expect(akiho.locator(".roster-activity")).toHaveText("Taken");
    await expect(akiho).toContainText(takenStory);
    await expect(akiho).toContainText(takenIdentity);
    await expect(akiho.locator(".owner-summary")).toHaveText(
      "Trunk Mode · Claude Code · claude-opus-5-5",
    );

    const kirara = member("Kirara-chan");
    await expect(kirara.locator(".roster-activity")).toHaveText("Preparing");
    await expect(kirara).toContainText(queuedStory);
    await expect(kirara).toContainText(queuedIdentity);
    await expect(kirara.locator(".owner-summary")).toHaveText(
      "Cursor · model not recorded",
    );

    // Its work is not in the backlog read: the recorded identity and a title
    // gap, and nothing guessed for the host or model it never recorded.
    const yuma = member("Yuma-chan");
    await expect(yuma.locator(".roster-activity")).toHaveText("Taken");
    await expect(yuma).toContainText(unlistedIdentity);
    await expect(yuma).toContainText(
      "Task title not found: the published backlog at this revision lists no entry with this identity.",
    );
    await expect(yuma.locator(".owner-summary")).toHaveText(
      "Story Branch Mode · host not recorded · model not recorded",
    );

    await expect(member("Mana-chan")).toContainText(
      "Commission uncertain: agent profile mana-chan.json is unreadable: profile is not JSON.",
    );
    await expect(member("Mana-chan")).not.toContainText("Not commissioned");

    // A profile filed under Yui that names Sola is Yui's unreadable
    // profile: Yui is not called uncommissioned, and Sola gains nothing.
    await expect(member("Yui-chan")).toContainText(
      "Commission uncertain: agent profile yui-chan.json is unreadable: profile names another agent.",
    );
    await expect(member("Yui-chan")).not.toContainText("Not commissioned");
    await expect(member("Sola-chan")).toContainText("Not commissioned");
    await expect(member("Sola-chan")).not.toContainText(queuedIdentity);

    // Every other agent was read to have no profile.
    await expect(members.filter({ hasText: "Not commissioned" })).toHaveCount(
      24,
    );
    await expect(roster.getByRole("list")).not.toContainText(
      /online|offline|live|away|active|busy|idle/i,
    );
  });

  await test.step("Back returns to the same project with the story detail open and focus on the portrait that opened the roster", async () => {
    await back.click();
    await expect(roster).toHaveCount(0);
    await expect(taken).toBeVisible();
    await expect(
      takenCard.getByRole("button", { name: "Hide detail" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(opener("Akiho-chan")).toBeFocused();
  });

  await test.step("the Preparing card's portrait opens the roster from the keyboard, and Back returns there", async () => {
    // The profile filed under Yui that names Sola prepares nothing here.
    const queuedCard = backlog.getByRole("article", { name: queuedStory });
    await expect(queuedCard.locator(".card-preparing")).toContainText(
      "Kirara-chan",
    );
    await expect(queuedCard).not.toContainText(/Sola-chan|Conflicting records/);
    await opener("Kirara-chan").focus();
    await page.keyboard.press("Enter");
    await expect(member("Kirara-chan")).toBeFocused();
    await expect(member("Kirara-chan")).toHaveAttribute("aria-current", "true");
    await expect(member("Akiho-chan")).not.toHaveAttribute(
      "aria-current",
      /.*/,
    );
    await page.keyboard.press("Shift+Tab");
    await expect(back).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(backlog).toBeVisible();
    await expect(opener("Kirara-chan")).toBeFocused();
    await expect(
      takenCard.getByRole("button", { name: "Hide detail" }),
    ).toBeVisible();
  });

  await test.step("selecting another project replaces the roster's source, and a failed profile read leaves every commission unknown", async () => {
    await opener("Akiho-chan").click();
    await expect(roster).toBeVisible();
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );
    await expect(
      members.filter({
        hasText: "Commission unknown. Agent profiles could not be read.",
      }),
    ).toHaveCount(29);
    await expect(roster).not.toContainText("Not commissioned");
    await expect(roster).not.toContainText(takenStory);
    await expect(roster).not.toContainText(/Taken|Preparing/);

    await back.click();
    await expectMembership(page, { taken: [doughnutStory], backlog: [] });
    await expect(taken).toBeVisible();
  });

  await test.step("selecting a project whose backlog cannot be read says why no commission is known, and marks no agent as opened", async () => {
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectMembership(page, {
      taken: [takenStory],
      backlog: [queuedStory],
    });
    await opener("Akiho-chan").click();
    await expect(member("Akiho-chan")).toHaveAttribute("aria-current", "true");
    await project.getByRole("radio", { name: "Pygardon", exact: true }).check();
    await expect(roster).toContainText(
      "Pygardon: no published work has been read, so no commission is known.",
    );
    await expect(
      members.filter({ hasText: `Commission unknown. ${backlogUnreadable}` }),
    ).toHaveCount(29);
    await expect(roster).not.toContainText("Reading agent profile…");
    await expect(roster.locator('[aria-current="true"]')).toHaveCount(0);
    await expect(roster).not.toContainText("Opened from its portrait");

    await back.click();
    await expect(roster).toHaveCount(0);
    await expectProblemAndNoSnapshot(
      page,
      backlogUnreadable,
      pygardon.repository,
    );
  });
});
