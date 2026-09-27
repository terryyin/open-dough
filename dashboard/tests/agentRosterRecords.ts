// The records the agent roster journey (agent-roster.spec.ts) publishes: an
// Open Dough revision whose profiles, spelled by the shared profile renderer,
// commission one Taken and one Preparing agent, one agent for work its backlog
// no longer lists and with nothing recorded about host or model, and one
// malformed profile; and a Doughnut revision whose profile directory cannot be
// listed at all.

import type { Page } from "@playwright/test";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { githubFor } from "./dashboardTest.ts";
import {
  commitAnswer,
  headsAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
} from "./originAnswers.ts";

const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const agents = ".planning/agents";

export const openDough = {
  repository: "terryyin/open-dough",
  revision: "a7".repeat(20),
};
export const takenStory = "See who owns Taken work";
export const takenIdentity = "SEED-021#identify-taken-work-owner";
export const queuedStory = "Prepare stories in a clear workspace";
export const queuedIdentity = "SEED-008#planning-workspace-procedure";
// Work a profile names that the published backlog no longer lists.
export const unlistedIdentity = "SEED-099#retired-story";

const backlog = `# Product backlog

## Taken

- [${takenStory}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — ${takenIdentity}

## Backlog list

- [${queuedStory}](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure) — ${queuedIdentity}
`;

export const openDoughFiles = {
  [backlogPath]: backlog,
  [`${agents}/akiho-chan.json`]: renderAgentProfile({
    name: "Akiho",
    identity: takenIdentity,
    mode: "trunk",
    branch: "origin/main",
    host: "claude",
    model: "claude-opus-5-5",
  }),
  [`${agents}/kirara-chan.json`]: renderAgentProfile({
    name: "Kirara",
    identity: queuedIdentity,
    activity: "preparation",
    host: "cursor",
  }),
  [`${agents}/yuma-chan.json`]: renderAgentProfile({
    name: "Yuma",
    identity: unlistedIdentity,
    mode: "story-branch",
    branch: "codex/retired-story",
  }),
  [`${agents}/mana-chan.json`]: '{ "agent": "Mana-chan", ',
};

export const doughnut = {
  repository: "nerds-odd-e/doughnut",
  revision: "d9".repeat(20),
};
export const doughnutStory = "Doughnut's own taken story";

// Doughnut publishes a Taken entry, but listing its agent profiles fails.
export function publishUnlistableProfiles(page: Page) {
  const { repository, revision } = doughnut;
  githubFor(page).serve(repository, ({ request }) => {
    if (request.kind === "ref") {
      return Promise.resolve(commitAnswer(revision));
    }
    if (request.kind === "matching-refs") {
      return Promise.resolve(headsAnswer({ main: revision }));
    }
    if (request.kind === "content" && request.path === backlogPath) {
      return Promise.resolve(
        rawFileAnswer(
          `# Product backlog\n\n## Taken\n\n- [${doughnutStory}](seeds/SEED-001-taken.md#taken) — SEED-001#taken\n\n## Backlog list\n`,
        ),
      );
    }
    if (request.kind === "content") {
      return Promise.resolve(notFoundAnswer());
    }
    return Promise.resolve(noConnection);
  });
}
