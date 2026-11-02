// Unreadable and malformed Intent settings stay distinct from not-configured
// (../src/IntentPerspective.tsx). Companion to ./intent-gherkin-unusable.spec.ts
// location-body explanations.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { doughnut, pygardon } from "./intentGherkinUnusableFixtures.ts";

test("unreadable and malformed Intent settings stay distinct from not-configured", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const unreadable = {
    ...doughnut,
    revision: "a0".repeat(20),
  };
  const malformed = {
    ...pygardon,
    revision: "b1".repeat(20),
  };
  await publishFiles(page, {
    repository: unreadable.repository,
    ref: unreadable.ref,
    revision: unreadable.revision,
    files: {
      ...filesOf(unreadable),
      ".planning/open-dough.json": "{}\n",
    },
    unanswered: [".planning/open-dough.json"],
  });
  await publishFiles(page, {
    repository: malformed.repository,
    ref: malformed.ref,
    revision: malformed.revision,
    files: {
      ...filesOf(malformed),
      ".planning/open-dough.json": "{not json\n",
    },
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  await test.step("unreadable settings name the file and stay distinct from absence", async () => {
    await expect(intent).toContainText(
      ".planning/open-dough.json could not be read, so Intent locations for Doughnut are unavailable.",
    );
    await expect(intent).not.toContainText(
      "No intent locations are configured",
    );
    await expect(intent).not.toContainText("is not valid JSON");
  });

  await test.step("malformed settings name the file as invalid JSON", async () => {
    await chooseProject(page, "Pygardon");
    await expect(intent).toContainText(
      ".planning/open-dough.json is not valid JSON, so Intent locations for Pygardon could not be read.",
    );
    await expect(intent).not.toContainText(
      "No intent locations are configured",
    );
    await expect(intent).not.toContainText(
      "could not be read, so Intent locations for Pygardon are unavailable.",
    );
  });
});
