// Hiding a project through the real visibility endpoint: the hidden flag is
// saved per mode and survives restart. Selection around hidden projects is
// ../../dashboard/frontend-tests/configuration/project-hide-selection.spec.ts.
import { readFileSync } from "node:fs";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import { projectAddMachine } from "../../dashboard/test-support/support/projectAddMachine.ts";
import { addProjectOnPage } from "../../dashboard/test-support/support/projectAddPage.ts";
import {
  expectCompactProjectSelect,
  expectProjectChoice,
  expectVisibleProjectLabels,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
  untilPublishedWorkRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  back,
  hideButton,
  projectRow,
  removeButton,
  removeDialog,
  settings,
  showButton,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";
import { projectVisibilityPage } from "./project-hide-page.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const visibleWithoutDoughnut = ["Open Dough", "Pygardon", "Terry Talks"];
const allSeededLabels = ["Open Dough", "Doughnut", "Pygardon", "Terry Talks"];
const readSaved = (mode: "dev" | "preview") =>
  JSON.parse(readFileSync(fixture.configurationFile(mode), "utf8")) as Record<
    string,
    unknown
  >[];

test("hiding a project removes it from tabs, compact selector and cycling while keeping its settings row, saved inventory entry and Remove confirmation, and showing restores it", async ({
  page,
}) => {
  let server = await fixture.start("preview");
  const initialSaved = readSaved("preview");
  for (const entry of initialSaved) {
    expect(entry).not.toHaveProperty("hidden");
  }

  await openUntilRead(page, server.baseURL);
  await expectVisibleProjectLabels(page, allSeededLabels);
  await settings(page).click();

  const doughnutRow = projectRow(page, "Doughnut");
  await expect(doughnutRow).toHaveAttribute(
    "data-project-visibility",
    "visible",
  );
  await expect(doughnutRow).not.toContainText("Hidden from dashboard");

  await hideButton(page, "Doughnut").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(doughnutRow).toHaveAttribute(
    "data-project-visibility",
    "hidden",
  );
  await expect(doughnutRow).toContainText("Hidden from dashboard");
  await expect(showButton(page, "Doughnut")).toBeVisible();
  await expect(hideButton(page, "Doughnut")).toHaveCount(0);

  await removeButton(page, "Doughnut").click();
  const removal = removeDialog(page, "Doughnut");
  await expect(removal).toBeVisible();
  await removal.getByRole("button", { name: "Cancel" }).click();
  await expect(removal).toBeHidden();
  await expect(doughnutRow).toBeVisible();

  const afterHideSaved = readSaved("preview");
  expect(afterHideSaved).toEqual(
    initialSaved.map((entry) =>
      entry["id"] === "doughnut" ? { ...entry, hidden: true } : entry,
    ),
  );

  await back(page).click();
  await expectProjectChoice(page, "Open Dough");
  await expect(page.getByRole("radio", { name: "Doughnut" })).toHaveCount(0);
  await expectVisibleProjectLabels(page, visibleWithoutDoughnut);

  await page.keyboard.press("ArrowRight");
  await expectProjectChoice(page, "Pygardon");
  await page.keyboard.press("ArrowLeft");
  await expectProjectChoice(page, "Open Dough");

  await page.setViewportSize({ width: 390, height: 844 });
  await expectCompactProjectSelect(page, "Open Dough", visibleWithoutDoughnut);
  await page.setViewportSize({ width: 1280, height: 720 });

  await reloadUntilRead(page);
  await expectVisibleProjectLabels(page, visibleWithoutDoughnut);
  await fixture.stop(server);
  server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expectVisibleProjectLabels(page, visibleWithoutDoughnut);
  const links =
    await test.step("Given I have a separate tab for fresh links", () =>
      projectVisibilityPage(page).openSeparateTab());
  const development =
    await test.step("When I follow a Development link to the hidden project", () =>
      links.openProjectLink(`${server.baseURL}/?project=doughnut`));
  await test.step("Then Open Dough opens in Development", () =>
    development.showsProject("Open Dough", `${server.baseURL}/`));
  const intent =
    await test.step("When I follow an Intent link to the hidden project", () =>
      links.openProjectLink(
        `${server.baseURL}/?project=doughnut&perspective=intent`,
      ));
  await test.step("Then Open Dough opens in Intent", () =>
    intent.showsProject("Open Dough", `${server.baseURL}/?perspective=intent`));
  await test.step("And I close the separate tab", () => links.close());

  await settings(page).click();
  await showButton(page, "Doughnut").click();
  await expect(doughnutRow).toHaveAttribute(
    "data-project-visibility",
    "visible",
  );
  await expect(doughnutRow).not.toContainText("Hidden from dashboard");
  await expect(hideButton(page, "Doughnut")).toBeVisible();
  expect(readSaved("preview")).toEqual(initialSaved);

  await back(page).click();
  await expectVisibleProjectLabels(page, allSeededLabels);
  await page.keyboard.press("ArrowRight");
  await expectProjectChoice(page, "Doughnut");
  await untilPublishedWorkRead(page);
  await expect(
    page.getByRole("region", { name: "Taken", exact: true }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Intent", exact: true }).check();
  await expect(
    page.getByRole("radio", { name: "Intent", exact: true }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "Development", exact: true }).check();
  await page.setViewportSize({ width: 390, height: 844 });
  await expectCompactProjectSelect(page, "Doughnut");
});

test("development visibility stays separate from production configuration", async ({
  page,
}) => {
  const devServer = await fixture.start("dev");
  await page.goto(devServer.baseURL);
  await addProjectOnPage(page);
  await settings(page).click();
  await hideButton(page, "Sample App").click();
  await back(page).click();
  await expect(
    page.getByRole("heading", { name: "All projects are hidden", exact: true }),
  ).toBeVisible();
  const visibility =
    await test.step("When I follow an Intent link with every project hidden", () =>
      projectVisibilityPage(page).openLink(
        `${devServer.baseURL}/?project=sample-app&perspective=intent`,
      ));
  await test.step("Then the dashboard shows that all projects are hidden", () =>
    visibility.showsAllHidden(`${devServer.baseURL}/`));
  expect(readSaved("dev")).toMatchObject([{ id: "sample-app", hidden: true }]);
  await fixture.stop(devServer);

  const prodServer = await fixture.start("preview");
  await openUntilRead(page, prodServer.baseURL);
  await expectVisibleProjectLabels(page, allSeededLabels);
  for (const entry of readSaved("preview")) {
    expect(entry).not.toHaveProperty("hidden");
  }
});
