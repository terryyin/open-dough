// CI status is Intent's homepage (../../src/IntentCiStatus.tsx,
// ../../src/IntentPage.tsx, ../../src/IntentPerspective.tsx): with no selected
// story Project Intent is Intent's landing, and opening it with nothing
// selected fills the reading pane with the judged branch's status; its strip
// offers CI status and Optimization Candidates only; with a location, nested
// folder or file selected there is no return button, and directly activating
// the already chosen CI status tab by click, Enter or Space clears that
// selection and shows it again, keeping the tree open; not-configured
// locations still show CI status beside the explanation
// (SEED-239#show-ci-status-on-intent-home example 1). Project CI stays
// readable while locations load, fail and recover, without another CI read.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { intentViews, intentViewTab } from "./intent-candidates-page.ts";
import {
  activateChosenCiTab,
  doughnutSource,
  expandLocationAndFolders,
  filesColumnVisible,
  folderNameControl,
  locationNameControl,
  mountIntentPerspective,
  presentElement,
  workOf,
} from "./intent-ci-perspective-mount.ts";
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

const configuredLocations: IntentLocations = {
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting(browsed, deep)
      .please(),
  ],
};

const openDoughWork = workOf(openDoughSource, "b2b2b2b");
const doughnutWork = workOf(doughnutSource, "c3c3c3c");

test("CI status fills Intent's reading with nothing selected; the strip has no CI status mode; activating Intent again returns home from an entry, folder or file; not-configured shows it beside the explanation", async () => {
  const readSource: IntentReadSource = {
    readLocations: (source) =>
      Promise.resolve(
        source.id === doughnutSource.id
          ? { status: "not-configured" }
          : configuredLocations,
      ),
    readFile: () => Promise.resolve(browseSpecText),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  const mounted = await mountIntentPerspective({
    work: openDoughWork,
    readSource,
    ciReads: inertCiReads({
      readStatus: () => Promise.resolve(login),
    }),
  });
  const ci = intentCiStatus();
  const intentMain = page.getByRole("main", { name: "Intent", exact: true });

  // Nothing selected: Project Intent is the landing, CI status filling the reading pane.
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
    .element(page.getByRole("button", { name: "Back to selected story" }))
    .not.toBeInTheDocument();
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
  await ci.answers("Passed at a1b2c3d (Add login)");
  await ci.showsChecked();
  await expect
    .element(page.getByRole("region", { name: "Purpose", exact: true }))
    .not.toBeInTheDocument();

  // Entry, nested folder or file selected: no return button; activating CI status returns home with tree open.
  const locationToggle = await expandLocationAndFolders("dashboard/tests");
  const summaryRegion = page.getByRole("region", {
    name: "Summary",
    exact: true,
  });
  const selections = [
    {
      select: () => locationNameControl("dashboard/tests"),
      reading: summaryRegion,
      how: "click" as const,
    },
    {
      select: () => folderNameControl("nested"),
      reading: summaryRegion,
      how: "Enter" as const,
    },
    {
      select: () => page.getByRole("button", { name: browsed, exact: true }),
      reading: page.getByRole("region", { name: "Purpose", exact: true }),
      how: "Space" as const,
    },
  ];
  for (const { select, reading, how } of selections) {
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
    await ci.answers("Passed at a1b2c3d (Add login)");
    await expect.element(reading).not.toBeInTheDocument();
    expect(
      document.querySelectorAll('.intent-locations [aria-pressed="true"]'),
    ).toHaveLength(0);
    expect(locationToggle()?.getAttribute("aria-expanded")).toBe("true");
    await expect
      .element(page.getByRole("button", { name: deep, exact: true }))
      .toBeVisible();
  }

  // Development and back shows the CI homepage again.
  mounted.showDevelopment();
  await expect.element(intentMain).not.toBeInTheDocument();
  mounted.showIntent();
  await ci.answers("Passed at a1b2c3d (Add login)");

  // Not-configured: CI status beside the explanation.
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
  await ci.answers("Passed at a1b2c3d (Add login)");
});

test("project CI remains readable while locations load, fail and recover without another CI read", async () => {
  const coldWork = workOf(openDoughSource, "d4d4d4d");
  const reads = { fresh: 0, kept: 0 };
  let rejectInitialLocations: (reason: Error) => void = () => {};
  let initialAsked = false;
  const initialLocations = new Promise<IntentLocations>((...[, reject]) => {
    rejectInitialLocations = reject;
  });
  let firstAttempt = true;

  await mountIntentPerspective({
    work: coldWork,
    readSource: {
      readLocations: () => {
        if (firstAttempt) {
          firstAttempt = false;
          initialAsked = true;
          return initialLocations;
        }
        return Promise.resolve(configuredLocations);
      },
      readFile: () => Promise.resolve(browseSpecText),
      readCandidates: () => Promise.resolve({ status: "absent" }),
    },
    ciReads: inertCiReads({
      readKeptStatus: () => {
        reads.kept += 1;
        return Promise.resolve({ none: true });
      },
      readStatus: () => {
        reads.fresh += 1;
        return Promise.resolve(login);
      },
    }),
  });
  const ci = intentCiStatus();
  await expect
    .element(
      page.getByRole("heading", { name: "No story selected", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(page.getByText("Reading Intent locations…", { exact: true }))
    .toBeVisible();
  await ci.answers("Passed at a1b2c3d (Add login)");
  expect(initialAsked).toBe(true);
  expect(reads).toEqual({ fresh: 1, kept: 1 });

  rejectInitialLocations(new Error("Read refused"));
  const failure = page.getByRole("alert");
  await expect
    .element(failure)
    .toHaveTextContent(
      "Intent locations for Open Dough could not be read. Retry",
    );
  await ci.answers("Passed at a1b2c3d (Add login)");

  await userEvent.click(
    failure.getByRole("button", { name: "Retry", exact: true }),
  );
  await expect.poll(filesColumnVisible).toBe(true);
  await expect.element(failure).not.toBeInTheDocument();
  await ci.answers("Passed at a1b2c3d (Add login)");
  expect(reads).toEqual({ fresh: 1, kept: 1 });
});
