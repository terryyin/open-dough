// The page contexts the Review changes panel reads, as typed values: Doughnut
// as the page's one project, a closed Sessions sidebar, a machine with no
// sessions, and the case's review source answering the panel's reads.
import { createElement, type ReactElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { ReviewedWorkSubject } from "../../src/reviewedWorkSubject.ts";
import {
  ReviewSourceOnPage,
  type ReviewSource,
} from "../../src/reviewSource.ts";
import {
  SessionsSidebarOnPage,
  type SessionsSidebarState,
} from "../../src/SessionsSidebar.tsx";

const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();

// A Done story of Doughnut, and an ad hoc session of it.
export const doneStory: ReviewedWorkSubject = {
  source: doughnut.id,
  identity: "SEED-1#done-story",
};
export const adHocSession: ReviewedWorkSubject = {
  source: doughnut.id,
  host: "claude",
  session: "74800000-0000-4000-8000-0000000000aa",
};

const sidebar: SessionsSidebarState = {
  open: false,
  toggle: () => undefined,
  closeOverPage: () => undefined,
  records: [],
  alerts: { available: true },
};

const never = <T>() => new Promise<T>(() => undefined);
const answer = makeMe.aMachineAnswer.please();

// No session is started, kept or running on the machine.
const launches: MachineSessions = {
  rereadOffers: () => undefined,
  rereadSessions: () => undefined,
  creations: answer.creations,
  hostOperations: answer.hostOperations,
  readHistory: () => undefined,
  records: [],
  workspaces: answer.workspaces,
  sessionsSettled: true,
  alerts: { available: true },
  feedbackMaintenance: answer.feedbackMaintenance,
  keptStartOf: () => undefined,
  runningStartOf: () => undefined,
  launched: [],
  establishesStart: () => false,
  sessionPolicyOffer: () => "reading",
  optionsOffer: () => undefined,
  recoveriesOf: () => [],
  attemptEvidence: "read",
  continueStartup: () => undefined,
  updateWorktreeAndRetry: () => undefined,
  recheckStartups: () => undefined,
  attemptOf: () => undefined,
  storyStartupOf: () => undefined,
  storyStartupsOf: () => [],
  start: never,
  startAdHoc: never,
  adHocAttemptOf: () => undefined,
  markDone: never,
  markRead: never,
  deleteRecord: never,
  recoverSession: never,
  stopSession: never,
  readSession: never,
};

// `panel` on the page, its reviews read from `source`.
export function onReviewPage(source: ReviewSource, panel: ReactElement) {
  return createElement(ProjectsOnPage, {
    projects: [doughnut],
    replaceProjects: () => undefined,
    children: createElement(SessionsSidebarOnPage, {
      value: sidebar,
      children: createElement(LaunchesOnPage, {
        value: launches,
        children: createElement(ReviewSourceOnPage, {
          value: source,
          children: panel,
        }),
      }),
    }),
  });
}
