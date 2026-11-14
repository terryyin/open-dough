import {
  fileSource,
  sourceLineNumbers,
  sourceLineText,
  sourceFile,
} from "../tests/intentCodeBrowsePage.ts";
// System colour-scheme appearance for the dashboard frame and Intent source:
// dark Board/card/badge, Sessions, Side panel chrome, dialog, settings, focus,
// and recovery text stay readable; highlighted and plain source follow the
// preference without re-tokenization; light restores today's colours; reading
// state survives the change. No dashboard appearance switch.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { parts } from "../tests/dashboardPage.ts";
import {
  expectControlContrast,
  expectReadableContrast,
} from "../tests/accessibleReading.ts";
import {
  expectDarkSurface,
  expectFocusReadable,
  expectLightSurface,
  expectNoAppearanceSwitch,
  expectPrimaryControlReadable,
  setColorScheme,
} from "../tests/systemAppearanceReading.ts";
import { colourOf, sourceToken } from "../tests/pageColours.ts";
import { expectProjectChoice } from "../tests/projectChoice.ts";
import { settings } from "../tests/support/systemSettingsPage.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import { readyStory, notRefinedStory } from "../tests/launchJourney.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "../tests/intentPerspectivePage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { frontendRevision } from "../tests/support/frontendServiceState.ts";

const highlightedPath = "dashboard/tests/example.spec.ts";
const plainPath = "dashboard/checks/notes.check";
const highlightedSource = 'export const message = "hello";\n';
const plainSource = "plain recovery note\n";

test("the dashboard frame and Intent source follow the system appearance together", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, {
    files: {
      ...frontendServices.files,
      [highlightedPath]: highlightedSource,
      [plainPath]: plainSource,
    },
    locations: {
      revision: frontendRevision,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(highlightedPath)
          .please(),
        makeMe.anIntentLocation
          .at("dashboard/checks")
          .withSources({ include: ["**/*.check"] })
          .selecting(plainPath)
          .please(),
      ],
      recovery: undefined,
    },
  });

  await setColorScheme(page, "dark");
  await openFrontendTakenBacklog(page);
  const {
    board,
    backlog,
    taken,
    intentChoice,
    development,
    intent,
    preparationHelp,
  } = parts(page);

  await test.step("dark Board, cards, badges, and primary controls stay readable", async () => {
    await expectDarkSurface(page);
    await expectReadableContrast(
      board.getByRole("heading", { name: "Backlog", exact: true }),
    );
    await expectReadableContrast(
      taken.getByRole("heading", { name: "Taken", exact: true }),
    );
    await expectReadableContrast(
      backlog
        .getByRole("article", { name: readyStory, exact: true })
        .getByRole("heading"),
    );
    await expectReadableContrast(
      backlog
        .getByRole("article", { name: notRefinedStory, exact: true })
        .getByRole("heading"),
    );
    const start = page.getByRole("button", {
      name: "Start session in Open Dough",
    });
    await expectPrimaryControlReadable(start);
    await expectFocusReadable(page, start);
  });

  await test.step("Sessions sidebar and a launch dialog read on dark chrome", async () => {
    await page.getByRole("button", { name: "Sessions", exact: true }).click();
    const { sidebar } = sessionsSidebarParts(page);
    await expect(sidebar).toBeVisible();
    await expectReadableContrast(
      sidebar.getByRole("heading", { name: "Sessions", exact: true }),
    );
    await page.getByRole("button", { name: "Sessions", exact: true }).click();
    await expect(sidebar).toBeHidden();

    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectReadableContrast(dialog.getByRole("heading").first());
    await expectControlContrast(
      dialog.getByRole("button", { name: "Start", exact: true }),
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  await test.step("preparation legend and System settings stay readable", async () => {
    await preparationHelp.click();
    const legend = page.getByRole("dialog");
    await expect(
      legend.getByRole("heading", { name: "Preparation badges" }),
    ).toBeVisible();
    for (const label of [
      "Not refined",
      "Ready for execution",
      "Slice planned",
    ]) {
      await expectReadableContrast(legend.getByText(label, { exact: true }));
    }
    await page.keyboard.press("Escape");

    await settings(page).click();
    await expect(
      page.getByRole("heading", { name: "System settings", exact: true }),
    ).toBeVisible();
    await expectReadableContrast(
      page.getByRole("heading", { name: "System settings", exact: true }),
    );
    await expectNoAppearanceSwitch(page);
    await page.getByRole("button", { name: "Back to dashboard" }).click();
  });

  await test.step("Intent source highlights and plain text follow the scheme without losing place", async () => {
    await intentChoice.click();
    await expect(intent).toBeVisible();
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    await sourceFile(intent, highlightedPath).click();
    const source = fileSource(intent, highlightedPath);
    await expect(source).toContainText('export const message = "hello";');
    const exportToken = sourceToken(source, /^export$/);
    await expect(exportToken).toBeVisible();
    await expectReadableContrast(exportToken);
    await expectReadableContrast(sourceLineNumbers(source).first());
    const darkExport = await colourOf(exportToken);

    await expandIntentGroup(intent, "dashboard/checks");
    await expandIntentFolders(intent, "dashboard/checks");
    await sourceFile(intent, plainPath).click();
    const plain = fileSource(intent, plainPath);
    await expect(sourceLineText(plain)).toHaveText(plainSource.split("\n"));
    await expect(sourceLineText(plain).locator("span")).toHaveCount(0);
    await expectReadableContrast(sourceLineText(plain).first());

    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    await sourceFile(intent, highlightedPath).click();
    await expect(exportToken).toBeVisible();

    // Open Sessions (side panel) while Intent keeps the selected file, then
    // flip appearance both ways without losing project, perspective, or panel.
    await page.getByRole("button", { name: "Sessions", exact: true }).click();
    const { sidebar } = sessionsSidebarParts(page);
    await expect(sidebar).toBeVisible();
    await expect(intentChoice).toBeChecked();
    await expectProjectChoice(page, "Open Dough");

    await setColorScheme(page, "light");
    await expectLightSurface(page);
    const lightExport = await colourOf(exportToken);
    expect(lightExport).not.toBe(darkExport);
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(development).not.toBeChecked();
    await expect(intent).toBeVisible();
    await expect(sidebar).toBeVisible();
    await expectReadableContrast(
      sidebar.getByRole("heading", { name: "Sessions", exact: true }),
    );
    await expect(source).toContainText('export const message = "hello";');

    await setColorScheme(page, "dark");
    await expectDarkSurface(page);
    expect(await colourOf(exportToken)).toBe(darkExport);
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(development).not.toBeChecked();
    await expect(intent).toBeVisible();
    await expect(sidebar).toBeVisible();
    await expectReadableContrast(
      sidebar.getByRole("heading", { name: "Sessions", exact: true }),
    );
    await expect(source).toContainText('export const message = "hello";');
    await expectNoAppearanceSwitch(page);
  });
});
