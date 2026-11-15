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
import type { HostStatus } from "../../src/hostStatus.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { openDoughCandidatesRecord } from "../intentCandidatesFixtures.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  defaultFrontendPublishedFiles,
  frontendPublishedWith,
  frontendRevision,
  openDoughSource,
  takenBacklogMarkdown,
  type FrontendStories,
} from "./frontendPublishedFixtures.ts";

export {
  doughnutSource,
  frontendRevision,
  frontendStoryLaunch,
  openDoughSource,
  pygardonSource,
  takenBacklogMarkdown,
  type FrontendStories,
} from "./frontendPublishedFixtures.ts";

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
};

export function defaultFrontendServiceState(
  options: {
    readonly projects?: readonly PublishedSource[];
    readonly backlog?: string;
    readonly machine?: MachineAnswer;
  } = {},
): FrontendServiceState {
  return {
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
  };
}

// Mutates substitute answers in place; Object.assign keeps no-param-reassign clean.
export function putFrontendMachine(
  services: FrontendServiceState,
  machine: MachineAnswer | undefined,
): void {
  Object.assign(services, { machine });
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

export function putFrontendHostStatus(
  services: FrontendServiceState,
  hostStatus: HostStatus | undefined,
): void {
  Object.assign(services, { hostStatus });
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
  Object.assign(services, {
    revision,
    backlog: published.backlog,
    files: { ...published.files },
  });
}
