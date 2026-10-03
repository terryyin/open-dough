// The form posts to the real server; real Git supplies the mismatching origin.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "./support/pageTest.ts";
import { settings, back } from "./support/systemSettingsPage.ts";
import {
  addedLocalPath,
  addedRepository,
  projectAddMachine,
} from "./support/projectAddMachine.ts";

test("origin mismatch stays linked to the path, retains both inputs and saves nothing", async ({
  page,
}) => {
  const fixture = projectAddMachine();
  try {
    execFileSync("git", [
      "-C",
      fixture.checkout,
      "remote",
      "set-url",
      "origin",
      "git@github.com:another/different.git",
    ]);
    const server = await fixture.start("preview");
    await page.goto(server.baseURL);
    await settings(page).click();
    await page
      .getByRole("button", { name: "Add project", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Add project",
      exact: true,
    });
    const url = dialog.getByRole("textbox", { name: "GitHub URL" });
    const folder = dialog.getByRole("textbox", { name: "Local path" });
    const githubUrl = `https://github.com/${addedRepository}`;
    await url.fill(githubUrl);
    await folder.fill(addedLocalPath);
    const bytes = readFileSync(fixture.configurationFile("preview"), "utf8");
    await dialog.getByRole("button", { name: "Add", exact: true }).click();
    const reason = dialog.getByRole("alert");
    await expect(reason).toHaveText(
      `The origin of ${addedLocalPath} is another/different, but the GitHub URL names ${addedRepository}.`,
    );
    await expect(dialog).toBeVisible();
    await expect(url).toHaveValue(githubUrl);
    await expect(folder).toHaveValue(addedLocalPath);
    await expect(folder).toHaveAttribute("aria-invalid", "true");
    await expect(folder).toHaveAttribute(
      "aria-describedby",
      (await reason.getAttribute("id")) ?? "missing-alert-id",
    );
    await expect(folder).toHaveAccessibleDescription(await reason.innerText());
    await expect(url).toHaveAttribute("aria-invalid", "false");
    await expect(
      dialog.getByRole("button", { name: "Add", exact: true }),
    ).toBeEnabled();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await back(page).click();
    await expect(
      page.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Sample App", exact: true }),
    ).toHaveCount(0);
    expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
      bytes,
    );
    expect(
      server
        .ghCalls()
        .some((call) => call.includes(`repos/${addedRepository}`)),
    ).toBe(false);
  } finally {
    await fixture.close();
  }
});
