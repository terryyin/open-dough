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
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import { mountSidePanelIntentPage } from "./intent-ci-side-panel-mount.ts";
import {
  failingStory,
  fullSha,
  inertCiReads,
  judgedStatus,
  openDoughSource,
  runningStory,
  takenStoryEntry,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const adHocTitle = "Open Dough session";

function goneWorkspaceSession(
  story: typeof failingStory,
  shortId: string,
): LaunchWithState {
  return makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .executing({ identity: story.identity, title: story.title })
        .inClaudeSession({ sessionId: `${shortId}-session`, shortId })
        .onStoryBranch({ workspace: `/gone/${shortId}`, branch: story.branch })
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("review").please())
    .withWorkspace("missing")
    .please();
}

const cardOf = (title: string) =>
  page.getByRole("article", { name: title, exact: true });

async function expectCardSelected(title: string, selected: boolean) {
  await expect
    .poll(() =>
      cardOf(title).element().classList.contains("story-card-selected"),
    )
    .toBe(selected);
  if (selected) {
    const element = cardOf(title).element();
    const style = getComputedStyle(element);
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--accent-soft)";
    element.append(probe);
    const accentSoft = getComputedStyle(probe).backgroundColor;
    probe.remove();
    expect(style.boxShadow).toMatch(/inset/);
    expect(style.backgroundColor).toBe(accentSoft);
  }
}

test("the Side panel's content selects its story for Intent's lens and CI status, closing it keeps the selection at that moment, and an ad hoc session clears it to main", async () => {
  const work = makeMe.aPublishedWork
    .with({
      source: openDoughSource,
      revision: fullSha("4774f60"),
      retrievedAt: new Date("2026-11-05T12:00:00.000Z"),
      direction: "",
      taken: [
        takenStoryEntry({ ...failingStory, agent: "Akiho" }),
        takenStoryEntry({ ...runningStory, agent: "Sola" }),
      ],
      backlog: [],
    })
    .please();
  const machine = makeMe.aMachineAnswer
    .observing(
      goneWorkspaceSession(failingStory, "failing"),
      goneWorkspaceSession(runningStory, "running"),
    )
    .observingOpen(
      makeMe.aLaunchRecord
        .adHoc({ instruction: adHocTitle, title: adHocTitle })
        .please(),
    )
    .please();
  const mainPassed = judgedStatus("main", "pass", "4774f60", "Add login");
  const failingFailed = judgedStatus(
    failingStory.branch,
    "failed",
    "fa11ed0",
    "Break the login",
  );
  const runningInProgress = judgedStatus(
    runningStory.branch,
    "running",
    "70a0001",
    "Start the story",
  );

  await mountSidePanelIntentPage({
    work,
    records: machine.records,
    hostOperations: machine.hostOperations,
    readSource: {
      readLocations: () => Promise.resolve({ status: "not-configured" }),
      readFile: () => Promise.resolve(""),
      readCandidates: () => Promise.resolve({ status: "absent" }),
    },
    ciReads: inertCiReads({
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
  });

  const ci = intentCiStatus();
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const developmentButton = page.getByRole("button", {
    name: "Development",
    exact: true,
  });
  const intentButton = page.getByRole("button", {
    name: "Intent",
    exact: true,
  });
  const report = page.getByRole("region", {
    name: "Final report",
    exact: true,
  });
  const terminal = page.getByRole("region", { name: "Terminal", exact: true });
  const readReport = async (title: string) => {
    const button = cardOf(title).getByRole("button", {
      name: "Read final report",
      exact: true,
    });
    button.element().focus();
    await userEvent.keyboard("{Enter}");
  };

  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(ci.panel).toBeVisible();
  await ci.judges("main");
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await userEvent.click(developmentButton);

  // Reading a story's final report selects and highlights it, and Intent judges its branch.
  await readReport(failingStory.title);
  await expect.element(report).toBeVisible();
  await expectCardSelected(failingStory.title, true);
  await userEvent.click(intentButton);
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", failingStory.identity);
  await ci.judges(failingStory.branch);
  await ci.answers("Failed at fa11ed0 (Break the login)");
  await userEvent.click(developmentButton);

  // Another story's final report moves the selection and Intent's branch there.
  await readReport(runningStory.title);
  await expect
    .element(
      report.getByRole("heading", { name: runningStory.title, exact: true }),
    )
    .toBeVisible();
  await expectCardSelected(runningStory.title, true);
  await expectCardSelected(failingStory.title, false);
  await userEvent.click(intentButton);
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", runningStory.identity);
  await ci.judges(runningStory.branch);
  await userEvent.click(developmentButton);

  // A card's toggle selects without changing the panel; closing the panel keeps that selection.
  await userEvent.click(
    cardOf(failingStory.title).getByRole("heading", {
      name: failingStory.title,
      exact: true,
    }),
  );
  await expectCardSelected(failingStory.title, true);
  await expectCardSelected(runningStory.title, false);
  await expect
    .element(
      report.getByRole("heading", { name: runningStory.title, exact: true }),
    )
    .toBeVisible();
  await userEvent.click(
    report.getByRole("button", { name: "Close", exact: true }),
  );
  await expect.element(report).not.toBeInTheDocument();
  await expectCardSelected(failingStory.title, true);
  await expectCardSelected(runningStory.title, false);
  await userEvent.click(intentButton);
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", failingStory.identity);
  await ci.judges(failingStory.branch);
  await userEvent.click(developmentButton);

  // Showing a session attached to no story clears the selection, and CI status judges main.
  await readReport(failingStory.title);
  await expectCardSelected(failingStory.title, true);
  await userEvent.click(
    page.getByRole("button", { name: "Sessions", exact: true }),
  );
  const sidebar = page.getByRole("complementary", {
    name: "Sessions sidebar",
    exact: true,
  });
  await userEvent.click(
    sidebar.getByRole("button", { name: adHocTitle, exact: true }),
  );
  await expect.element(terminal).toBeVisible();
  await expectCardSelected(failingStory.title, false);
  await userEvent.click(intentButton);
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await ci.judges("main");

  // Closing that session's terminal with no story selected leaves Intent at project scope.
  await userEvent.click(developmentButton);
  await userEvent.click(
    terminal.getByRole("button", { name: "Close", exact: true }),
  );
  await expect.element(terminal).not.toBeInTheDocument();
  await expectCardSelected(failingStory.title, false);
  await expectCardSelected(runningStory.title, false);
  await userEvent.click(intentButton);
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await ci.judges("main");
});
