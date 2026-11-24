import { createElement, useState } from "react";
import { expect, onTestFinished } from "vitest";
import { page } from "vitest/browser";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { AcceptanceAnswer } from "../../src/agentLaunchClient.ts";
import {
  DashboardApplication,
  type DashboardSettingsSources,
} from "../../src/App.tsx";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { PageReads } from "../../src/pageReads.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import {
  authenticatedSessionServices,
  type SessionServices,
} from "../../src/sessionServices.ts";
import { withPagePreferences } from "../../test-support/component-mount/framePreferences.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  boardFrameObservationSupplying,
  emptyMachineAnswer,
  forceRevisionStreamDelivery,
} from "./board-frame-observation-supply.ts";

export type BoardFrameMachine = {
  readonly answer?: MachineAnswer & { readonly revision?: string };
  readonly accept?: (
    ...args: Parameters<MachineReadSource["requestAcceptance"]>
  ) => Promise<AcceptanceAnswer>;
};

function DashboardWithSettings({
  projects: initialProjects,
  reads,
  settingsSources,
}: {
  readonly projects: readonly PublishedSource[];
  readonly reads: PageReads;
  readonly settingsSources: DashboardSettingsSources;
}) {
  const [projects, replaceProjects] = useState(initialProjects);
  return createElement(DashboardApplication, {
    configuration: { projects, problem: undefined, replaceProjects },
    reads,
    settingsSources,
  });
}

export async function mountBoardFrame(
  work: PublishedWork,
  viewport: { width: number; height: number },
  view: "stories" | "roster" = "stories",
  machine: BoardFrameMachine = {},
  {
    otherWork = [],
    initialSnapshot,
    intentReads,
    done,
    ci,
    review,
    sessions = authenticatedSessionServices,
    settingsSources,
  }: {
    otherWork?: readonly PublishedWork[];
    initialSnapshot?: Error | Promise<PublishedWork>;
    intentReads?: IntentReadSource;
    done?: DoneRecordReadSource;
    ci?: IntentCiReadSource;
    review?: ReviewSource;
    sessions?: SessionServices;
    settingsSources?: DashboardSettingsSources;
  } = {},
) {
  withPagePreferences();
  forceRevisionStreamDelivery();
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
  const supply = boardFrameObservationSupplying(snapshots, {
    ...(initialSnapshot === undefined ? {} : { initialSnapshot }),
    machineAnswer: machine.answer ?? emptyMachineAnswer(),
    ...(machine.accept === undefined ? {} : { accept: machine.accept }),
  });
  const projects = snapshots.map(({ source }) => source);
  const reads = pageReadsSupplying({
    sessions,
    observation: supply.observation,
    machine: supply.machine,
    ...(intentReads === undefined ? {} : { intent: intentReads }),
    ...(done === undefined ? {} : { done }),
    ...(ci === undefined ? {} : { ci }),
    ...(review === undefined ? {} : { review }),
  });
  const dashboard =
    settingsSources === undefined
      ? createElement(ProjectsOnPage, {
          projects,
          replaceProjects: () => {},
          children: createElement(ConfiguredDashboard, {
            reads,
            settingsOpen: false,
            onOpenSettings: () => {},
            onDashboardReady: () => {},
          }),
        })
      : createElement(DashboardWithSettings, {
          projects,
          reads,
          settingsSources,
        });
  await mountComponent(dashboard, { viewport, fillsViewport: true });
  // Production launches settle through typed machine reads; wait out the first
  // answer before cases interact so Cancel→Enter reopen is not racing that
  // Board/Recently done update (Slice 4 removed the sync useAgentLaunches mock).
  // Failed or empty published reads show no Board — only wait when Taken is up.
  if (view === "stories") {
    await expect
      .element(page.getByRole("button", { name: /^Start session in / }))
      .toBeVisible();
    await expect
      .poll(() => {
        const taken = page.getByRole("region", { name: "Taken" }).query();
        if (taken === null) return true;
        if (page.getByText("Reading sessions…").query() !== null) return false;
        return (
          page
            .getByRole("region", { name: "Taken" })
            .getByText(/^\d+ entr(?:y|ies)$/)
            .query() !== null
        );
      })
      .toBe(true);
  }
  return {
    revisionChanged: supply.revisionChanged,
    revisionCheckFailed: supply.revisionCheckFailed,
    queueSnapshot: supply.queueSnapshot,
    snapshotAsks: supply.snapshotAsks,
    detailPaths: supply.detailPaths,
    subscriptionCount: supply.subscriptionCount,
  };
}
