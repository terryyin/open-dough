// The records the Taken agent profile journey (taken-agent-profile.spec.ts)
// publishes at one revision: a backlog with Taken and queued work, and the
// profile texts beside it, spelled by the shared profile renderer, plus a
// malformed profile and a file that is not a profile.

import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const repository = "terryyin/open-dough";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const agents = ".planning/agents";
export const revisionA = "a1".repeat(20);

export const trunkStory = "See who owns Taken work";
export const branchStory = "Queue trunk integration on one machine";
export const modelless = "Name the model when it is known";
export const older = "Repair the installer's update report";
export const lastInRotation = "Show every agent's portrait";
export const queued = "Prepare stories in a clear workspace";

const backlog = `# Product backlog

## Taken

- [${trunkStory}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — SEED-021#identify-taken-work-owner
- [${branchStory}](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008#same-machine-merge-queue
- [${modelless}](seeds/SEED-030-models.md#known-model) — SEED-030#known-model
- [${older}](quick/059-installer-update-report/PLAN.md)
- [${lastInRotation}](seeds/SEED-038-agent-and-tool-avatars.md#recognize-agents-and-tools-by-avatar) — SEED-038#recognize-agents-and-tools-by-avatar

## Backlog list

- [${queued}](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure) — SEED-008#planning-workspace-procedure
`;

const akiho = renderAgentProfile({
  name: "Akiho",
  identity: "SEED-021#identify-taken-work-owner",
  mode: "trunk",
  branch: "origin/main",
  host: "claude",
  model: "claude-opus-5-5",
});
const yuma = renderAgentProfile({
  name: "Yuma",
  identity: "SEED-008#same-machine-merge-queue",
  mode: "story-branch",
  branch: "codex/same-machine-merge-queue",
  host: "codex",
  model: "gpt-5-codex",
});
const sola = renderAgentProfile({
  name: "Sola",
  identity: "SEED-030#known-model",
  mode: "trunk",
  branch: "origin/main",
  host: "cursor",
  // Unrecorded: the renderer leaves an undefined fact out of the profile.
  model: undefined,
});
const rina = renderAgentProfile({
  name: "Rina",
  identity: "SEED-038#recognize-agents-and-tools-by-avatar",
  mode: "story-branch",
  branch: "claude/agent-portraits",
  host: "claude",
  model: "claude-opus-5-5",
});

// A preparation assignment for the queued story: shown as Preparing on its
// queued card, never as a Taken owner. It records no model.
const kirara = renderAgentProfile({
  name: "Kirara",
  identity: "SEED-008#planning-workspace-procedure",
  activity: "preparation",
  host: "claude",
});

export const files = {
  [backlogPath]: backlog,
  [`${agents}/akiho-chan.json`]: akiho,
  [`${agents}/yuma-chan.json`]: yuma,
  [`${agents}/sola-chan.json`]: sola,
  [`${agents}/rina-chan.json`]: rina,
  [`${agents}/kirara-chan.json`]: kirara,
  [`${agents}/mana-chan.json`]: '{ "agent": "Mana-chan", ',
  [`${agents}/README.md`]: "Not an agent profile.\n",
};
