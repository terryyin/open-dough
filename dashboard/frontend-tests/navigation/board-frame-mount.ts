import { createElement } from "react";
import { expect, onTestFinished } from "vitest";
import { page } from "vitest/browser";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { AcceptanceAnswer } from "../../src/agentLaunchClient.ts";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { StoryReviewStatesReadSource } from "../../src/storyReviewStatesReadSource.ts";
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
  readonly read?: MachineReadSource["readSessionsSince"];
  readonly accept?: (
    ...args: Parameters<MachineReadSource["requestAcceptance"]>
  ) => Promise<AcceptanceAnswer>;
  readonly association?: MachineReadSource["readCompletedStoryAssociation"];
};

export async function mountBoardFrame(
  work: PublishedWork,
  viewport: { width: number; height: number },
  view: "stories" | "roster" = "stories",
  machine: BoardFrameMachine = {},
  {
    otherWork = [],
    initialReadError,
    intentReads,
    done,
    ci,
    review,
    reviewStates,
    doneCatalog,
    sessions = authenticatedSessionServices,
    awaitSessionsRead = true,
  }: {
    otherWork?: readonly PublishedWork[];
    initialReadError?: Error;
    intentReads?: IntentReadSource;
    done?: DoneRecordReadSource;
    ci?: IntentCiReadSource;
    review?: ReviewSource;
    // Each project's story review states, read and changed.
    reviewStates?: StoryReviewStatesReadSource;
    // A case-owned published done catalog read for every project.
    doneCatalog?: PublishedObservationReadSource["readDoneCatalog"];
    // The shown session's final report, host status and terminal.
    sessions?: SessionServices;
    awaitSessionsRead?: boolean;
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
    ...(initialReadError === undefined ? {} : { initialReadError }),
    machineAnswer: machine.answer ?? emptyMachineAnswer(),
    ...(machine.read === undefined ? {} : { machineRead: machine.read }),
    ...(machine.accept === undefined ? {} : { accept: machine.accept }),
    ...(machine.association === undefined
      ? {}
      : { association: machine.association }),
    ...(doneCatalog === undefined ? {} : { doneCatalog }),
  });
  const dashboard = createElement(ProjectsOnPage, {
    projects: snapshots.map(({ source }) => source),
    replaceProjects: () => {},
    children: createElement(ConfiguredDashboard, {
      reads: pageReadsSupplying({
        sessions,
        observation: supply.observation,
        machine: supply.machine,
        ...(intentReads === undefined ? {} : { intent: intentReads }),
        ...(done === undefined ? {} : { done }),
        ...(ci === undefined ? {} : { ci }),
        ...(review === undefined ? {} : { review }),
        ...(reviewStates === undefined ? {} : { reviewStates }),
      }),
      settingsOpen: false,
      onOpenSettings: () => {},
      onDashboardReady: () => {},
    }),
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
        if (
          awaitSessionsRead &&
          page.getByText("Reading sessions…").query() !== null
        )
          return false;
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
