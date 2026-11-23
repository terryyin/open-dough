// The Dashboard contexts and review reads for a mounted session panel.
import { createElement, type ReactElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { ReviewedSessionSubject } from "../../src/reviewedWorkSubject.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
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

export const adHocSession: ReviewedSessionSubject = {
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

// No session is started, kept or running on the machine.
const launches = machineSessionsAnswering({
  answer: makeMe.aMachineAnswer.please(),
});

// A mounted session panel with its review service.
export function onReviewPage(source: ReviewSource, panel: ReactElement) {
  return createElement(ProjectsOnPage, {
    projects: [doughnut],
    replaceProjects: () => undefined,
    children: createElement(SessionsSidebarOnPage, {
      value: sidebar,
      children: createElement(LaunchesOnPage, {
        value: launches,
        children: createElement(PageReadsOnPage, {
          reads: pageReadsSupplying({ review: source }),
          children: panel,
        }),
      }),
    }),
  });
}
