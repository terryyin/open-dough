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
  rosterParts,
} from "./dashboardPage.ts";
import {
  agentIdentity,
  agentNames,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  backlogUnreadable,
  doughnut,
  doughnutStory,
  expectDirectRosterFailure,
  expectOpenDoughAssignments,
  expectRoute,
  openDough,
  publishRosterOrigins,
  pygardon,
  queuedStory,
  takenStory,
} from "./agentRosterRecords.ts";

const everyAgent = agentNames.map((name) => agentIdentity(name).agent);

test("a card's agent portrait opens the project's agent roster, and Back returns to the stories as they were left", async ({
  page,
}) => {
  await publishRosterOrigins(page);
  await page.goto("/");

  const { taken, backlog, project } = parts(page);
  await expectMembership(page, { taken: [takenStory], backlog: [queuedStory] });
  await expect(page.getByText("Reading agent profile…")).toHaveCount(0);
  const takenCard = taken.getByRole("article", { name: takenStory });
  const { roster, members, member, opener, back } = rosterParts(page);

  await test.step("the Taken card's portrait opens the roster and history walks back and forward", async () => {
    await takenCard.getByRole("button", { name: "Inspect story" }).click();
    await opener("Akiho-chan").click();
    await expect(roster).toBeVisible();
    await expect(taken).toBeHidden();
    expectRoute(page, { project: "open-dough", view: "roster" });
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

    await page.goBack();
    expectRoute(page, { view: null });
    await expect(roster).toBeHidden();
    await expect(taken).toBeVisible();
    await expect(
      takenCard.getByRole("button", { name: "Hide detail" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(opener("Akiho-chan")).toBeFocused();

    await page.goForward();
    expectRoute(page, { project: "open-dough", view: "roster" });
    await expect(roster).toBeVisible();
    await expect(member("Akiho-chan")).toHaveAttribute("aria-current", "true");
    await expect(member("Akiho-chan")).toBeFocused();
  });

  await test.step("each assignment shows its task, activity, and recorded facts, and unknowns stay distinct", async () => {
    await expectOpenDoughAssignments(members, member);
  });

  await test.step("Back returns to the same project with the story detail open and focus on the portrait that opened the roster", async () => {
    await back.click();
    await expect(roster).toHaveCount(0);
    await expect(taken).toBeVisible();
    expectRoute(page, { view: null });
    await expect(
      takenCard.getByRole("button", { name: "Hide detail" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(opener("Akiho-chan")).toBeFocused();
  });

  await test.step("the Preparing card's portrait opens the roster from the keyboard, and Back returns there", async () => {
    const queuedCard = backlog.getByRole("article", { name: queuedStory });
    await expect(queuedCard.locator(".card-preparing")).toContainText(
      "Kirara-chan",
    );
    await expect(queuedCard).not.toContainText(/Sola-chan|Conflicting records/);
    await opener("Kirara-chan").focus();
    await page.keyboard.press("Enter");
    expectRoute(page, { project: "open-dough", view: "roster" });
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
    expectRoute(page, { view: null });
    await expect(opener("Kirara-chan")).toBeFocused();
    await expect(
      takenCard.getByRole("button", { name: "Hide detail" }),
    ).toBeVisible();
  });

  await test.step("selecting another project replaces the roster's source, and history back restores the previous project and view", async () => {
    await opener("Akiho-chan").click();
    await expect(roster).toBeVisible();
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    expectRoute(page, { project: "doughnut", view: "roster" });
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );
    await expect(
      members.filter({
        hasText: "Assignment unknown. Agent profiles could not be read.",
      }),
    ).toHaveCount(29);
    await expect(roster).not.toContainText("No assignment recorded");
    await expect(roster).not.toContainText(takenStory);
    await expect(roster).not.toContainText(/Taken|Preparing/);

    await page.goBack();
    expectRoute(page, { project: "open-dough", view: "roster" });
    await expect(roster).toContainText(
      `Open Dough: agent profiles published at revision ${openDough.revision.slice(0, 7)}.`,
    );
    await expect(member("Akiho-chan")).toHaveAttribute("aria-current", "true");

    await page.goForward();
    expectRoute(page, { project: "doughnut", view: "roster" });

    await back.click();
    expectRoute(page, { project: "doughnut", view: null });
    await expectMembership(page, { taken: [doughnutStory], backlog: [] });
    await expect(taken).toBeVisible();
  });

  await test.step("selecting a project whose backlog cannot be read says why no assignment is known, and marks no agent as opened", async () => {
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
    expectRoute(page, { project: "pygardon", view: "roster" });
    await expect(roster).toContainText(
      "Pygardon: no published work has been read, so no assignment is known.",
    );
    await expect(
      members.filter({ hasText: `Assignment unknown. ${backlogUnreadable}` }),
    ).toHaveCount(29);
    await expect(roster).not.toContainText("Reading agent profile…");
    await expect(roster.locator('[aria-current="true"]')).toHaveCount(0);
    await expect(roster).not.toContainText("Opened from its portrait");

    await back.click();
    await expect(roster).toHaveCount(0);
    expectRoute(page, { project: "pygardon", view: null });
    await expectProblemAndNoSnapshot(
      page,
      backlogUnreadable,
      pygardon.repository,
    );
  });
});

test("direct roster load, reload, unknown project fallback, and direct failure keep URL, view, and focus coherent", async ({
  page,
}) => {
  await publishRosterOrigins(page);

  await test.step("direct roster load selects project and focuses heading, reload keeps it, and Back returns to project stories", async () => {
    await page.goto("/?project=doughnut&view=roster");
    const { project, stages } = parts(page);
    const { roster, back } = rosterParts(page);

    await expect(project.getByRole("radio", { checked: true })).toHaveAttribute(
      "value",
      "doughnut",
    );
    await expect(roster).toBeVisible();
    await expect(
      roster.getByRole("heading", { name: "Agent roster" }),
    ).toBeFocused();
    await expect(roster.locator('[aria-current="true"]')).toHaveCount(0);
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );

    await page.reload();
    await expect(roster).toBeVisible();
    await expect(
      roster.getByRole("heading", { name: "Agent roster" }),
    ).toBeFocused();
    expectRoute(page, { project: "doughnut", view: "roster" });
    await expect(roster).toContainText(
      `Doughnut: agent profiles published at revision ${doughnut.revision.slice(0, 7)}.`,
    );

    await back.click();
    expectRoute(page, { project: "doughnut", view: null });
    await expectMembership(page, { taken: [doughnutStory], backlog: [] });
    await expect(stages).toBeFocused();
  });

  await test.step("unknown project route resolves to default project stories and normalizes URL", async () => {
    await page.goto("/?project=unknown-project&view=roster");
    await expect(page).toHaveURL(new URL("/", page.url()).href);
    const { project } = parts(page);
    await expect(project.getByRole("radio", { checked: true })).toHaveAttribute(
      "value",
      "open-dough",
    );
    await expect(rosterParts(page).roster).toHaveCount(0);
    await expectMembership(page, {
      taken: [takenStory],
      backlog: [queuedStory],
    });
  });

  await test.step("direct load of an unreadable project shows truthful failure on roster and stories", async () => {
    await expectDirectRosterFailure(page);
  });
});
