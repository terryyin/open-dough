import { createElement } from "react";
import { onTestFinished, vi } from "vitest";
import { useAgentLaunches } from "../../src/agentLaunches.ts";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import { useObservedRevisionDelivery } from "../../src/observedRevisionDelivery.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { readPublishedWork } from "../../src/publishedWorkRead.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
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
) {
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
  workRead.mockReset().mockResolvedValue(work);
  vi.mocked(useAgentLaunches).mockReturnValue(noSessions);
  let revisionAnswers:
    Parameters<typeof useObservedRevisionDelivery>[0] | undefined;
  vi.mocked(useObservedRevisionDelivery).mockImplementation((answers) => {
    revisionAnswers = answers;
    return "connected";
  });
  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: [work.source],
      replaceProjects: () => {},
      children: createElement(ConfiguredDashboard, {
        settingsOpen: false,
        onOpenSettings: () => {},
        onDashboardReady: () => {},
      }),
    }),
    { viewport, fillsViewport: true },
  );
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
