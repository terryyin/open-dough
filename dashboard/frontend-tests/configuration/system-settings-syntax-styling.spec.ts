// Syntax styling settings against controlled settings answers: General shows
// Off and Default, and keeps the saved choice after a refused save the way
// terminal theme does. Persistence across reload is
// ../../../e2e/configuration/system-settings-syntax-styling.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../tests/support/frontendSettingsSubstitutes.ts";
import {
  chooseSyntaxStyling,
  expectSyntaxStylingShown,
  syntaxStylingChoice,
  syntaxStylingSection,
} from "../../tests/support/syntaxStylingSettingsPage.ts";
import { readSetting } from "../../tests/support/settingsTouchPage.ts";
import { syntaxStylingSaveEndpoint } from "../../src/syntaxStylingSetting.ts";

test("System settings General shows Off and Default for syntax styling and keeps the saved choice after a refused save", async ({
  page,
  frontendServices,
}) => {
  const answers = await installFrontendSettingsSubstitutes(
    page,
    frontendServices,
    { projects: productionSeedProjects },
  );
  await page.goto("/?view=settings");
  const styling = syntaxStylingSection(page);
  await expect(styling).toBeVisible();
  await expect(
    styling.getByText(
      /Intent source reading and story-review diffs use shared syntax colours/,
    ),
  ).toBeVisible();
  await expect(syntaxStylingChoice(page).locator("option")).toHaveText([
    "Off",
    "Default",
  ]);
  await expectSyntaxStylingShown(page, "Default");
  await chooseSyntaxStyling(page, "Off");
  answers.refuseNext(
    syntaxStylingSaveEndpoint,
    503,
    "The syntax styling could not be saved. Check the dashboard folder permissions and retry; the previous setting was kept.",
  );
  await syntaxStylingChoice(page).selectOption({ label: "Default" });
  await expect(styling.getByRole("alert")).toContainText("could not be saved");
  await expectSyntaxStylingShown(page, "Off");
  await readSetting(styling.getByRole("alert"));
  await styling.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(styling.getByRole("alert")).toHaveCount(0);
  await expect(syntaxStylingChoice(page)).toBeEnabled();
  await expectSyntaxStylingShown(page, "Default");
  expect(answers.changes).toEqual([
    {
      endpoint: syntaxStylingSaveEndpoint,
      body: { styling: "off" },
    },
    { endpoint: syntaxStylingSaveEndpoint, body: { styling: "default" } },
    { endpoint: syntaxStylingSaveEndpoint, body: { styling: "default" } },
  ]);
});
