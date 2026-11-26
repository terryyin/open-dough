import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  openDoughSource,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";
import {
  childName,
  openSummary,
  scopeTable,
  showsSummaryPath,
} from "./intent-summary-proof-page.ts";

const configuration = (summary: Locator) =>
  summary.getByRole("list", { name: "Test configuration", exact: true });

test("Summary shows the declared kind for empty and unsupported roots", async () => {
  const empty = "features";
  const unsupported = "frontend";
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      {
        ...makeMe.anIntentLocation
          .at(empty)
          .ofKind("gherkin")
          .selecting()
          .please(),
        problem: "no-matching-files",
      },
      {
        ...makeMe.anIntentLocation
          .at(unsupported)
          .labelled("Frontend checks")
          .ofKind("unfamiliar-language", ["**/*.check"])
          .selecting()
          .please(),
        problem: "unsupported-kind",
      },
    )
    .please();
  await mountIntentCiPage({
    work: makeMe.aPublishedWork.of(openDoughSource).at(doneCompletion).please(),
    reads: {
      ci: inertCiReads(),
      intent: {
        ...unconfiguredIntentReads,
        readLocations: () => Promise.resolve(locations),
      },
    },
  });

  const summary = await openSummary(empty);
  await expect
    .poll(() => configuration(summary).query()?.textContent.trim())
    .toBe("gherkin");
  await expect
    .element(summary.getByText("0 files", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      summary.getByText(
        "No gherkin files are published at features for this revision.",
        { exact: true },
      ),
    )
    .toBeVisible();

  await openSummary(unsupported);
  await expect
    .element(summary.getByText("Frontend checks", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      configuration(summary).getByText("unfamiliar-language", { exact: true }),
    )
    .toBeVisible();
  await expect
    .element(configuration(summary).getByText("**/*.check", { exact: true }))
    .toBeVisible();
  await expect
    .element(summary.getByText("0 files", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      summary.getByText("Kind unfamiliar-language is not yet supported.", {
        exact: true,
      }),
    )
    .toBeVisible();
});

test("a mixed repository root summarizes its matching files, keeping a rename that leaves the location in its original scope", async () => {
  const root = "Distribution";
  const checks = `${root}/checks`;
  const script = `${checks}/check.sh`;
  const checkData = `${root}/fixtures/data.check`;
  const original = `${checks}/moved.sh`;
  const destination = "dashboard/tests/moved.spec.ts";
  const notes = `${checks}/notes.md`;
  const skill = `${root}/src/SKILL.md`;
  const location = makeMe.anIntentLocation
    .at(root)
    .labelled("Distribution checks")
    .withSources(
      { syntax: "shell", include: ["checks/*.sh"] },
      { include: ["fixtures/*.check"] },
    )
    .selecting(script, checkData)
    .please();
  const dashboard = makeMe.anIntentLocation
    .at("dashboard/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(destination)
    .please();
  const review = makeMe.aStoryReview
    .published(doneCompletion)
    .renaming(original, destination)
    .please();
  await openDoneStoryComparison({
    review: () => Promise.resolve(review),
    storyResult: () =>
      Promise.resolve({
        kind: "inventory",
        revision: doneCompletion,
        paths: [script, checkData, destination, notes, skill],
        locations: [location, dashboard],
      }),
  });
  await intentStoryCompare().listRevision();

  const summary = await openSummary(root);
  await expect
    .element(summary.getByText("Distribution checks", { exact: true }))
    .toBeVisible();
  const declarations = configuration(summary).getByRole("listitem");
  await expect
    .element(declarations.nth(0).getByText("shell", { exact: true }))
    .toBeVisible();
  await expect
    .element(declarations.nth(0).getByText("checks/*.sh", { exact: true }))
    .toBeVisible();
  await expect
    .poll(() => declarations.nth(1).query()?.textContent.trim())
    .toBe("fixtures/*.check");
  await expect
    .element(summary.getByText("3 files", { exact: true }))
    .toBeVisible();
  await expect.element(childName(summary, "fixtures/")).toBeVisible();
  await expect.element(childName(summary, "src/")).not.toBeInTheDocument();

  await userEvent.click(childName(summary, "checks/"));
  await showsSummaryPath(summary, checks);
  await expect.element(configuration(summary)).not.toBeInTheDocument();
  await expect
    .element(summary.getByText("Distribution checks", { exact: true }))
    .not.toBeInTheDocument();
  await expect
    .element(summary.getByText("2 files", { exact: true }))
    .toBeVisible();
  const childRows = scopeTable(summary, checks);
  await expect.element(childName(childRows, "check.sh")).toBeVisible();
  await expect.element(childName(childRows, "moved.sh")).toBeVisible();
  await expect
    .element(childName(childRows, "notes.md"))
    .not.toBeInTheDocument();

  await openSummary(dashboard.path);
  await expect
    .element(configuration(summary).getByText("typescript", { exact: true }))
    .toBeVisible();
  await expect
    .element(configuration(summary).getByText("**/*.spec.ts", { exact: true }))
    .toBeVisible();
  await expect
    .element(summary.getByText("1 file", { exact: true }))
    .toBeVisible();
  await expect.element(childName(summary, "moved.spec.ts")).toBeVisible();
});
