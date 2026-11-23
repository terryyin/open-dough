import { createElement } from "react";
import { onTestFinished, vi } from "vitest";
import {
  useAgentLaunches,
  type MachineSessions,
} from "../../src/agentLaunches.ts";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { useObservedRevisionDelivery } from "../../src/observedRevisionDelivery.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { readPublishedWork } from "../../src/publishedWorkRead.ts";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import { withPagePreferences } from "../../test-support/component-mount/framePreferences.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { noSessions } from "./board-mount.ts";

vi.mock(import("../../src/agentLaunches.ts"), () => ({
  useAgentLaunches: vi.fn(),
}));
vi.mock(import("../../src/publishedWorkRead.ts"), () => ({
  readPublishedWork: vi.fn(),
}));
vi.mock(import("../../src/observedRevisionDelivery.ts"), () => ({
  useObservedRevisionDelivery: vi.fn(),
}));

export const workRead = vi.mocked(readPublishedWork);

export async function mountBoardFrame(
  work: PublishedWork,
  viewport: { width: number; height: number },
  view: "stories" | "roster" = "stories",
  sessions: MachineSessions = noSessions,
  {
    otherWork = [],
    initialReadError,
    intentReads,
    done,
  }: {
    otherWork?: readonly PublishedWork[];
    initialReadError?: Error;
    intentReads?: IntentReadSource;
    done?: DoneRecordReadSource;
  } = {},
) {
  withPagePreferences();
  const originalUrl = location.href;
  const originalState: unknown = history.state;
  if (view === "roster") {
    const url = new URL(originalUrl);
    url.searchParams.set("view", "roster");
    url.searchParams.set("project", work.source.id);
    history.replaceState(originalState, "", url);
  }
  onTestFinished(() => {
    history.replaceState(originalState, "", originalUrl);
  });
  const snapshots = [work, ...otherWork];
  workRead.mockReset().mockImplementation((source) => {
    const snapshot = snapshots.find(
      ({ source: each }) => each.id === source.id,
    );
    return snapshot === undefined
      ? Promise.reject(new Error(`No published work fixture for ${source.id}.`))
      : Promise.resolve(snapshot);
  });
  if (initialReadError !== undefined)
    workRead.mockRejectedValueOnce(initialReadError);
  vi.mocked(useAgentLaunches).mockReturnValue(sessions);
  let revisionAnswers:
    Parameters<typeof useObservedRevisionDelivery>[0] | undefined;
  vi.mocked(useObservedRevisionDelivery).mockImplementation((answers) => {
    revisionAnswers = answers;
    return "connected";
  });
  const dashboard = createElement(ProjectsOnPage, {
    projects: snapshots.map(({ source }) => source),
    replaceProjects: () => {},
    children: createElement(ConfiguredDashboard, {
      reads: pageReadsSupplying({
        sessions: authenticatedSessionServices,
        ...(intentReads === undefined ? {} : { intent: intentReads }),
        ...(done === undefined ? {} : { done }),
      }),
      settingsOpen: false,
      onOpenSettings: () => {},
      onDashboardReady: () => {},
    }),
  });
  await mountComponent(dashboard, { viewport, fillsViewport: true });
  const delivery = () => {
    if (revisionAnswers === undefined)
      throw new Error("The Board hasn't bound its revision delivery.");
    return revisionAnswers;
  };
  return {
    revisionChanged: (revision: string) => {
      delivery().onChanged(revision);
    },
    revisionCheckFailed: (error: Error) => {
      delivery().onFailed(error);
    },
  };
}
