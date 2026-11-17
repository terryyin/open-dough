// CI status is Intent's homepage (../../src/IntentCiStatus.tsx): with no
// selected story Project Intent is Intent's landing, and opening it with
// nothing selected fills the reading pane with the judged branch's status;
// its strip offers CI status and Optimization Candidates only; with a
// location, nested folder or file selected there is no return button, and
// directly activating the already chosen CI status tab by click, Enter or
// Space clears that selection and shows it again, keeping the tree open;
// not-configured locations still show CI status beside the explanation
// (SEED-239#show-ci-status-on-intent-home example 1). Project CI stays
// readable while locations load, fail and recover, without another CI read.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { parts } from "../../tests/dashboardPage.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import {
  activateIntentHome,
  chooseCiStatus,
  ciPanel,
  ciStatusReading,
  expectChecked,
  expectCiAnswer,
  expectCiScope,
} from "../../tests/intentCiStatusPage.ts";
import { browseSpec } from "../../tests/intentCodeBrowseFixtures.ts";
import {
  filesColumn,
  intentModeTab,
  intentModeViews,
  intentPageFrame,
} from "../../tests/intentModePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
} from "../../tests/intentPerspectivePage.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../tests/pageRequestNotes.ts";
import {
  judgedCiStatus,
  serveFrontendCiStatus,
} from "../../tests/support/frontendCiStatusAnswers.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  publishUnconfiguredDoughnut,
  type FrontendServiceState,
} from "../../tests/support/frontendServiceState.ts";

const login = judgedCiStatus("main", "pass", "a1b2c3d", "Add login");

const browsed = "dashboard/tests/browse.spec.ts";
const deep = "dashboard/tests/nested/deep.spec.ts";

// Open Dough's one location publishes a test file and a nested folder's.
function publishBrowsedTests(services: FrontendServiceState) {
  Object.assign(services, {
    files: { ...services.files, [browsed]: browseSpec, [deep]: browseSpec },
    locations: {
      ...services.locations,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(browsed, deep)
          .please(),
      ],
    },
  });
}

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("CI status fills Intent's reading with nothing selected; the strip has no CI status mode; activating Intent again returns home from an entry, folder or file; not-configured shows it beside the explanation", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishBrowsedTests(frontendServices);
  await publishUnconfiguredDoughnut(page, frontendServices);
  await serveFrontendCiStatus(page, { main: login });
  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice, development } = parts(page);
  await intentChoice.click();

  await test.step("nothing selected: Project Intent is the landing, CI status filling the reading pane; its strip is CI status and Optimization Candidates only", async () => {
    await expect(intentModeViews(intent).getByRole("tab")).toHaveText([
      "CI status",
      "Optimization Candidates",
    ]);
    await expect(intentModeTab(intent, "CI status")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // The shared persistent header names the empty story context.
    await expect(
      intent.getByRole("button", { name: "Back to selected story" }),
    ).toHaveCount(0);
    await expect(
      intent.getByRole("heading", { name: "No story selected", exact: true }),
    ).toBeVisible();
    const frame = intentPageFrame(intent);
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute("data-intent-context", "project");
    await expect(frame.locator(":scope > *").first()).toHaveClass(
      "intent-header",
    );
    const panel = await chooseCiStatus(intent);
    await expect(filesColumn(intent)).toBeVisible();
    await expectCiScope(panel, "main");
    await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
    await expectChecked(panel);
    await expect(intent.getByRole("region", { name: "Purpose" })).toHaveCount(
      0,
    );
  });

  await test.step("entry, nested folder or file selected: no return button; activating the chosen Intent tab by click, Enter or Space returns home with the tree still open", async () => {
    await expandIntentGroup(intent, "dashboard/tests");
    await expandIntentFolders(intent, "dashboard/tests");
    const intentTab = intentModeTab(intent, "CI status");
    const selections = [
      {
        name: "the entry",
        select: intentLocationName(intent, "dashboard/tests"),
        reading: intent.getByRole("region", { name: "Summary", exact: true }),
        how: "click",
      },
      {
        name: "a nested folder",
        select: intentFolderName(intent, "nested"),
        reading: intent.getByRole("region", { name: "Summary", exact: true }),
        how: "Enter",
      },
      {
        name: "a test file",
        select: intent.getByRole("button", { name: browsed, exact: true }),
        reading: intent.getByRole("region", { name: "Purpose" }),
        how: "Space",
      },
    ] as const;
    for (const { name, select, reading, how } of selections) {
      await select.click();
      await expect(select, name).toHaveAttribute("aria-pressed", "true");
      await expect(ciPanel(intent), name).toHaveCount(0);
      await expect(reading, name).toBeVisible();
      await expect(
        intent.getByRole("button", { name: /Return to CI status/ }),
        name,
      ).toHaveCount(0);
      await expect(intentTab, name).toHaveAttribute("aria-selected", "true");
      const panel = await activateIntentHome(intent, how);
      await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)", name);
      await expect(reading, name).toHaveCount(0);
      await expect(
        filesColumn(intent).locator('[aria-pressed="true"]'),
        name,
      ).toHaveCount(0);
      await expect(
        intentGroupToggle(intent, "dashboard/tests"),
        name,
      ).toHaveAttribute("aria-expanded", "true");
      await expect(
        intent.getByRole("button", { name: deep, exact: true }),
        name,
      ).toBeVisible();
    }
  });

  await test.step("Development and back shows the CI homepage again", async () => {
    await development.click();
    await expect(intent).toHaveCount(0);
    await intentChoice.click();
    await expectCiAnswer(ciPanel(intent), "Passed at a1b2c3d (Add login)");
  });

  await test.step("not-configured: CI status beside the explanation", async () => {
    await page.goto("/?project=doughnut");
    await openUntilRead(page, "/?project=doughnut");
    await intentChoice.click();
    await expect(intent).toContainText(
      "No intent locations are configured for Doughnut.",
    );
    const panel = await chooseCiStatus(intent);
    await expect(
      intent.getByText("No intent locations are configured for Doughnut."),
    ).toBeVisible();
    await expectCiScope(panel, "main");
    await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
  });
});

test("project CI remains readable while locations load, fail and recover without another CI read", async ({
  page,
  frontendServices,
}) => {
  publishBrowsedTests(frontendServices);
  const ci = await serveFrontendCiStatus(page, { main: login });
  const locations = await holdAuthenticatedReadsWhere(
    page,
    (params) => params.get("intent") === "locations",
    releases,
  );
  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expect(
    intent.getByRole("heading", { name: "No story selected", exact: true }),
  ).toBeVisible();
  await expect(
    intent.getByText("Reading Intent locations…", { exact: true }),
  ).toBeVisible();
  const status = ciStatusReading(ciPanel(intent)).state;
  await expect(status).toHaveText("Passed at a1b2c3d (Add login)");
  expect(locations.held()).toBeGreaterThan(0);
  expect(ci.reads()).toEqual({ fresh: 1, kept: 1 });

  locations.fail();
  const failure = intent.getByRole("alert");
  await expect(failure).toContainText(
    "Intent locations for Open Dough could not be read",
  );
  await expect(status).toHaveText("Passed at a1b2c3d (Add login)");
  await failure.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(filesColumn(intent)).toBeVisible();
  await expect(failure).toHaveCount(0);
  await expect(status).toHaveText("Passed at a1b2c3d (Add login)");
  await untilPageReadsAnswered(page);
  expect(ci.reads()).toEqual({ fresh: 1, kept: 1 });
});
