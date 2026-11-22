// The Side panel sets and clears the page's selected story, which Intent's
// lens and CI status read (../../src/pageSidePanel.ts, ../../src/intentCiTarget.ts):
// reading a Taken story's final report from its card selects and highlights
// that story, and Intent names it and judges its story branch; another
// story's final report moves the selection there. A card's toggle selects
// without changing the panel, and closing the panel keeps the story selected
// then (ADR 0008), which Intent still judges. Showing a session attached to no
// story clears it, CI status judges `main` again, and closing that session's
// terminal leaves Intent at project scope. The stories' saved workspaces are
// gone, so each card's session offers its final report.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { intentViewTab } from "./intent-candidates-page.ts";
import { recordOutsideCalls } from "../../test-support/component-mount/outsideCalls.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  adHocTitle,
  sessionServices,
  showSidebarSession,
  storySessionsMachine,
} from "./intent-ci-sessions-sidebar.ts";
import {
  failingFailed,
  failingStory,
  inertCiReads,
  mainPassed,
  runningInProgress,
  runningStory,
  storiesTakenWork,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import { developmentCard } from "./intent-ci-development-card-page.ts";

test("the Side panel's content selects its story for Intent's lens and CI status, closing it keeps the selection at that moment, and an ad hoc session clears it to main", async () => {
  const outsideCalls = recordOutsideCalls();
  const mounted = await mountIntentCiPage({
    work: storiesTakenWork,
    machine: storySessionsMachine(),
    reads: {
      sessions: sessionServices,
      intent: unconfiguredIntentReads,
      ci: inertCiReads({
        readStatus: (...[, branch]) => {
          if (branch === failingStory.branch) {
            return Promise.resolve(failingFailed);
          }
          if (branch === runningStory.branch) {
            return Promise.resolve(runningInProgress);
          }
          return Promise.resolve(mainPassed);
        },
      }),
    },
  });

  const ci = intentCiStatus();
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const report = page.getByRole("region", {
    name: "Final report",
    exact: true,
  });
  const terminal = page.getByRole("region", { name: "Terminal", exact: true });

  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(ci.panel).toBeVisible();
  await ci.judges("main");
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await mounted.showDevelopment();

  // Reading a story's final report selects and highlights it, and Intent judges its branch.
  await developmentCard(failingStory.title).readReport();
  await expect.element(report).toBeVisible();
  await developmentCard(failingStory.title).isSelected(true);
  await mounted.showIntent();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", failingStory.identity);
  await ci.judges(failingStory.branch);
  await ci.answers("Failed at fa11ed0 (Break the login)");
  await mounted.showDevelopment();

  // Another story's final report moves the selection and Intent's branch there.
  await developmentCard(runningStory.title).readReport();
  await expect
    .element(
      report.getByRole("heading", { name: runningStory.title, exact: true }),
    )
    .toBeVisible();
  await developmentCard(runningStory.title).isSelected(true);
  await developmentCard(failingStory.title).isSelected(false);
  await mounted.showIntent();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", runningStory.identity);
  await ci.judges(runningStory.branch);
  await mounted.showDevelopment();

  // A card's toggle selects without changing the panel; closing the panel keeps that selection.
  await developmentCard(failingStory.title).toggle();
  await developmentCard(failingStory.title).isSelected(true);
  await developmentCard(runningStory.title).isSelected(false);
  await expect
    .element(
      report.getByRole("heading", { name: runningStory.title, exact: true }),
    )
    .toBeVisible();
  await userEvent.click(
    report.getByRole("button", { name: "Close", exact: true }),
  );
  await expect.element(report).not.toBeInTheDocument();
  await developmentCard(failingStory.title).isSelected(true);
  await developmentCard(runningStory.title).isSelected(false);
  await mounted.showIntent();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", failingStory.identity);
  await ci.judges(failingStory.branch);
  await mounted.showDevelopment();

  // Showing a session attached to no story clears the selection, and CI status judges main.
  await developmentCard(failingStory.title).readReport();
  await developmentCard(failingStory.title).isSelected(true);
  await showSidebarSession(adHocTitle);
  await expect.element(terminal).toBeVisible();
  await developmentCard(failingStory.title).isSelected(false);
  await mounted.showIntent();
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await ci.judges("main");

  // Closing that session's terminal with no story selected leaves Intent at project scope.
  await mounted.showDevelopment();
  await userEvent.click(
    terminal.getByRole("button", { name: "Close", exact: true }),
  );
  await expect.element(terminal).not.toBeInTheDocument();
  await developmentCard(failingStory.title).isSelected(false);
  await developmentCard(runningStory.title).isSelected(false);
  await mounted.showIntent();
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await ci.judges("main");
  expect(outsideCalls).toEqual([]);
});
