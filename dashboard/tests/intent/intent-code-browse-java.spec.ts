// Configured Java/JUnit source uses Intent's existing browser and Purpose/Proof
// reader, alongside another test type, without requiring Java CI evidence.
import { expect, githubFor, test } from "../dashboardTest.ts";
import { parts, shortRevision } from "../dashboardPage.ts";
import {
  fileSource,
  sourceFile,
  sourceLineNumbers,
  sourceLineText,
  sourceRevision,
} from "../intentCodeBrowsePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  proofRegion,
} from "../intentPerspectivePage.ts";
import {
  colourOf,
  expectKeywordAndStringColours,
  sourceToken,
} from "../pageColours.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { doughnut, publishIntentProject } from "../intentCodeBrowseFixtures.ts";
import { trunkCi } from "../intentCiStatusPage.ts";
import { noConnection } from "../originAnswers.ts";
import type { RepositoryAnswerer } from "../support/fakeGitHub.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("Intent lists configured nested JUnit source, reads exact pinned Java with line numbers and theme styling, and shares Purpose/Proof with other source", async ({
  page,
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
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("backend/src/test/java")
        .ofKind("java", ["**/*Test.java"])
        .please(),
      makeMe.anIntentLocation.at("scripts").ofKind("shell").please(),
    )
    .please();
  await publishIntentProject(page, doughnut, settings, {
    [javaPath]: javaText,
    "backend/src/test/java/com/example/Fixture.java": "class Fixture {}\n",
    "scripts/check.sh": shellText,
  });
  const ci = trunkCi(doughnut.revision, () => []);
  const sourceAnswers: RepositoryAnswerer | undefined = githubFor(page).serve(
    doughnut.repository,
    async (call) => ci(call) ?? sourceAnswers?.(call) ?? noConnection,
  );
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
}) => {
  const text = 'class Examples { String value = "still readable"; }\n';
  let grammarFailed: () => void = () => undefined;
  const failed = new Promise<void>((resolve) => {
    grammarFailed = resolve;
  });
  await page.route(/\/assets\/java-[^/]+\.js$/, async (route) => {
    await route.abort("failed");
    grammarFailed();
  });
  await publishIntentProject(
    page,
    doughnut,
    makeMe.intentSettings
      .withLocations(
        makeMe.anIntentLocation.at("checks").ofKind("java").please(),
      )
      .please(),
    { "checks/Examples.java": text },
  );
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, "checks");
  await sourceFile(intent, "checks/Examples.java").click();
  await failed;
  const source = fileSource(intent, "checks/Examples.java");
  await expect(sourceLineText(source)).toHaveText([
    'class Examples { String value = "still readable"; }',
    "",
  ]);
  await expect(sourceLineNumbers(source)).toHaveText(["1", "2"]);
  await expect(sourceLineText(source).locator("span")).toHaveCount(0);
});
