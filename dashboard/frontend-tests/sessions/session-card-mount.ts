import { createElement } from "react";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderStorySeed } from "../../../Distribution/tests/support/published-seed.mjs";
import { recordStoryState } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { computeBasis } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-story-state-basis.mjs";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import type { MachineSessionsRead } from "../../src/machineSessionsRevision.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { MarkDoneResult } from "../../src/sessionRecordRequests.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import { withPagePreferences } from "../../test-support/component-mount/framePreferences.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import type { InstructionTranscriptionSource } from "../../src/instructionTranscriptionSource.ts";
import { boardFrameObservationSupplying } from "../navigation/board-frame-observation-supply.ts";
import { boardWork, story } from "../navigation/board-work.ts";

const readyStoryFile = "seeds/SEED-1.md";
const readyStoryHref = `${readyStoryFile}#ship-launch-guide`;

export const readyStory = makeMe.aWorkEntry
  .with({
    identity: "SEED-1#ship-launch-guide",
    canonical: {
      kind: "snapshot",
      recorded: readyStoryHref,
      url: `https://example.test/${readyStoryHref}`,
      revision: "a".repeat(40),
    },
    title: "Ship the launch guide",
  })
  .please();

export const otherStory = story("Keep the session history", 2);
const work = boardWork([readyStory, otherStory]);

const readyExecution = () => makeMe.aLaunchRecord.executing(readyStory);
export const execution = readyExecution().please();
export const unknown = makeMe.anObservedLaunch
  .of(execution)
  .withSessionState(makeMe.aSessionState.unknown().please())
  .please();

const canonical = renderStorySeed(
  {
    identity: readyStory.identity,
    title: readyStory.title,
    href: readyStory.canonical.recorded,
  },
  "## Goal\n\nShip the launch guide.",
);
const preparedSeed: unknown = recordStoryState(canonical, {
  href: readyStory.canonical.recorded,
  identity: readyStory.identity,
  refinement: "refined",
  approach: "planless",
  assessment: "ready",
  expectedBasis: computeBasis(canonical),
}).source;
if (typeof preparedSeed !== "string") {
  throw new Error("Could not prepare the ready story.");
}
const readySeed = preparedSeed;

export function workingSession(record: LaunchRecord) {
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.loaded("working").please())
    .please();
}

export function markedExecution(): MarkDoneResult {
  return {
    kind: "marked",
    record: makeMe.anObservedLaunch
      .of(readyExecution().markedDone().please())
      .withSessionState(makeMe.aSessionState.retained("review").please())
      .please(),
  };
}

export function holdExecutionMark() {
  let release: () => void = () => {
    throw new Error("Execution mark is missing its answer.");
  };
  const answer = new Promise<MarkDoneResult>((resolve) => {
    release = () => {
      resolve(markedExecution());
    };
  });
  return { answer, release };
}

export function sessionsReading(
  revision: string,
  ...records: LaunchWithState[]
): MachineSessionsRead {
  return { ...makeMe.aMachineAnswer.observing(...records).please(), revision };
}

export async function mountSessionCards({
  reading,
  published = work,
  done,
  deleteRecord,
  markDone,
  markRead,
  machineReads = {},
  readRunningCursorSessions,
  readFinalReport,
  transcription,
  openTerminal,
  storeTerminalImage,
  viewport = { width: 1200, height: 840 },
  otherProjects = [],
}: {
  reading?: MachineSessionsRead;
  published?: PublishedWork;
  done?: DoneRecordReadSource;
  machineReads?: Partial<
    Pick<
      MachineReadSource,
      "readSessionsSince" | "readHistorySince" | "waitForAttemptChange"
    >
  >;
  readRunningCursorSessions?: SessionServices["readRunningCursorSessions"];
  deleteRecord?: MachineReadSource["deleteRecord"];
  markDone?: MachineReadSource["markDone"];
  markRead?: MachineReadSource["markRead"];
  readFinalReport?: SessionServices["readFinalReport"];
  transcription?: InstructionTranscriptionSource;
  viewport?: { width: number; height: number };
  openTerminal?: SessionServices["openTerminal"];
  storeTerminalImage?: SessionServices["storeTerminalImage"];
  otherProjects?: readonly PublishedWork[];
}) {
  withPagePreferences();
  const projects = [published, ...otherProjects];
  const supply = boardFrameObservationSupplying(projects);
  const defaults = pageReadsSupplying({});
  let next = Promise.resolve(reading);
  const readSessionsSince = vi.fn<MachineReadSource["readSessionsSince"]>(
    machineReads.readSessionsSince ?? (() => next),
  );
  const reads = pageReadsSupplying({
    ...(transcription === undefined ? {} : { transcription }),
    ...(done === undefined ? {} : { done }),
    observation: {
      ...supply.observation,
      readDetailFile: (...args) =>
        args[1].endsWith(readyStoryFile)
          ? Promise.resolve(readySeed)
          : supply.observation.readDetailFile(...args),
    },
    machine: {
      ...supply.machine,
      ...machineReads,
      readSessionsSince,
      deleteRecord: deleteRecord ?? defaults.machine.deleteRecord,
      markDone: markDone ?? defaults.machine.markDone,
      markRead: markRead ?? defaults.machine.markRead,
    },
    sessions: {
      ...defaults.sessions,
      readFinalReport: readFinalReport ?? defaults.sessions.readFinalReport,
      readHostStatus: () =>
        Promise.resolve(
          makeMe.aHostStatus
            .with({ cpuPercent: null, freeBytes: null })
            .please(),
        ),
      readRunningCursorSessions:
        readRunningCursorSessions ??
        defaults.sessions.readRunningCursorSessions,
      openTerminal: openTerminal ?? defaults.sessions.openTerminal,
      storeTerminalImage:
        storeTerminalImage ?? defaults.sessions.storeTerminalImage,
    },
  });
  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: projects.map(({ source }) => source),
      replaceProjects: () => undefined,
      children: createElement(ConfiguredDashboard, {
        reads,
        settingsOpen: false,
        onOpenSettings: () => undefined,
        onDashboardReady: () => undefined,
      }),
    }),
    { viewport, fillsViewport: true },
  );
  return {
    readSessionsSince,
    answerWith: (
      answer:
        | MachineSessionsRead
        | undefined
        | Promise<MachineSessionsRead | undefined>,
    ) => {
      next = Promise.resolve(answer);
    },
  };
}

export function revealPage() {
  const visibility = vi.spyOn(document, "visibilityState", "get");
  onTestFinished(() => {
    visibility.mockRestore();
  });
  visibility.mockReturnValue("hidden");
  document.dispatchEvent(new Event("visibilitychange"));
  return () => {
    visibility.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
  };
}
