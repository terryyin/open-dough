import { filesColumn } from "../intentModePage.ts";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { projectAddMachine } from "../support/projectAddMachine.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { identity } from "../agentLaunchBoundary.ts";
import { terminalPanel } from "../terminalScreenPage.ts";
import {
  chooseProject,
  expectCompactProjectSelect,
  expectProjectChoice,
  parts,
} from "../dashboardPage.ts";
import { machineHome } from "../machineLaunchRecords.ts";
import { keepLaunchStore } from "../support/launchStore.ts";
import { chooseStoryTab } from "../support/intentStoryPage.ts";
import { openUntilRead, untilPublishedWorkRead } from "../pageRequestNotes.ts";
import {
  openSessionsSidebar,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
import {
  back,
  hideButton,
  settings,
  showButton,
} from "../support/systemSettingsPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const visibleWithoutDoughnut = ["Open Dough", "Pygardon", "Terry Talks"];
const allSeededLabels = ["Open Dough", "Doughnut", "Pygardon", "Terry Talks"];

test("opening a hidden project's session from the Sessions sidebar attaches its terminal without restoring the project to selection chrome or showing its Board or Intent until shown again in settings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 720 });
  const doughnutFolder = path.join(fixture.machine, "home/git/doughnut");
  mkdirSync(doughnutFolder, { recursive: true });
  const server = await fixture.start("preview");
  const sessionTitle = "Retained Doughnut session";
  const sessionName = `Doughnut · Execution · ${sessionTitle}`;
  const sessionId = server.claudeListsSession({
    name: sessionName,
    cwd: doughnutFolder,
    startedAt: Date.now(),
  });
  const shortId = sessionId.slice(0, 8);
  keepLaunchStore(machineHome(fixture.machine), {
    doughnut: [
      makeMe.aLaunchRecord
        .executing({ identity, title: sessionTitle, source: "doughnut" })
        .inClaudeSession({ sessionId, shortId })
        .launchedAt(new Date().toISOString())
        .please(),
    ],
  });

  await openUntilRead(page, server.baseURL);
  await chooseProject(page, "Doughnut");
  await untilPublishedWorkRead(page);
  const taken = page.getByRole("region", { name: "Taken", exact: true });
  await expect(taken).toContainText(sessionTitle, { timeout: 5_000 });

  await openSessionsSidebar(page);
  const { sidebar, entry } = sessionsSidebarParts(page);
  await expect(sidebar).toContainText(sessionTitle);
  await expect(entry(sessionTitle)).toBeVisible();

  await settings(page).click();
  await hideButton(page, "Doughnut").click();
  await expect(showButton(page, "Doughnut")).toBeVisible();
  await back(page).click();
  await untilPublishedWorkRead(page);

  const tabs = parts(page).project.locator("label");
  await expectProjectChoice(page, "Pygardon");
  await expect(tabs).toHaveText(visibleWithoutDoughnut);
  await expect(taken).not.toContainText(sessionTitle);
  await expect(sidebar).toContainText(sessionTitle);
  await expect(entry(sessionTitle)).toBeVisible();

  const terminal = terminalPanel(page);
  await entry(sessionTitle).click();
  await expect(
    terminal.getByRole("heading", { name: sessionTitle, exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => server.claudeAttaches().map((attach) => attach.id))
    .toContain(shortId);
  await expect(entry(sessionTitle)).toHaveAttribute("aria-current", "true");

  await expect(page.getByRole("radio", { name: "Doughnut" })).toHaveCount(0);
  await expect(tabs).toHaveText(visibleWithoutDoughnut);
  await expectProjectChoice(page, "Pygardon");
  await expect(page).toHaveURL(`${server.baseURL}/?project=pygardon`);
  await expect(parts(page).board).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Start session in Pygardon",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Start session in Doughnut",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(taken).not.toContainText(sessionTitle);

  await settings(page).focus();
  await page.keyboard.press("ArrowRight");
  await expectProjectChoice(page, "Terry Talks");
  await page.keyboard.press("ArrowLeft");
  await expectProjectChoice(page, "Pygardon");

  await page.setViewportSize({ width: 1000, height: 720 });
  await expectCompactProjectSelect(page, "Pygardon", visibleWithoutDoughnut);
  await page.setViewportSize({ width: 1600, height: 720 });

  await terminal.getByRole("button", { name: "Close", exact: true }).click();
  await expect(terminal).toHaveCount(0);

  await page.getByRole("radio", { name: "Intent", exact: true }).check();
  const intentMain = page.getByRole("main", { name: "Intent", exact: true });
  await expect(intentMain).toContainText(
    "Intent locations for Pygardon could not be read.",
  );
  await expect(intentMain).not.toContainText("Doughnut");

  await entry(sessionTitle).click();
  await expect(
    terminal.getByRole("heading", { name: sessionTitle, exact: true }),
  ).toBeVisible();
  await expect.poll(() => server.claudeAttaches()).toHaveLength(2);
  await expect(page.getByRole("radio", { name: "Doughnut" })).toHaveCount(0);
  await expect(tabs).toHaveText(visibleWithoutDoughnut);
  await expectProjectChoice(page, "Pygardon");
  await expect(page).toHaveURL(
    `${server.baseURL}/?project=pygardon&perspective=intent`,
  );
  await expect(intentMain).toContainText(
    "Intent locations for Pygardon could not be read.",
  );
  await expect(intentMain).not.toContainText("Doughnut");
  await expect(parts(page).board).toBeHidden();

  await settings(page).click();
  await showButton(page, "Doughnut").click();
  await back(page).click();

  await expect(tabs).toHaveText(allSeededLabels);
  await chooseProject(page, "Doughnut");
  await expectProjectChoice(page, "Doughnut");
  await expect(intentMain).toHaveAttribute("data-selected-story", identity);
  await chooseStoryTab(intentMain, "Changed tests");
  await expect(
    intentMain.getByRole("tabpanel", { name: "Changed tests", exact: true }),
  ).toContainText(
    "The story's historical Intent locations and test source are unavailable: its landed result could not be established.",
  );
  await expect(filesColumn(intentMain)).toHaveCount(0);
  await entry(sessionTitle).click();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Doughnut");
  await expect(taken).toContainText(sessionTitle);
});
