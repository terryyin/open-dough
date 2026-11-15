// Default substitute answers for frontend-only app journeys: projects,
// backlog, files, machine, and host status the page reads on open.

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
import { backlogApart, describedRevision } from "../describedRevisions.ts";
import { notRefinedStory, readyStory, takenStory } from "../launchJourney.ts";
import { openDough, openDoughSettings } from "../intentCodeBrowseFixtures.ts";
import {
  openDoughCandidatesRecord,
  testOptimizationCandidatesPath,
} from "../intentCandidatesFixtures.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import {
  readyStoryState,
  storyPlanPath,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { intentSettingsText } from "./intentSettingsFile.ts";

export const frontendRevision = openDough.revision;

export const openDoughSource: PublishedSource = makeMe.aPublishedSource
  .with({
    id: "open-dough",
    label: "Open Dough",
    repository: openDough.repository,
    ref: openDough.ref,
  })
  .please();

export const doughnutSource: PublishedSource = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();

const story = (title: string, identity: string, href: string) =>
  makeMe.aBacklogEntry.with({ identity, title, href }).please();

const taken = story(takenStory, "SEED-A#a", "seeds/SEED-A-taken.md#a");
const ready = story(readyStory, "SEED-B#b", "seeds/SEED-B-ready.md#b");

// Where the project lists its three stories, unless stated: the Taken story
// Taken and the others queued. `notRefinedTitle` retitles the not-refined
// queued story; `taken` names the stories Taken, by title, the rest staying
// queued in order; `preparing` names the queued story an agent announced
// preparing.
export type FrontendStories = {
  readonly notRefinedTitle?: string;
  readonly taken?: readonly string[];
  readonly preparing?: string;
};

// The project the page reads on open: the stories with their seeds, a
// direction, Intent settings, and test-optimization candidates. The Ready
// story's seed and plan record its assessment as Ready, so its card reads
// Ready for execution.
function frontendPublishedWith({
  notRefinedTitle = notRefinedStory,
  taken: takenTitles = [takenStory],
  preparing,
}: FrontendStories = {}) {
  const notRefined = story(
    notRefinedTitle,
    "SEED-C#c",
    "seeds/SEED-C-queued.md#c",
  );
  const stories = [taken, ready, notRefined];
  const isTaken = (entry: { readonly title: string }) =>
    takenTitles.includes(entry.title);
  const prepared = stories.find((entry) => entry.title === preparing);
  return backlogApart(
    describedRevision(
      makeMe.aRepository
        .withRevision("frontend", {
          backlog: {
            direction: "Frontend substitute direction.",
            taken: stories.filter(isTaken),
            queued: stories.filter((entry) => !isTaken(entry)),
          },
          files: {
            [testOptimizationCandidatesPath]: openDoughCandidatesRecord,
            ".planning/open-dough.json": intentSettingsText(openDoughSettings),
            ".planning/seeds/SEED-A-taken.md": `# Taken

${renderStorySection(taken)}`,
            ".planning/seeds/SEED-B-ready.md": `# Ready

${renderStorySection(ready, { goal: "Ready goal." })}`,
            ".planning/seeds/SEED-C-queued.md": `# Queued

${renderStorySection(notRefined)}`,
            [`.planning/${storyPlanPath(ready)}`]: `# ${readyStory} plan\n`,
          },
          storyStates: [readyStoryState(ready)],
          agentProfiles:
            prepared === undefined
              ? []
              : [
                  makeMe.anAgentProfile
                    .preparing({ name: "Yui", identity: prepared.identity })
                    .please(),
                ],
        })
        .please(),
      frontendRevision,
    ),
  );
}

const frontendPublished = frontendPublishedWith();

export const takenBacklogMarkdown = frontendPublished.backlog;

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
