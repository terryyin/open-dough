// The Open Dough board the story CI status journeys publish
// (./intentCiStoryRecords.ts): Taken stories whose agent profiles (spelled by
// the shared profile renderer) record Story Branch Mode branches, Trunk Mode,
// two owners, an unusable name, and a branch no longer published; a queued
// story and one being prepared (a preparation profile names it); and a
// Recently done story.

import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";

export const failing = {
  title: "Story whose branch fails",
  anchor: "failing",
  branch: "codex/example-story",
};
export const planningOnly = {
  title: "Story with only planning commits",
  anchor: "planning-only",
  branch: "codex/planning-only",
};
export const running = {
  title: "Story whose run is in progress",
  anchor: "running",
  branch: "codex/running-story",
};
export const onTrunk = { title: "Story taken on trunk", anchor: "on-trunk" };
export const twoOwners = { title: "Story named twice", anchor: "two-owners" };
export const unusable = {
  title: "Story on an unusable branch",
  anchor: "unusable",
  branch: "story/café",
};
export const removed = {
  title: "Story whose branch was removed",
  anchor: "removed",
  branch: "codex/removed-branch",
};
export const queued = { title: "Story still queued", anchor: "queued" };
export const preparing = {
  title: "Story being prepared",
  anchor: "preparing",
};
export const done = {
  identity: "SEED-219#done-story",
  title: "Story done earlier",
};

const identity = (anchor: string) => `SEED-219#${anchor}`;
const taken = [
  failing,
  planningOnly,
  running,
  onTrunk,
  twoOwners,
  unusable,
  removed,
];

function profile(
  agent: string,
  anchor: string,
  mode: "trunk" | "story-branch",
  branch: string,
): Record<string, string> {
  return {
    [`.planning/agents/${agent.toLowerCase()}-chan.json`]: renderAgentProfile({
      name: agent,
      identity: identity(anchor),
      mode,
      branch,
      host: "claude",
      model: undefined,
    }),
  };
}

const entry = ({ title, anchor }: { title: string; anchor: string }) =>
  `- [${title}](seeds/SEED-219-story-ci.md#${anchor}) — ${identity(anchor)}`;

const backlog = `# Product backlog

## Taken

${taken.map(entry).join("\n")}

## Backlog list

${entry(queued)}
${entry(preparing)}
`;

const seed = `# Story CI fixture

${[...taken, queued, preparing]
  .map(
    ({ title, anchor }) => `<a id="${anchor}"></a>

### ${title}

**Identity:** ${identity(anchor)}
`,
  )
  .join("\n")}`;

export const storyBoardFiles: Record<string, string> = withDoneCatalog(
  {
    ".planning/PRODUCT-BACKLOG.md": backlog,
    ".planning/seeds/SEED-219-story-ci.md": seed,
    ...profile("Akiho", failing.anchor, "story-branch", failing.branch),
    ...profile(
      "Yuma",
      planningOnly.anchor,
      "story-branch",
      planningOnly.branch,
    ),
    ...profile("Sola", running.anchor, "story-branch", running.branch),
    ...profile("Mana", onTrunk.anchor, "trunk", "origin/main"),
    ...profile("Kirara", twoOwners.anchor, "story-branch", "codex/one"),
    ...profile("Tsubomi", twoOwners.anchor, "story-branch", "codex/two"),
    ...profile("Yumi", unusable.anchor, "story-branch", unusable.branch),
    ...profile("Rio", removed.anchor, "story-branch", removed.branch),
    ".planning/agents/aino-chan.json": renderAgentProfile({
      name: "Aino",
      identity: identity(preparing.anchor),
      activity: "preparation",
      host: "claude",
      model: undefined,
    }),
    [`.planning/${doneRecordPath(done.identity)}`]: renderDoneRecord({
      ...done,
      completedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      developer: "Terry Yin",
    }),
  },
  ".planning/done",
);
