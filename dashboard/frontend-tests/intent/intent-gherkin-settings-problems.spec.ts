import {
  readFailure,
  readRetry,
} from "../../test-support/intentReadRecoveryPage.ts";
// Unreadable and malformed Intent settings stay distinct from not-configured,
// and a failed Intent locations read names its cause
// (../../src/IntentPerspective.tsx). Companion to ../../../e2e/intent/intent-gherkin-unusable.spec.ts
// location-body explanations.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { chooseProject, parts } from "../../test-support/dashboardPage.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import { putFrontendIntentSources } from "../../test-support/support/frontendIntentSources.ts";
import { controlFrontendAuthenticatedRead } from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import {
  doughnut,
  pygardon,
} from "../../test-support/intentGherkinUnusableFixtures.ts";

test("unreadable and malformed Intent settings stay distinct from not-configured", async ({
  page,
  frontendServices,
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
  putFrontendIntentSources(frontendServices, unreadable, [], {});
  Object.assign(frontendServices, {
    projects: [unreadable, malformed],
    locations: {
      revision: unreadable.revision,
      locations: null,
      settingsProblem: "unreadable",
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
    putFrontendIntentSources(frontendServices, malformed, [], {});
    Object.assign(frontendServices, {
      projects: [unreadable, malformed],
      locations: {
        revision: malformed.revision,
        locations: null,
        settingsProblem: "malformed",
      },
    });
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

test("an Intent locations read that fails names its cause, and Retry reads it again", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const published = { ...doughnut, revision: "c2".repeat(20) };
  putFrontendIntentSources(frontendServices, published, [], {});
  Object.assign(frontendServices, {
    locations: { revision: published.revision, locations: null },
  });
  const locations = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("intent") === "locations",
  );
  locations.unreachable();

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  const problem = readFailure(intent);
  await expect(problem).toHaveText(
    `Intent locations for Doughnut could not be read: The local authenticated read could not be reached while reading .planning/open-dough.json at ${published.revision}. Retry`,
  );

  locations.pass();
  await readRetry(problem).click();
  await expect(readFailure(intent)).toHaveCount(0);
  await expect(intent).toContainText(
    "No intent locations are configured for Doughnut.",
  );
});
