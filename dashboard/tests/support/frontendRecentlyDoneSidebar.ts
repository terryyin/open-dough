// Three-project machine fixtures and crowded room setup for Frontend Recently
// done sidebar journeys. Association and story-review answers stay elsewhere.

import type { Page, Request } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord, LaunchWithState } from "../../src/launchRecord.ts";
import { recentlyDoneSessionsInitialLimit } from "../../src/agentLaunch.ts";
import { cursorRunnerSessionsEndpoint } from "../../src/cursorRunnerSessions.ts";
import { expectProjectChoice } from "../dashboardPage.ts";
import { wide } from "../cursorSessionsSidebarResizePage.ts";
import { showRecentlyDone } from "../recentlyDoneSessionsSidebarPage.ts";
import { openRunningList } from "../runningCursorList.ts";
import { crowd } from "../runningCursorSessionsPage.ts";
import { expect } from "./frontendApp.ts";
import {
  doughnutSource,
  openDoughSource,
  putFrontendMachine,
  pygardonSource,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

// Configures Open Dough, Doughnut and Pygardon for a Frontend journey.
export function putFrontendThreeProjects(services: FrontendServiceState): void {
  Object.assign(services, {
    projects: [openDoughSource, doughnutSource, pygardonSource],
  });
}

// Observes kept launches as the machine answers them.
export function putFrontendObservedLaunches(
  services: FrontendServiceState,
  ...records: LaunchWithState[]
): void {
  putFrontendMachine(
    services,
    makeMe.aMachineAnswer.observing(...records).please(),
  );
}

export function observedDone(
  record: LaunchRecord,
  state: "retained" | "unavailable" = "retained",
): LaunchWithState {
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(
      state === "unavailable"
        ? makeMe.aSessionState.unavailable().please()
        : makeMe.aSessionState.retained("review").please(),
    )
    .please();
}

export function observedOpen(record: LaunchRecord): LaunchWithState {
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.loaded("working").please())
    .please();
}

// Opens the three-project Frontend page settled on Pygardon.
export async function openFrontendThreeProjects(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
  putFrontendThreeProjects(services);
  await page.goto("/?project=pygardon");
  await expectProjectChoice(page, "Pygardon");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
}

// Crowded open list, Running Cursor rows, and Done rows for the three-list
// room, against controlled machine and Cursor-runner answers.
export async function expandThreeCrowdedFrontend(
  page: Page,
  services: FrontendServiceState,
): Promise<{
  shown: Awaited<ReturnType<typeof showRecentlyDone>>;
  expectNothingChanged: () => void;
}> {
  await page.setViewportSize(wide);
  const now = Date.now();
  const held = makeMe.aLaunchRecord
    .adHoc({ instruction: "hold this session", title: "hold this session" })
    .inCursorSession({
      sessionId: "12345678-1234-4123-8123-123456789abc",
      continuation: { workspace: "/Users/test/git/open-dough" },
    })
    .please();
  const openCrowd = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const name = `Crowded session ${String(index + 1)}`;
    return makeMe.aLaunchRecord
      .adHoc({ title: name, instruction: name })
      .inClaudeSession({ sessionId: `crowd-open-${String(index)}` })
      .launchedAt(new Date(now - (index + 1) * 60_000).toISOString())
      .please();
  });
  const done = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const title = `Done crowded ${String(index + 1)}`;
    return makeMe.aLaunchRecord
      .adHoc({ instruction: title, title })
      .inClaudeSession({ sessionId: `crowd-done-${String(index)}` })
      .launchedAt(new Date(now - (index + 1) * 120_000).toISOString())
      .markedDoneAt(new Date(now - (index + 1) * 60_000).toISOString())
      .please();
  });
  putFrontendObservedLaunches(
    services,
    observedOpen(held),
    ...openCrowd.map(observedOpen),
    ...done.map((record) => observedDone(record)),
  );
  const runningSessions = Array.from(Array(crowd).keys(), (index) => ({
    record: {
      ...held,
      session: makeMe.aHostSession
        .cursor({
          sessionId: `6f1e8c2a-9b34-4d5e-8f70-${String(index).padStart(12, "0")}`,
          continuation: { workspace: "/Users/test/git/open-dough" },
        })
        .named(held.session.name)
        .please(),
    },
    label: "working" as const,
  }));
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    (route) =>
      route.fulfill({
        json: { runner: "running", sessions: runningSessions },
      }),
  );
  const mutating: string[] = [];
  const note = (request: Request) => {
    if (request.method() !== "GET") mutating.push(request.url());
  };
  page.on("request", note);
  await openFrontendThreeProjects(page, services);
  const shown = await showRecentlyDone(page);
  await openRunningList(page);
  await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  await expect(shown.running.listed).toHaveCount(crowd);
  // Resize and reload prove no launch/attach/done/delete asks.
  const expectNothingChanged = () => {
    expect(mutating).toEqual([]);
  };
  return { shown, expectNothingChanged };
}
