import {
  filesToggle,
  expectFilesShown,
} from "../../test-support/intentModePage.ts";
import {
  expectReadingOffset,
  scrollIntentReadingHalfway,
} from "../../test-support/intentReadingPlacePage.ts";
import { putFrontendIntentSources } from "../../test-support/support/frontendIntentSources.ts";
import { answerFrontendIntentCi } from "../../test-support/support/frontendIntentCi.ts";
// Configured Java/JUnit source uses Intent's existing browser and Purpose/Proof
// reader, alongside another test type, without requiring Java CI evidence.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts, shortRevision } from "../../test-support/dashboardPage.ts";
import {
  fileSource,
  sourceFile,
  sourceLineNumbers,
  sourceLineText,
  sourceRevision,
} from "../../test-support/intentCodeBrowsePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  proofRegion,
} from "../../test-support/intentPerspectivePage.ts";
import {
  colourOf,
  expectKeywordAndStringColours,
  sourceToken,
} from "../../test-support/pageColours.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import { doughnut } from "../../test-support/intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { failGrammar } from "../../test-support/support/syntaxGrammar.ts";

test("Intent lists configured nested JUnit source, reads exact pinned Java with line numbers and theme styling, and shares Purpose/Proof with other source", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const javaPath = "backend/src/test/java/com/example/CalculatorTest.java";
  const javaText = `package com.example;
import org.junit.jupiter.api.Test;
class CalculatorTest {
  @Test void adds() { String expected = "two"; }
}
`;
  const shellText = '#!/usr/bin/env bash\necho "ok"\n';
  const locations = [
    makeMe.anIntentLocation
      .at("backend/src/test/java")
      .ofKind("java", ["**/*Test.java"])
      .selecting(javaPath)
      .please(),
    makeMe.anIntentLocation
      .at("scripts")
      .ofKind("shell")
      .selecting("scripts/check.sh")
      .please(),
  ];
  putFrontendIntentSources(frontendServices, doughnut, locations, {
    [javaPath]: javaText,
    "backend/src/test/java/com/example/Fixture.java": "class Fixture {}\n",
    "scripts/check.sh": shellText,
  });
  await answerFrontendIntentCi(page, doughnut.revision);
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "backend/src/test/java");
  await expandIntentFolders(intent, "backend/src/test/java");
  await expect(sourceFile(intent, javaPath)).toBeVisible();
  await expect(
    sourceFile(intent, "backend/src/test/java/com/example/Fixture.java"),
  ).toHaveCount(0);
  await sourceFile(intent, javaPath).click();
  const source = fileSource(intent, javaPath);
  await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(sourceLineText(source)).toHaveText(javaText.split("\n"));
  await expect(sourceLineNumbers(source)).toHaveText([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
  await expect(sourceRevision(intent, javaPath)).toContainText(
    `at revision ${shortRevision(doughnut.revision)}`,
  );
  await expectKeywordAndStringColours(source, /^class$/, /^"two"$/);
  // GitHub high-contrast palettes; light mixes 75% token with 25% --text.
  await page.emulateMedia({ colorScheme: "light" });
  expect(await colourOf(sourceToken(source, /^class$/))).toBe(
    "color(srgb 0.49902 0.0784314 0.117647)",
  );
  expect(await colourOf(sourceToken(source, /^"two"$/))).toBe(
    "color(srgb 0.0372549 0.137255 0.317647)",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await colourOf(sourceToken(source, /^class$/))).toBe(
    "rgb(255, 148, 146)",
  );
  expect(await colourOf(sourceToken(source, /^"two"$/))).toBe(
    "rgb(173, 220, 255)",
  );
  await expect(sourceLineText(source)).toHaveText(javaText.split("\n"));

  await page.setViewportSize({ width: 1280, height: 280 });
  const offset = await scrollIntentReadingHalfway(intent);
  expect(offset).toBeGreaterThan(0);
  await parts(page).development.click();
  await parts(page).intentChoice.click();
  await expect(sourceFile(intent, javaPath)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectReadingOffset(intent, offset);
  await filesToggle(intent).press("Enter");
  await expectFilesShown(intent, false);
  await expect(sourceLineText(source)).toHaveText(javaText.split("\n"));
  await expectReadingOffset(intent, offset);
  await filesToggle(intent).press("Space");
  await expectFilesShown(intent, true);
  await expect(sourceLineNumbers(source)).toHaveText([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
  await expectReadingOffset(intent, offset);
  expect(await colourOf(sourceToken(source, /^class$/))).toBe(
    "rgb(255, 148, 146)",
  );
  expect(await colourOf(sourceToken(source, /^"two"$/))).toBe(
    "rgb(173, 220, 255)",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toContainText(
    "No result of the selected check was found in the readable history",
  );
  await expect(proofRegion(intent).getByRole("table")).toHaveCount(0);
  await fileReadingTab(intent, "Purpose").click();
  await expect(sourceLineText(source)).toHaveText(javaText.split("\n"));
  await expandIntentGroup(intent, "scripts");
  await sourceFile(intent, "scripts/check.sh").click();
  const shell = fileSource(intent, "scripts/check.sh");
  await expect(sourceLineText(shell)).toHaveText(shellText.split("\n"));
  await expectKeywordAndStringColours(shell, /^echo$/, /^"ok"$/);
  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toContainText(
    "No result of the selected check was found in the readable history",
  );
});

test("a failed Java grammar load leaves configured source readable as exact plain text", async ({
  page,
  frontendServices,
}) => {
  const text = 'class Examples { String value = "still readable"; }\n';
  const grammar = await failGrammar(page, "java");
  putFrontendIntentSources(
    frontendServices,
    doughnut,
    [
      makeMe.anIntentLocation
        .at("checks")
        .ofKind("java")
        .selecting("checks/Examples.java")
        .please(),
    ],
    { "checks/Examples.java": text },
  );
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "checks");
  await sourceFile(intent, "checks/Examples.java").click();
  await grammar.failed;
  const source = fileSource(intent, "checks/Examples.java");
  await expect(sourceLineText(source)).toHaveText([
    'class Examples { String value = "still readable"; }',
    "",
  ]);
  await expect(sourceLineNumbers(source)).toHaveText(["1", "2"]);
  await expect(sourceLineText(source).locator("span")).toHaveCount(0);
  await parts(page).development.click();
  await parts(page).intentChoice.click();
  await expect(sourceFile(intent, "checks/Examples.java")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await filesToggle(intent).click();
  await expectFilesShown(intent, false);
  await expect(sourceLineText(source)).toHaveText([text.trimEnd(), ""]);
  await expect(sourceLineNumbers(source)).toHaveText(["1", "2"]);
  await expect(sourceLineText(source).locator("span")).toHaveCount(0);
});
