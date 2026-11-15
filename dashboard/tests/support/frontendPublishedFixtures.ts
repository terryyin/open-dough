// Published project fixtures the frontend substitute answers: sources,
// backlog/stories, seeds and Intent files a typical page open reads.

import type { PublishedSource } from "../../src/publishedSource.ts";
import { backlogApart, describedRevision } from "../describedRevisions.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyIdentity,
  readyStory,
  takenIdentity,
  takenStory,
} from "../launchJourney.ts";
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

export const pygardonSource: PublishedSource = makeMe.aPublishedSource
  .with({
    id: "pygardon",
    label: "Pygardon",
    repository: "terryyin/pygardon",
  })
  .please();

const story = (title: string, identity: string, href: string) =>
  makeMe.aBacklogEntry.with({ identity, title, href }).please();

const taken = story(takenStory, takenIdentity, "seeds/SEED-A-taken.md#a");
const ready = story(readyStory, readyIdentity, "seeds/SEED-B-ready.md#b");

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
export function frontendPublishedWith({
  notRefinedTitle = notRefinedStory,
  taken: takenTitles = [takenStory],
  preparing,
}: FrontendStories = {}) {
  const notRefined = story(
    notRefinedTitle,
    notRefinedIdentity,
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

export const defaultFrontendPublishedFiles = (): Record<string, string> => ({
  ...frontendPublished.files,
});

// A kept launch of `workflow` for the project's story titled `title`, the
// not-refined story unless the title is the Taken or Ready story's.
export function frontendStoryLaunch(
  workflow: "executing" | "refining",
  title: string,
) {
  const identity =
    [taken, ready].find((entry) => entry.title === title)?.identity ??
    notRefinedIdentity;
  return makeMe.aLaunchRecord[workflow]({ identity, title });
}
