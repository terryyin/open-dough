import {
  expectCiScope,
  ciStatusReading,
  expectCiAnswer,
  activateIntentHome,
  chooseCiStatus,
  ciPanel,
  expectChecked,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";

// CI status is Intent's homepage (../../src/IntentCiStatus.tsx): with no
// selected story Project Intent is Intent's landing, and opening it with
// nothing selected fills the reading pane with the judged branch's status;
// its strip offers CI status and Optimization Candidates only; with a
// location, nested folder or file selected there is no return button, and
// directly activating the already chosen CI status tab by click, Enter or
// Space clears that selection and shows it again, keeping the tree open;
// not-configured locations still show CI status beside the explanation
// (SEED-239#show-ci-status-on-intent-home example 1).

import { expect, test } from "../dashboardTest.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import { parts } from "../dashboardPage.ts";
import {
  browseSpec,
  doughnut,
  openDough,
  openDoughSettings,
} from "../intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

import { intentModeTab } from "../intentModePage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  intentFolderName,
  intentGroupToggle,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { openUntilRead, untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { intentSettingsText } from "../support/intentSettingsFile.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("CI status fills Intent's reading with nothing selected; the strip has no CI status mode; activating Intent again returns home from an entry, folder or file; not-configured shows it beside the explanation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishProject(page, openDough, {
    ".planning/open-dough.json": intentSettingsText(openDoughSettings),
    "dashboard/tests/browse.spec.ts": browseSpec,
    "dashboard/tests/nested/deep.spec.ts": browseSpec,
  }).serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
    ]),
  );
  publishProject(page, doughnut).serveCi(
    trunkCi(doughnut.revision, () => [
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
    ]),
  );
  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice, development } = parts(page);
  await intentChoice.click();

  await test.step("nothing selected: Project Intent is the landing, CI status filling the reading pane; its strip is CI status and Optimization Candidates only", async () => {
    await expect(
      intent
        .getByRole("tablist", { name: "Project Intent views" })
        .getByRole("tab"),
    ).toHaveText(["CI status", "Optimization Candidates"]);
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
    await expect(intent.locator(".intent-page-frame")).toHaveCount(1);
    await expect(intent.locator(".intent-page-frame")).toHaveAttribute(
      "data-intent-context",
      "project",
    );
    await expect(intent.locator(".intent-page-frame > *").first()).toHaveClass(
      "intent-header",
    );
    const panel = await chooseCiStatus(intent);
    await expect(intent.locator(".intent-locations")).toBeVisible();
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
        select: intent.getByRole("button", {
          name: "dashboard/tests/browse.spec.ts",
          exact: true,
        }),
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
        intent.locator('.intent-locations [aria-pressed="true"]'),
        name,
      ).toHaveCount(0);
      await expect(
        intentGroupToggle(intent, "dashboard/tests"),
        name,
      ).toHaveAttribute("aria-expanded", "true");
      await expect(
        intent.getByRole("button", {
          name: "dashboard/tests/nested/deep.spec.ts",
          exact: true,
        }),
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
}) => {
  publishProject(page, openDough, {
    ".planning/open-dough.json": intentSettingsText(openDoughSettings),
    "dashboard/tests/browse.spec.ts": browseSpec,
  }).serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
    ]),
  );
  const locations = await holdAuthenticatedReadsWhere(
    page,
    (params) => params.get("intent") === "locations",
    releases,
  );
  const ciReads = { fresh: 0, kept: 0 };
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-status"
    )
      ciReads[url.searchParams.get("kept") === "1" ? "kept" : "fresh"] += 1;
  });
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
  expect(ciReads).toEqual({ fresh: 1, kept: 1 });

  locations.fail();
  const failure = intent.getByRole("alert");
  await expect(failure).toContainText(
    "Intent locations for Open Dough could not be read",
  );
  await expect(status).toHaveText("Passed at a1b2c3d (Add login)");
  await failure.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(intent.locator(".intent-locations")).toBeVisible();
  await expect(failure).toHaveCount(0);
  await expect(status).toHaveText("Passed at a1b2c3d (Add login)");
  await untilPageReadsAnswered(page);
  expect(ciReads).toEqual({ fresh: 1, kept: 1 });
});
