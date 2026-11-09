// Default substitute answers for frontend-only app journeys: projects,
// backlog, files, machine, and host status the page reads on open.

import type { IntentCandidatesAnswer } from "../../server/intentCandidatesRead.ts";
import type { IntentLocationsAnswer } from "../../server/intentLocationsRead.ts";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { HostStatus } from "../../src/hostStatus.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { backlogApart, describedRevision } from "../describedRevisions.ts";
import { notRefinedStory, readyStory, takenStory } from "../launchJourney.ts";
import { openDough, openDoughSettings } from "../intentCodeBrowseFixtures.ts";
import {
  openDoughCandidatesRecord,
  testOptimizationCandidatesPath,
} from "../intentCandidatesFixtures.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { intentSettingsText } from "./intentSettingsFile.ts";

export const frontendRevision = openDough.revision;

export const openDoughSource: PublishedSource = {
  id: "open-dough",
  label: "Open Dough",
  repository: openDough.repository,
  ref: openDough.ref,
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};

export const doughnutSource: PublishedSource = {
  id: "doughnut",
  label: "Doughnut",
  repository: "nerds-odd-e/doughnut",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};

const story = (title: string, identity: string, href: string) =>
  makeMe.aBacklogEntry.with({ identity, title, href }).please();

// The project the page reads on open: one Taken and two queued stories with
// their seeds, a direction, Intent settings, and test-optimization candidates.
const frontendPublished = backlogApart(
  describedRevision(
    makeMe.aRepository
      .withRevision("frontend", {
        backlog: {
          direction: "Frontend substitute direction.",
          taken: [story(takenStory, "SEED-A#a", "seeds/SEED-A-taken.md#a")],
          queued: [
            story(readyStory, "SEED-B#b", "seeds/SEED-B-ready.md#b"),
            story(notRefinedStory, "SEED-C#c", "seeds/SEED-C-queued.md#c"),
          ],
        },
        files: {
          [testOptimizationCandidatesPath]: openDoughCandidatesRecord,
          ".planning/open-dough.json": intentSettingsText(openDoughSettings),
          ".planning/seeds/SEED-A-taken.md": `# Taken\n\n<a id="a"></a>\n\n### ${takenStory}\n\n**Identity:** SEED-A#a\n`,
          ".planning/seeds/SEED-B-ready.md": `# Ready\n\n<a id="b"></a>\n\n### ${readyStory}\n\n**Identity:** SEED-B#b\n\n**Goal:** Ready goal.\n`,
          ".planning/seeds/SEED-C-queued.md": `# Queued\n\n<a id="c"></a>\n\n### ${notRefinedStory}\n\n**Identity:** SEED-C#c\n`,
        },
      })
      .please(),
    frontendRevision,
  ),
);

export const takenBacklogMarkdown = frontendPublished.backlog;

export type FrontendServiceState = {
  projects: PublishedSource[];
  revision: string;
  backlog: string;
  files: Record<string, string>;
  locations: IntentLocationsAnswer;
  candidates: IntentCandidatesAnswer;
  machine: MachineAnswer;
  hostStatus: HostStatus | undefined;
  hostOptions: unknown;
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
    files: { ...frontendPublished.files },
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
    hostStatus: { cpuPercent: 12, freeBytes: 64_000_000_000 },
    hostOptions: { models: [] },
  };
}

// Mutates substitute answers in place; Object.assign keeps no-param-reassign clean.
export function putFrontendMachine(
  services: FrontendServiceState,
  machine: MachineAnswer,
): void {
  Object.assign(services, { machine });
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
