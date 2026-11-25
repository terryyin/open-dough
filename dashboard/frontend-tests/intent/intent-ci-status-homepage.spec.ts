// CI status is Intent's homepage (../../src/IntentCiStatus.tsx,
// ../../src/IntentPage.tsx, ../../src/IntentPerspective.tsx): with no selected
// story Project Intent is Intent's landing, and opening it with nothing
// selected fills the reading pane with the judged branch's status; its strip
// offers CI status and Optimization Candidates only; with a location, nested
// folder or file selected there is no return button, and directly activating
// the already chosen CI status tab by click, Enter or Space clears that
// selection and shows it again, keeping the tree open; not-configured
// locations still show CI status beside the explanation
// (SEED-239#show-ci-status-on-intent-home example 1). Project CI while
// locations load, fail and recover: ./intent-ci-status-locations-recovery.spec.ts.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentViews, intentViewTab } from "./intent-candidates-page.ts";
import {
  activateChosenCiTab,
  doughnutSource,
  expandLocationAndFolders,
  filesColumnVisible,
  folderNameControl,
  locationNameControl,
  presentElement,
  pressedFileCount,
  workOf,
} from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  judgedStatus,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const login = judgedStatus("main", "pass", "a1b2c3d", "Add login");
const browsed = "dashboard/tests/browse.spec.ts";
const deep = "dashboard/tests/nested/deep.spec.ts";
const browseSpecText = `import { test } from "vitest";\ntest("browses", () => {});\n`;

const configuredLocations = makeMe.anIntentLocationsAnswer
  .locating(
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting(browsed, deep)
      .please(),
  )
  .please();

const openDoughWork = workOf(openDoughSource, "b2b2b2b");
const doughnutWork = workOf(doughnutSource, "c3c3c3c");

const passed = "Passed at a1b2c3d (Add login)";
const purpose = page.getByRole("region", { name: "Purpose", exact: true });
const summary = page.getByRole("region", { name: "Summary", exact: true });

const mountHomepage = () =>
  mountIntentCiPage({
    work: openDoughWork,
    projects: [openDoughSource, doughnutSource],
    reads: {
      intent: {
        readLocations: (source) =>
          Promise.resolve(
            source.id === doughnutSource.id
              ? makeMe.anIntentLocationsAnswer.notConfigured().please()
              : configuredLocations,
          ),
        readFile: () => Promise.resolve(browseSpecText),
        readCandidates: () => Promise.resolve({ status: "absent" }),
      },
      ci: inertCiReads({ readStatus: () => Promise.resolve(login) }),
    },
  });

test("with nothing selected Project Intent lands on CI status filling the reading pane", async () => {
  await mountHomepage();
  const ci = intentCiStatus();

  await expect
    .poll(() =>
      intentViews
        .getByRole("tab")
        .elements()
        .map((tab) => tab.textContent),
    )
    .toEqual(["CI status", "Optimization Candidates"]);
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(
      page.getByRole("heading", { name: "No story selected", exact: true }),
    )
    .toBeVisible();
  const frames = document.querySelectorAll<HTMLElement>(".intent-page-frame");
  expect(frames).toHaveLength(1);
  const frame = presentElement(frames.item(0));
  expect(frame.getAttribute("data-intent-context")).toBe("project");
  expect(frame.firstElementChild?.className).toBe("intent-header");
  await expect.element(ci.panel).toBeVisible();
  await expect.poll(filesColumnVisible).toBe(true);
  await ci.judges("main");
  await ci.answers(passed);
  await ci.showsChecked();
  await expect.element(purpose).not.toBeInTheDocument();
});

test.for([
  {
    choice: "location",
    select: () => locationNameControl("dashboard/tests"),
    reading: summary,
    how: "click",
  },
  {
    choice: "nested folder",
    select: () => folderNameControl("nested"),
    reading: summary,
    how: "Enter",
  },
  {
    choice: "file",
    select: () => page.getByRole("button", { name: browsed, exact: true }),
    reading: purpose,
    how: "Space",
  },
] as const)(
  "with a $choice chosen, $how on the chosen CI status tab returns home with the tree open",
  async ({ select, reading, how }) => {
    await mountHomepage();
    const ci = intentCiStatus();
    const locationToggle = await expandLocationAndFolders("dashboard/tests");
    const control = select();
    await userEvent.click(control);
    await expect.element(control).toHaveAttribute("aria-pressed", "true");
    await ci.isAbsent();
    await expect.element(reading).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: /Return to CI status/ }))
      .not.toBeInTheDocument();
    await expect
      .element(intentViewTab("CI status"))
      .toHaveAttribute("aria-selected", "true");

    await activateChosenCiTab(how);

    await expect.element(ci.panel).toBeVisible();
    await ci.answers(passed);
    await expect.element(reading).not.toBeInTheDocument();
    expect(pressedFileCount()).toBe(0);
    expect(locationToggle()?.getAttribute("aria-expanded")).toBe("true");
    await expect
      .element(page.getByRole("button", { name: deep, exact: true }))
      .toBeVisible();
  },
);

test("returning from Development shows the CI homepage again", async () => {
  const mounted = await mountHomepage();
  await intentCiStatus().answers(passed);
  await mounted.showDevelopment();
  await expect
    .element(page.getByRole("main", { name: "Intent", exact: true }))
    .not.toBeInTheDocument();

  await mounted.showIntent();

  await intentCiStatus().answers(passed);
});

test("a project without Intent locations shows CI status beside the explanation", async () => {
  const mounted = await mountHomepage();
  const ci = intentCiStatus();
  await ci.answers(passed);

  await mounted.showWork(doughnutWork);

  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(
      page.getByText("No Intent locations are configured for Doughnut.", {
        exact: false,
      }),
    )
    .toBeVisible();
  await expect.element(ci.panel).toBeVisible();
  await ci.judges("main");
  await ci.answers(passed);
});
