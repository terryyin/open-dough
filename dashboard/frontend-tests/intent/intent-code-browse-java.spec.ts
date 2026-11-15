import { putFrontendIntentSources } from "../../tests/support/frontendIntentSources.ts";
import { answerFrontendIntentCi } from "../../tests/support/frontendIntentCi.ts";
// Configured Java/JUnit source uses Intent's existing browser and Purpose/Proof
// reader, alongside another test type, without requiring Java CI evidence.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts, shortRevision } from "../../tests/dashboardPage.ts";
import {
  fileSource,
  sourceFile,
  sourceLineNumbers,
  sourceLineText,
  sourceRevision,
} from "../../tests/intentCodeBrowsePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  proofRegion,
} from "../../tests/intentPerspectivePage.ts";
import {
  colourOf,
  expectKeywordAndStringColours,
  sourceToken,
} from "../../tests/pageColours.ts";
import { openUntilRead } from "../../tests/pageRequestNotes.ts";
import { doughnut } from "../../tests/intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { failGrammar } from "../../tests/support/syntaxGrammar.ts";

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
  await page.emulateMedia({ colorScheme: "light" });
  expect(await colourOf(sourceToken(source, /^class$/))).toBe(
    "rgb(215, 58, 73)",
  );
  expect(await colourOf(sourceToken(source, /^"two"$/))).toBe("rgb(3, 47, 98)");
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await colourOf(sourceToken(source, /^class$/))).toBe(
    "rgb(249, 117, 131)",
  );
  expect(await colourOf(sourceToken(source, /^"two"$/))).toBe(
    "rgb(158, 203, 255)",
  );
  await expect(sourceLineText(source)).toHaveText(javaText.split("\n"));

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
});
