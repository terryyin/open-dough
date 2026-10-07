// The Open Dough project the reopened-project journey publishes
// (./reopened-project-reads.spec.ts): revision A, whose backlog names a story
// with progress on its recorded story branch and a queued story whose record
// is missing, and revision B, made by one commit that changes the backlog and
// publishes that record.

import type { PublishedRevision } from "./publishedFiles.ts";
import { slicePlan } from "./branchProgressRecords.ts";
import { addedAt, type MadeCommit } from "./pathHistoryAnswers.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const repository = "terryyin/open-dough";
export const revisionA = "6a".repeat(20);
export const revisionB = "6b".repeat(20);
export const branch = "story/reopen";
export const branchHead = "6c".repeat(20);
export const opened = new Date("2026-10-06T09:00:00.000Z");
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const seedPath = ".planning/seeds/SEED-261-reopen.md";
// Named by the backlog, but published at no revision.
export const missingSeedPath = ".planning/seeds/SEED-262-missing.md";
export const planPath = ".planning/slice-plans/261-on-branch/PLAN.md";
const profilePath = ".planning/agents/akiho-chan.json";

export const takenTitle = "Progress published on its story branch";
export const queuedTitle = "Queued story whose record is missing";
export const queuedAgainTitle = "Queued story published again";

const backlogNaming = (queued: string) => `# Product backlog

## Taken

- [${takenTitle}](seeds/SEED-261-reopen.md#on-branch) — SEED-261#on-branch

## Backlog list

- [${queued}](seeds/SEED-262-missing.md#missing) — SEED-262#missing
`;

const seed = `# Reopen fixture

<a id="on-branch"></a>

### ${takenTitle}

**Identity:** SEED-261#on-branch
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/261-on-branch/PLAN.md"}
\`\`\`
`;

const missingSeed = `# Missing fixture

<a id="missing"></a>

### ${queuedAgainTitle}

**Identity:** SEED-262#missing
`;

const trunkFiles: Record<string, string> = {
  [backlogPath]: backlogNaming(queuedTitle),
  [seedPath]: seed,
  [planPath]: slicePlan(8, 0),
  [profilePath]: renderAgentProfile({
    name: "Akiho",
    identity: "SEED-261#on-branch",
    mode: "story-branch",
    branch,
    host: "claude",
    model: undefined,
  }),
};

export const atA: PublishedRevision = {
  revision: revisionA,
  files: trunkFiles,
  committed: { [planPath]: minutesBefore(3 * 24 * 60) },
  history: { [profilePath]: [addedAt(0x61, minutesBefore(60))] },
};

// The next commit renames the queued story and publishes its record.
export const atB: PublishedRevision = {
  ...atA,
  revision: revisionB,
  files: {
    ...trunkFiles,
    [backlogPath]: backlogNaming(queuedAgainTitle),
    [missingSeedPath]: missingSeed,
  },
};

// The commit B was made by.
export const madeB: MadeCommit = {
  sha: "6d".repeat(20),
  committer: "Fixture Committer",
  files: [
    { filename: backlogPath, status: "modified" },
    { filename: missingSeedPath, status: "added" },
  ],
};

export const onBranch: PublishedRevision = {
  revision: branchHead,
  files: { ...trunkFiles, [planPath]: slicePlan(8, 6) },
  committed: { [planPath]: minutesBefore(7) },
};
