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
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { describedRevisions } from "../describedRevisions.ts";
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

// Per-source done catalog and record bodies for Recently done selection.
export type FrontendDonePublication = {
  // Catalog JSON text, a gap string, or an HTTP refusal.
  readonly catalog?:
    | string
    | { readonly gap: string }
    | { readonly status: number; readonly error: string };
  // Done record file name → published text.
  readonly bodies?: Readonly<Record<string, string>>;
};

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
    doneBySource: {},
  };
}

// Arranges the done catalog and bodies one source's authenticated reads answer.
export function putFrontendDonePublication(
  services: FrontendServiceState,
  sourceId: string,
  done: FrontendDonePublication,
): void {
  Object.assign(services, {
    doneBySource: { ...services.doneBySource, [sourceId]: done },
  });
}

// Publishes readable done records for one source from their builder values.
export function putFrontendDoneRecords(
  services: FrontendServiceState,
  sourceId: string,
  records: readonly ReturnType<
    ReturnType<typeof makeMe.aDoneRecord.with>["please"]
  >[],
): void {
  const { done } = describedRevisions(
    makeMe.aRepository
      .withRevision("done", { doneRecords: [...records] })
      .please(),
    { done: services.revision },
  );
  const catalog = done.files[".planning/done/.catalog.json"];
  if (catalog === undefined) {
    throw new Error(`Expected ${sourceId} done catalog.`);
  }
  const bodies: Record<string, string> = {};
  for (const record of records) {
    const fileName = doneRecordFileName(record.identity);
    const body = done.files[`.planning/done/${fileName}`];
    if (body === undefined) throw new Error(`Missing done body ${fileName}`);
    bodies[fileName] = body;
  }
  putFrontendDonePublication(services, sourceId, { catalog, bodies });
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
