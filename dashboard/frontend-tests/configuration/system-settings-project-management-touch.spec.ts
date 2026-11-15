// Touch project editing, against controlled settings answers, retains its
// draft and explicit recovery while the viewport changes and a save is
// refused. That a failed write keeps the saved file byte for byte, and an Add
// saves the repository's default branch, are
// ../../../e2e/configuration/project-add.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../tests/support/frontendSettingsSubstitutes.ts";
import {
  projectAddEndpoint,
  projectRemoveEndpoint,
} from "../../src/projectConfiguration.ts";
import { tapWhereShown } from "../../tests/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../tests/touchLaunchPage.ts";
import { readSetting } from "../../tests/support/settingsTouchPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} project settings editing`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch edits at reduced height and retries a refused save with the exact draft", async ({
    page,
    frontendServices,
  }) => {
    const answers = await installFrontendSettingsSubstitutes(
      page,
      frontendServices,
      {
        projects: productionSeedProjects,
        adding: makeMe.aPublishedSource
          .with({
            id: "sample-app",
            label: "Sample App",
            repository: "example/sample-app",
          })
          .please(),
      },
    );
    await page.goto("/?view=settings");
    const addProject = page.getByRole("button", {
      name: "Add project",
      exact: true,
    });
    const dialog = page.getByRole("dialog", {
      name: "Add project",
      exact: true,
    });
    const url = dialog.getByRole("textbox", {
      name: "GitHub URL",
      exact: true,
    });
    const local = dialog.getByRole("textbox", {
      name: "Local path",
      exact: true,
    });
    const repository = "https://github.com/example/sample-app";
    const checkout = "~/work/private-checkout";
    await tapWhereShown(addProject);
    await expect(url).toBeFocused();
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await url.scrollIntoViewIfNeeded();
    await tapWhereShown(url);
    await url.pressSequentially(repository);
    await local.scrollIntoViewIfNeeded();
    await tapWhereShown(local);
    await local.fill(checkout);
    await page.setViewportSize(landscape);
    await expect(url).toHaveValue(repository);
    await expect(local).toHaveValue(checkout);
    await page.setViewportSize({ width: portrait.width, height: 320 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    // A long single-line input scrolls its own value, as on desktop; the
    // dialog and its ordinary reading body must still fit the page.
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await dialog
        .locator(".launch-dialog-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    // Cancel and a failed removal: ../../../e2e/configuration/project-remove.spec.ts.
    await local.scrollIntoViewIfNeeded();
    await tapWhereShown(local);
    await expect(local).toBeFocused();
    expect(answers.changes).toEqual([]);
    answers.refuseNext(
      projectAddEndpoint,
      503,
      "EACCES: permission denied, open '~/.open-dough/dashboard/projects-production.json.tmp'",
    );
    await tapWhereShown(
      dialog.getByRole("button", { name: "Add", exact: true }),
    );
    await expect(dialog.getByRole("alert")).toBeVisible();
    await readSetting(dialog.getByRole("alert"));
    await expect(url).toHaveValue(repository);
    await expect(local).toHaveValue(checkout);
    await page.setViewportSize(landscape);
    await expect(url).toHaveValue(repository);
    await expect(local).toHaveValue(checkout);
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await tapWhereShown(
      dialog.getByRole("button", { name: "Add", exact: true }),
    );
    await expect(dialog).toBeHidden();
    const row = page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Sample App", exact: true }),
    });
    await readSetting(row.locator("dd").last());
    const removeProject = row.getByRole("button", {
      name: "Remove project Sample App",
      exact: true,
    });
    const removal = page.getByRole("dialog", {
      name: "Remove Sample App?",
      exact: true,
    });
    // Project settings continue below the facts; scroll to their actions
    // before observing and tapping the Remove target at its shown position.
    await removeProject.scrollIntoViewIfNeeded();
    await tapWhereShown(removeProject);
    await tapWhereShown(
      removal.getByRole("button", { name: "Remove", exact: true }),
    );
    await expect(removal).toBeHidden();
    // The refused and retried Add carried the exact draft; nothing but the
    // project list changed.
    const added = { githubUrl: repository, localPath: checkout };
    expect(answers.changes).toEqual([
      { endpoint: projectAddEndpoint, body: added },
      { endpoint: projectAddEndpoint, body: added },
      { endpoint: projectRemoveEndpoint, body: { id: "sample-app" } },
    ]);
  });
});
