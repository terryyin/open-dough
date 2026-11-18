// Which project the dashboard selects after a project is removed, through
// the real configuration endpoint and its saved list: an unselected removal
// keeps the selection, and removing the selected project selects its next
// neighbor and reads that project. What removal keeps and writes is
// ./project-remove.spec.ts.
import { readFileSync } from "node:fs";
import type { ConfiguredProject } from "../../dashboard/server/projectConfiguration.ts";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import { projectAddMachine } from "../../dashboard/test-support/support/projectAddMachine.ts";
import { expectProjectChoice } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  back,
  removeProject,
  settings,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

test("direct settings reload knows the selected project; unselected removal preserves it and selected removal chooses the next neighbor", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?project=pygardon&view=settings`);
  await removeProject(page, "Doughnut");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Pygardon", exact: true }),
  ).toBeChecked();
  await settings(page).click();
  await page.reload();
  await removeProject(page, "Pygardon");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Terry Talks", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Pygardon", exact: true }),
  ).toHaveCount(0);
  await reloadUntilRead(page);
  await expect(
    page.getByRole("radio", { name: "Terry Talks", exact: true }),
  ).toBeChecked();
});

test("removing the first project selects its next neighbor and reads that project's actual repository", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  const file = fixture.configurationFile("preview");
  const beforeProjects = JSON.parse(
    readFileSync(file, "utf8"),
  ) as ConfiguredProject[];
  expect(beforeProjects.length).toBeGreaterThan(1);
  const [removed, nextProject] = beforeProjects as [
    ConfiguredProject,
    ConfiguredProject,
    ...ConfiguredProject[],
  ];
  await expect(
    page.getByRole("radio", { name: removed.label, exact: true }),
  ).toBeChecked();
  await settings(page).click();
  await removeProject(page, removed.label);
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: nextProject.label, exact: true }),
  ).toBeChecked();
  await expect(settings(page)).toBeFocused();
  await expectProjectChoice(page, nextProject.label);
  await expect
    .poll(() => server.ghCalls(), { timeout: 5_000 })
    .toContainEqual([
      "api",
      "--include",
      `repos/${nextProject.repository}/commits/${nextProject.ref}`,
      "--jq",
      ".sha",
    ]);
  expect(
    (JSON.parse(readFileSync(file, "utf8")) as ConfiguredProject[]).map(
      ({ id }) => id,
    ),
  ).toEqual(beforeProjects.slice(1).map(({ id }) => id));
});
