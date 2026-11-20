// Shared typed mount for the open Sessions list: page contexts, observed
// launches, and the production open-list reading used by the mounted family.
import { createElement, type ReactElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { SessionsOnPage, type PageSessions } from "../../src/pageSessions.ts";
import {
  SessionsButton,
  SessionsSidebarOnPage,
  type SessionsSidebarState,
} from "../../src/SessionsSidebar.tsx";
import { SessionsSidebarOpenList } from "../../src/SessionsSidebarOpenList.tsx";

export const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();

const pageSessions: PageSessions = {
  hostOperations: {
    claude: {
      attach: true,
      stop: false,
      doneStop: false,
      localDone: true,
      launchedSessions: true,
    },
  },
  presentTerminal: () => undefined,
  openSession: () => undefined,
  shownSession: undefined,
  markDone: () => Promise.resolve("marked" as const),
  markRead: () => Promise.resolve(true),
  deleteRecord: () => Promise.resolve({ kind: "deleted" as const }),
  recoverSession: () => Promise.resolve(undefined),
  stopSession: () => Promise.resolve(undefined),
};

export function present<T>(found: T | null | undefined, what: string): T {
  if (found === null || found === undefined) throw new Error(`No ${what}`);
  return found;
}

export function observe(
  records: readonly { record: LaunchRecord; state: SessionState }[],
): readonly LaunchWithState[] {
  return makeMe.aMachineAnswer
    .observing(
      ...records.map(({ record, state }) =>
        makeMe.anObservedLaunch.of(record).withSessionState(state).please(),
      ),
    )
    .please().records;
}

export type OpenSessionsReadingOptions = {
  /** Sessions button in the tree so the attention badge can be observed. */
  withAttentionBadge?: boolean;
  /** Sidebar width for compact-row layout; adds the production sidebar class. */
  sidebarWidth?: string;
};

export function openReading(
  records: readonly LaunchWithState[],
  options: OpenSessionsReadingOptions = {},
): ReactElement {
  const sidebar: SessionsSidebarState = {
    open: true,
    toggle: () => undefined,
    closeOverPage: () => undefined,
    records,
    alerts: { available: true },
  };
  const list = createElement(SessionsSidebarOpenList, {
    records,
    alerts: sidebar.alerts,
    open: true,
    onOpen: () => undefined,
  });
  const aside = createElement(
    "aside",
    {
      key: "sidebar",
      id: "sessions-sidebar",
      className:
        options.sidebarWidth !== undefined ? "sessions-sidebar" : undefined,
      "aria-label": "Sessions sidebar",
      style:
        options.sidebarWidth !== undefined
          ? { width: options.sidebarWidth }
          : undefined,
    },
    list,
  );
  const children = options.withAttentionBadge
    ? [
        createElement(
          "div",
          { key: "banner", className: "banner" },
          createElement(SessionsButton, null),
        ),
        aside,
      ]
    : aside;
  return createElement(ProjectsOnPage, {
    projects: [doughnut],
    replaceProjects: () => undefined,
    children: createElement(SessionsOnPage, {
      value: pageSessions,
      children: createElement(SessionsSidebarOnPage, {
        value: sidebar,
        children,
      }),
    }),
  });
}
