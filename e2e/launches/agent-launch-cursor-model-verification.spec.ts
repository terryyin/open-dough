import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";

test("Start execution explains that Cursor sign-in failed during model verification", async ({
  page,
  origin,
  cursor,
}) => {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const start = card.getByRole("button", { name: "Start execution" });
  await start.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await dialog.getByRole("combobox", { name: "Model" }).selectOption("gpt-5.2");
  cursor.listModels(
    undefined,
    "Error: Authentication required. Run 'agent login'.\nPrivate diagnostic from Cursor.\n",
  );
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(card).toContainText(
    "Launch failed: Cursor model choices could not be verified. Cursor CLI requires sign-in. Run cursor-agent login, then retry. Nothing was launched.",
  );
  await expect(card).not.toContainText("Private diagnostic from Cursor.");
  await expect(start).toBeEnabled();
  expect(cursor.modelReads()).toHaveLength(2);
  expect(cursor.calls()).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
});
