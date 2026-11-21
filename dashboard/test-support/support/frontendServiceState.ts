// Mutable substitute answers a frontend-only journey holds: projects,
// revision, backlog, files, machine and host status, with put helpers.

import type { IntentCandidatesAnswer } from "../../server/intentCandidatesRead.ts";
import type { IntentLocationsAnswer } from "../../server/intentLocationsRead.ts";
import type {
  MachineAnswer,
  OfferedDefinition,
} from "../../src/agentLaunch.ts";
import {
  offeredShape,
  type OptionsDefinition,
} from "../../src/commandOptions.ts";
import type { Page } from "@playwright/test";
import type { HostStatus } from "../../src/hostStatus.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { openDoughCandidatesRecord } from "../intentCandidatesFixtures.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyBoardFiles } from "../intentCiStoryBoard.ts";
import {
  defaultFrontendPublishedFiles,
  doughnutSource,
  frontendPublishedWith,
  frontendRevision,
  openDoughSource,
  pygardonSource,
  takenBacklogMarkdown,
  type FrontendStories,
} from "./frontendPublishedFixtures.ts";
import type {
  FrontendDonePublication,
  FrontendPublishedSessionsPublication,
} from "./frontendRecentlyDonePublications.ts";

export {
  doughnutSource,
  frontendRevision,
  frontendStoryLaunch,
  openDoughSource,
  pygardonSource,
  takenBacklogMarkdown,
  type FrontendStories,
} from "./frontendPublishedFixtures.ts";

export type {
  FrontendDonePublication,
  FrontendPublishedSessionsPublication,
} from "./frontendRecentlyDonePublications.ts";

export {
  putFrontendDonePublication,
  putFrontendDoneRecords,
  putFrontendPublishedSessions,
} from "./frontendRecentlyDonePublications.ts";

export type FrontendServiceState = {
  projects: PublishedSource[];
  revision: string;
  backlog: string;
  files: Record<string, string>;
  locations: IntentLocationsAnswer;
  candidates: IntentCandidatesAnswer;
  // Undefined while the machine's sessions are unread, as hostStatus.
  machine: MachineAnswer | undefined;
  hostStatus: HostStatus | undefined;
  // Done catalogs and bodies keyed by published source id.
  doneBySource: Record<string, FrontendDonePublication>;
  // Published-session listings keyed by published source id; unarranged
  // sources answer an empty listed set.
  publishedSessionsBySource: Record<
    string,
    FrontendPublishedSessionsPublication
  >;
  // Heads of the story branches a revision check watches, when a case
  // arranges them; unarranged, a check names no branch heads.
  branchHeads?: Record<string, string>;
  // The machine's sessions answer from now on (`makeMe.aMachineAnswer`);
  // undefined keeps them unread.
  answerMachine(machine: MachineAnswer | undefined): void;
  // The host status answer from now on; undefined keeps it unread.
  answerHostStatus(hostStatus: HostStatus | undefined): void;
  // Open Dough, Doughnut and Pygardon configured, in that order.
  listThreeProjects(): void;
};

export function defaultFrontendServiceState(
  options: {
    readonly projects?: readonly PublishedSource[];
    readonly backlog?: string;
    readonly machine?: MachineAnswer;
  } = {},
): FrontendServiceState {
  const state: FrontendServiceState = {
    projects: [...(options.projects ?? [openDoughSource])],
    revision: frontendRevision,
    backlog: options.backlog ?? takenBacklogMarkdown,
    files: defaultFrontendPublishedFiles(),
    locations: {
      revision: frontendRevision,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting("dashboard/tests/example.spec.ts")
          .please(),
      ],
      recovery: undefined,
    },
    candidates: {
      revision: frontendRevision,
      candidates: openDoughCandidatesRecord,
    },
    machine: options.machine ?? makeMe.aMachineAnswer.please(),
    hostStatus: makeMe.aHostStatus
      .with({ cpuPercent: 12, freeBytes: 64_000_000_000 })
      .please(),
    doneBySource: {},
    publishedSessionsBySource: {},
    answerMachine(machine) {
      state.machine = machine;
    },
    answerHostStatus(hostStatus) {
      state.hostStatus = hostStatus;
    },
    listThreeProjects() {
      state.projects = [openDoughSource, doughnutSource, pygardonSource];
    },
  };
  return state;
}

// The machine's sessions read when Open Dough's installed skill offers its
// refinement launches in Claude Code the options of `definition`.
export function machineOffering(definition: OptionsDefinition): MachineAnswer {
  const offered: OfferedDefinition = {
    source: "open-dough",
    workflow: "refinement",
    host: "claude",
    ...offeredShape(definition),
  };
  return makeMe.aMachineAnswer.offering(offered).please();
}

export function putFrontendCandidates(
  services: FrontendServiceState,
  candidates: IntentCandidatesAnswer,
): void {
  Object.assign(services, { candidates });
}

// The project as published with its stories listed as `stories` says, at
// `revision`.
export function putFrontendStories(
  services: FrontendServiceState,
  stories: FrontendStories,
  revision = services.revision,
): void {
  const published = frontendPublishedWith(stories);
  putFrontendPublished(services, {
    revision,
    backlog: published.backlog,
    files: published.files,
  });
}

// Arranges one published revision's backlog and files as substitute answers.
export function putFrontendPublished(
  services: FrontendServiceState,
  published: {
    readonly revision: string;
    readonly backlog: string;
    readonly files: Record<string, string>;
  },
): void {
  Object.assign(services, {
    revision: published.revision,
    backlog: published.backlog,
    files: { ...published.files },
  });
}

// Arranges one published revision's backlog with no other file published.
export function putFrontendBacklog(
  services: FrontendServiceState,
  published: { readonly revision: string; readonly backlog: string },
): void {
  putFrontendPublished(services, { ...published, files: {} });
}

// Publishes the story board's backlog and files.
export function publishCiStoryBoard(services: FrontendServiceState): void {
  Object.assign(services, {
    files: { ...services.files, ...storyBoardFiles },
    backlog: storyBoardFiles[".planning/PRODUCT-BACKLOG.md"],
  });
}

// Publishes Doughnut beside Open Dough, its intent locations not configured.
export async function publishUnconfiguredDoughnut(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
  Object.assign(services, { projects: [...services.projects, doughnutSource] });
  await page.route(
    (url) =>
      url.searchParams.get("intent") === "locations" &&
      url.searchParams.get("source") === doughnutSource.id,
    (route) =>
      route.fulfill({ json: { revision: services.revision, locations: null } }),
  );
}
