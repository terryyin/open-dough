import { readFileSync } from "node:fs";
import { expect, test } from "../support/pageTest.ts";
import { projectAddMachine } from "../support/projectAddMachine.ts";
import { addProjectOnPage } from "../support/projectAddPage.ts";
import {
  chooseProject,
  expectCompactProjectSelect,
  expectProjectChoice,
  parts,
} from "../dashboardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
  untilPublishedWorkRead,
} from "../pageRequestNotes.ts";
import {
  back,
  hideButton,
  projectRow,
  removeButton,
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
  const tabs = parts(page).project.locator("label");
  await expect(parts(page).project.getByRole("radio")).toHaveCount(4);
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
  const removeDialog = page.getByRole("dialog", {
    name: "Remove Doughnut?",
    exact: true,
  });
  await expect(removeDialog).toBeVisible();
  await removeDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(removeDialog).toBeHidden();
  await expect(doughnutRow).toBeVisible();

  const afterHideSaved = readSaved("preview");
  expect(afterHideSaved).toEqual(
    initialSaved.map((entry) =>
      entry["id"] === "doughnut" ? { ...entry, hidden: true } : entry,
    ),
  );

  await back(page).click();
  await expect(page.getByRole("radio", { name: "Open Dough" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Doughnut" })).toHaveCount(0);
  await expect(tabs).toHaveText(visibleWithoutDoughnut);

  await page.keyboard.press("ArrowRight");
  await expectProjectChoice(page, "Pygardon");
  await page.keyboard.press("ArrowLeft");
  await expectProjectChoice(page, "Open Dough");

  await page.setViewportSize({ width: 390, height: 844 });
  await expectCompactProjectSelect(page, "Open Dough", visibleWithoutDoughnut);
  await page.setViewportSize({ width: 1280, height: 720 });

  await reloadUntilRead(page);
  await expect(tabs).toHaveText(visibleWithoutDoughnut);
  await fixture.stop(server);
  server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(tabs).toHaveText(visibleWithoutDoughnut);

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
  await expect(tabs).toHaveText(allSeededLabels);
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

test("hiding the selected project selects another visible project, hiding all projects shows no Board or Intent while keeping settings usable, and deep links or prior history to a hidden project do not present it", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  const allHidden = page.getByRole("heading", {
    name: "All projects are hidden",
    exact: true,
  });
  const taken = page.getByRole("region", { name: "Taken", exact: true });
  await openUntilRead(page, server.baseURL);
  await chooseProject(page, "Open Dough");
  await chooseProject(page, "Doughnut");

  await settings(page).click();
  await hideButton(page, "Doughnut").click();
  await back(page).click();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Pygardon");
  await expect(page).toHaveURL(`${server.baseURL}/?project=pygardon`);

  await page.goBack();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Open Dough");
  await expect(page.getByRole("radio", { name: "Doughnut" })).toHaveCount(0);

  await openUntilRead(page, `${server.baseURL}/?project=doughnut`);
  await expectProjectChoice(page, "Open Dough");
  await expect(page).toHaveURL(`${server.baseURL}/`);

  await openUntilRead(
    page,
    `${server.baseURL}/?project=doughnut&perspective=intent`,
  );
  await expectProjectChoice(page, "Open Dough");
  await expect(page).toHaveURL(`${server.baseURL}/?perspective=intent`);

  await settings(page).click();
  for (const label of visibleWithoutDoughnut) {
    await hideButton(page, label).click();
    await expect(showButton(page, label)).toBeVisible();
  }
  await expect(
    page.getByText("No projects configured. Add a project to get started."),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Projects", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(4);

  await back(page).click();
  await expect(allHidden).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(taken).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Backlog list", exact: true }),
  ).toHaveCount(0);
  await expect(settings(page)).toBeFocused();

  await page.goto(`${server.baseURL}/?project=open-dough&perspective=intent`);
  await expect(allHidden).toBeVisible();
  await expect(page).toHaveURL(`${server.baseURL}/`);
  await expect(taken).toHaveCount(0);

  await settings(page).click();
  await showButton(page, "Pygardon").click();
  await back(page).click();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Pygardon");
  await expect(taken).toBeVisible();
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
  expect(readSaved("dev")).toMatchObject([{ id: "sample-app", hidden: true }]);
  await fixture.stop(devServer);

  const prodServer = await fixture.start("preview");
  await openUntilRead(page, prodServer.baseURL);
  await expect(parts(page).project.getByRole("radio")).toHaveCount(4);
  for (const entry of readSaved("preview")) {
    expect(entry).not.toHaveProperty("hidden");
  }
});
