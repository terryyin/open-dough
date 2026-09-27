// The profile histories the commission attribution journey
// (agent-roster-attribution.spec.ts) publishes beside the agent roster's
// records (agentRosterRecords.ts): at the first revision, a Taken profile
// modified after the commit that added its current allocation, which follows
// an older allocation of the same rotating name; a Preparing profile added
// once; a profile whose history reaches an older allocation without an
// addition of its own; and a profile whose history cannot be read. At the
// second revision, the Taken agent was released and allocated again by
// someone else.

import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  openDough,
  openDoughFiles,
  takenIdentity,
} from "./agentRosterRecords.ts";
import type { PathChange, PathHistories } from "./pathHistoryAnswers.ts";

const agents = ".planning/agents";

export const credited = "Terry Yin";
export const preparer = "Pat Preparer";
export const modifier = "Mo Modifier";
export const olderAllocator = "Olde Allocator";
export const reallocator = "Nova Newcomer";
// Work the unattributable profile names; the backlog does not list it.
const retiredIdentity = "SEED-098#another-retired-story";

const change = (
  n: number,
  status: PathChange["status"],
  committer: string,
  login?: string,
): PathChange => ({
  sha: n.toString(16).padStart(2, "0").repeat(20),
  status,
  committer,
  ...(login !== undefined && { login }),
});

// Akiho's allocation for the Taken work, after an older allocation of the
// same name was added by someone else and released.
const akihoHistory = [
  change(0x11, "modified", modifier, "mo-modifier"),
  change(0x12, "added", credited, "terryyin"),
  change(0x13, "removed", olderAllocator),
  change(0x14, "added", olderAllocator, "olde"),
];

const history: PathHistories = {
  [`${agents}/akiho-chan.json`]: akihoHistory,
  [`${agents}/kirara-chan.json`]: [change(0x21, "added", preparer)],
  // Only a modification is found before an older allocation's removal.
  [`${agents}/yuma-chan.json`]: [
    change(0x31, "modified", modifier),
    change(0x32, "removed", olderAllocator),
    change(0x33, "added", olderAllocator),
  ],
  // Sola's history is not published: its commit list fails.
};

export const firstRevision = {
  ...openDough,
  files: {
    ...openDoughFiles,
    [`${agents}/sola-chan.json`]: renderAgentProfile({
      name: "Sola",
      identity: retiredIdentity,
      mode: "trunk",
      branch: "origin/main",
    }),
  },
  history,
};

// Akiho was released and allocated to the same Taken work again, by someone
// else.
export const secondRevision = {
  ...firstRevision,
  revision: "b8".repeat(20),
  files: {
    ...firstRevision.files,
    [`${agents}/akiho-chan.json`]: renderAgentProfile({
      name: "Akiho",
      identity: takenIdentity,
      mode: "trunk",
      branch: "origin/main",
      host: "codex",
    }),
  },
  history: {
    ...history,
    [`${agents}/akiho-chan.json`]: [
      change(0x15, "added", reallocator, "nova"),
      change(0x16, "removed", credited),
      ...akihoHistory,
    ],
  },
};
