// Which project the dashboard selects after a project is removed, through
// the real configuration endpoint and its saved list: an unselected removal
// keeps the selection, and removing the selected project selects its next
// neighbor and reads that project. What removal keeps and writes is
// ./project-remove.spec.ts.
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { projectAddMachine } from "../../dashboard/tests/support/projectAddMachine.ts";
import { expectProjectChoice } from "../../dashboard/tests/dashboardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/tests/pageRequestNotes.ts";
import {
  back,
  confirmRemoval,
  removeButton,
  settings,
} from "../../dashboard/tests/support/systemSettingsPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const remove = async (page: Page, label: string) => {
  await removeButton(page, label).click();
  await confirmRemoval(page, label);
};

test("direct settings reload knows the selected project; unselected removal preserves it and selected removal chooses the next neighbor", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?project=pygardon&view=settings`);
  await remove(page, "Doughnut");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Pygardon", exact: true }),
  ).toBeChecked();
  await settings(page).click();
  await page.reload();
  await remove(page, "Pygardon");
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
  await expect(
    page.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await settings(page).click();
  await remove(page, "Open Dough");
  await back(page).click();
  const next = page.getByRole("radio", { name: "Doughnut", exact: true });
  await expect(next).toBeChecked();
  await expect(settings(page)).toBeFocused();
  await expectProjectChoice(page, "Doughnut");
  await expect
    .poll(() => server.ghCalls(), { timeout: 5_000 })
    .toContainEqual([
      "api",
      "--include",
      "repos/nerds-odd-e/doughnut/commits/main",
      "--jq",
      ".sha",
    ]);
  expect(
    (
      JSON.parse(
        readFileSync(fixture.configurationFile("preview"), "utf8"),
      ) as { id: string }[]
    ).map(({ id }) => id),
  ).toEqual(["doughnut", "pygardon", "terry-talks"]);
});
