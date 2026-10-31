// Intent browses and reads configured Gherkin source at the observed revision
// (../src/IntentPerspective.tsx): Doughnut-like and Pygardon-like locations,
// nested folders, exact text with line numbers, Proof unavailable, project
// change, and PNG files outside the kind omitted.

import { expect, test } from "./dashboardTest.ts";
import { chooseProject, parts, shortRevision } from "./dashboardPage.ts";
import { expectAddress } from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { filesOf, type Project } from "./catalogProjectRecords.ts";

const doughnut: Project = {
  label: "Doughnut",
  ref: "main",
  repository: "nerds-odd-e/doughnut",
  revision: "d7".repeat(20),
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
  revision: "c1".repeat(20),
  taken: "Pygardon's own taken story",
  queued: "Pygardon's own queued story",
  direction: "Show Pygardon's own published direction through local gh.",
  purpose: "Read Pygardon's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/303-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-303-queued.md",
};

const recallFeature = `Feature: Recall a note
  Scenario: Open a note by title
    Given a notebook with a note titled "alpha"
    When I ask to recall "alpha"
    Then I see the note body
`;

const packagedFeature = `Feature: Packaged feature
  Scenario: A packaged case
    Given a packaged fixture
    When I run it
    Then it passes
`;

const doughnutSettings = JSON.stringify(
  {
    intent: {
      locations: [{ path: "e2e_test/features", kind: "gherkin" }],
    },
  },
  null,
  2,
);

const pygardonSettings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: "e2e_test/features", kind: "gherkin" },
        { path: "e2e_test/packaged/features", kind: "gherkin" },
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

test("Intent browses Doughnut and Pygardon Gherkin locations, reads exact text with line numbers, and replaces content on project change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, doughnutSettings, {
    "e2e_test/features/recall/recall_note.feature": recallFeature,
    "e2e_test/features/recall/__image_snapshots__/recall.png": "png-bytes",
  });
  await publishIntentProject(page, pygardon, pygardonSettings, {
    "e2e_test/features/smoke/smoke.feature": "Feature: Smoke\n",
    "e2e_test/packaged/features/packaged.feature": packagedFeature,
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveText("Intent");
  await expect(intent.getByText("e2e_test/features").first()).toBeVisible();
  await expect(intent.getByText("gherkin").first()).toBeVisible();

  await test.step("selecting a nested feature shows exact text, line numbers and the observed revision", async () => {
    await expect(
      intent.getByRole("button", { name: "recall", exact: true }),
    ).toBeVisible();
    const feature = intent.getByRole("button", {
      name: "e2e_test/features/recall/recall_note.feature",
      exact: true,
    });
    await expect(feature).toBeVisible();
    await expect(
      intent.getByRole("button", { name: /recall\.png/ }),
    ).toHaveCount(0);
    await feature.click();
    const source = intent.getByLabel(
      "e2e_test/features/recall/recall_note.feature source",
    );
    await expect(source).toContainText("Feature: Recall a note");
    await expect(source).toContainText("Given a notebook with a note titled");
    await expect(
      source.locator(".intent-source-line-number").first(),
    ).toHaveText("1");
    await expect(intent).toContainText(
      `at revision ${shortRevision(doughnut.revision)}`,
    );
    await expect(intent.getByRole("region", { name: "Proof" })).toContainText(
      "No Proof is available for this file yet",
    );
    await expect(
      intent.getByRole("region", { name: "Proof" }),
    ).not.toContainText(/passed|failed|no tests/i);
  });

  await test.step("choosing Pygardon replaces Doughnut's tree and text; both locations browse", async () => {
    await chooseProject(page, "Pygardon");
    await expect(intent).not.toContainText("Feature: Recall a note");
    await expect(
      intent.getByRole("button", {
        name: "e2e_test/features/recall/recall_note.feature",
      }),
    ).toHaveCount(0);
    await expect(intent.getByText("e2e_test/features").first()).toBeVisible();
    await expect(
      intent.getByText("e2e_test/packaged/features").first(),
    ).toBeVisible();
    await expect(
      intent.getByText("Select a feature file to read its Purpose."),
    ).toBeVisible();
    await intent
      .getByRole("button", {
        name: "e2e_test/packaged/features/packaged.feature",
      })
      .click();
    await expect(
      intent.getByLabel("e2e_test/packaged/features/packaged.feature source"),
    ).toContainText("Feature: Packaged feature");
    await expect(intent).toContainText(
      `at revision ${shortRevision(pygardon.revision)}`,
    );
    expectAddress(page, { project: "pygardon", perspective: "intent" });
  });
});
