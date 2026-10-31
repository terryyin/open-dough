// Intent distinguishes unusable locations and failed reads
// (../src/IntentPerspective.tsx): empty or missing paths, unsupported kinds,
// a failed feature read with retry, and unreadable or malformed settings,
// while other locations stay browseable.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { filesOf, type Project } from "./catalogProjectRecords.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

const doughnut: Project = {
  label: "Doughnut",
  ref: "main",
  repository: "nerds-odd-e/doughnut",
  revision: "e8".repeat(20),
  taken: "Doughnut's own taken story",
  queued: "Doughnut's own queued story",
  direction: "Show Doughnut's own published direction through local gh.",
  purpose: "Read Doughnut's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/302-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-302-queued.md",
};

const pygardon: Project = {
  label: "Pygardon",
  ref: "main",
  repository: "terryyin/pygardon",
  revision: "f9".repeat(20),
  taken: "Pygardon's own taken story",
  queued: "Pygardon's own queued story",
  direction: "Show Pygardon's own published direction through local gh.",
  purpose: "Read Pygardon's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/303-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-303-queued.md",
};

const usableFeature = `Feature: Usable
  Scenario: Still browses
    Given a working location
`;

const mixedSettings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: "e2e_test/features", kind: "gherkin" },
        { path: "no_such_dir", kind: "gherkin" },
        { path: "empty_features", kind: "gherkin" },
        { path: "frontend/src", kind: "typescript" },
      ],
    },
  },
  null,
  2,
);

function publishIntentProject(
  page: Parameters<typeof publishFiles>[0],
  published: Project,
  settings: string,
  features: Readonly<Record<string, string>>,
) {
  return publishFiles(page, {
    repository: published.repository,
    ref: published.ref,
    revision: published.revision,
    files: {
      ...filesOf(published),
      ".planning/open-dough.json": `${settings}\n`,
      ...features,
    },
  });
}

test("Intent names empty, missing, and unsupported locations while others browse; failed file reads retry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, mixedSettings, {
    "e2e_test/features/usable/usable.feature": usableFeature,
    "empty_features/README.md": "# no features here\n",
    "frontend/src/app.ts": "export {}\n",
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveText("Intent");

  await test.step("a missing location and one with no .feature files say so by path; the usable location still browses", async () => {
    await expect(intent).toContainText(
      "No .feature files are published at no_such_dir for this revision.",
    );
    await expect(intent).toContainText(
      "No .feature files are published at empty_features for this revision.",
    );
    const usable = intent.getByRole("button", {
      name: "e2e_test/features/usable/usable.feature",
      exact: true,
    });
    await expect(usable).toBeVisible();
    await usable.click();
    await expect(
      intent.getByLabel("e2e_test/features/usable/usable.feature source"),
    ).toContainText("Feature: Usable");
  });

  await test.step("kind typescript says it is not yet supported, naming it; others still browse", async () => {
    await expect(intent).toContainText("Kind typescript is not yet supported.");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      intent.getByLabel("e2e_test/features/usable/usable.feature source"),
    ).toContainText("Feature: Usable");
  });

  await test.step("a failed feature read says so with retry; the tree stays usable", async () => {
    let failures = 0;
    await page.route(`**${authenticatedReadEndpoint}?*`, async (route) => {
      const url = new URL(route.request().url());
      if (
        url.searchParams.get("path") ===
          "e2e_test/features/usable/usable.feature" &&
        failures < 1
      ) {
        failures += 1;
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            error: "feature unavailable for proof",
          }),
        });
        return;
      }
      await route.continue();
    });
    // Remount the Intent browser so selecting the feature asks again under
    // the failing route (a second click on the already-selected row does not).
    await page.reload();
    await openUntilRead(page, "/?project=doughnut&perspective=intent");
    await intent
      .getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      })
      .click();
    const alert = intent.getByRole("alert");
    await expect(alert).toContainText(
      "e2e_test/features/usable/usable.feature could not be read.",
    );
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/usable/usable.feature",
        exact: true,
      }),
    ).toBeVisible();
    await expect(intent).toContainText(
      "No .feature files are published at no_such_dir for this revision.",
    );
    await alert.getByRole("button", { name: "Retry" }).click();
    await expect(
      intent.getByLabel("e2e_test/features/usable/usable.feature source"),
    ).toContainText("Feature: Usable");
    await page.unroute(`**${authenticatedReadEndpoint}?*`);
  });
});

test("unreadable and malformed Intent settings stay distinct from not-configured", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const unreadable: Project = {
    ...doughnut,
    revision: "a0".repeat(20),
  };
  const malformed: Project = {
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
