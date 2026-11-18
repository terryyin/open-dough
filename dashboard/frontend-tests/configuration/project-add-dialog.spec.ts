// The Add project dialog against controlled settings answers: a refusal stays
// linked to its field with both inputs kept, and dismissal posts nothing.
// What the server refuses, and that a refusal writes nothing and reads no
// GitHub repository, is ../../backend-tests/configuration/project-add-validation.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../test-support/support/frontendSettingsSubstitutes.ts";
import {
  back,
  settings,
} from "../../test-support/support/systemSettingsPage.ts";
import { projectAddEndpoint } from "../../src/projectConfiguration.ts";

const githubUrl = "https://github.com/example/sample-app";
const localPath = "~/work/private-checkout";

test("origin mismatch stays linked to the path, retains both inputs and saves nothing", async ({
  page,
  frontendServices,
}) => {
  const answers = await installFrontendSettingsSubstitutes(
    page,
    frontendServices,
    { projects: productionSeedProjects },
  );
  const refusal = `The origin of ${localPath} is another/different, but the GitHub URL names example/sample-app.`;
  answers.refuseNext(projectAddEndpoint, 400, refusal, "localPath");
  await page.goto("/");
  await settings(page).click();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "Add project",
    exact: true,
  });
  const url = dialog.getByRole("textbox", { name: "GitHub URL" });
  const folder = dialog.getByRole("textbox", { name: "Local path" });
  await url.fill(githubUrl);
  await folder.fill(localPath);
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  const reason = dialog.getByRole("alert");
  await expect(reason).toHaveText(refusal);
  await expect(dialog).toBeVisible();
  await expect(url).toHaveValue(githubUrl);
  await expect(folder).toHaveValue(localPath);
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
  expect(answers.changes).toEqual([
    { endpoint: projectAddEndpoint, body: { githubUrl, localPath } },
  ]);
});

test("Cancel and Escape save nothing, return focus and keep project arrows inside the modal", async ({
  page,
  frontendServices,
}) => {
  const answers = await installFrontendSettingsSubstitutes(
    page,
    frontendServices,
    { projects: productionSeedProjects },
  );
  await page.goto("/");
  await settings(page).click();
  const button = page.getByRole("button", {
    name: "Add project",
    exact: true,
  });
  await expect(button).toBeEnabled();
  for (const dismissal of ["Escape", "Cancel"] as const) {
    await button.click();
    const dialog = page.getByRole("dialog", {
      name: "Add project",
      exact: true,
    });
    await dialog.getByRole("textbox", { name: "GitHub URL" }).fill(githubUrl);
    await dialog.getByRole("textbox", { name: "Local path" }).fill(localPath);
    await dialog.getByRole("button", { name: "Cancel" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(
      page.getByRole("radio", {
        name: "Open Dough",
        exact: true,
        includeHidden: true,
      }),
    ).toBeChecked();
    if (dismissal === "Escape") await page.keyboard.press("Escape");
    else await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
    expect(answers.changes).toEqual([]);
  }
});
