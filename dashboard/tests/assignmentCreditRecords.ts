// The records the assignment credit journey
// (unchanged-assignment-credit.spec.ts) publishes: seven Taken assignments,
// each with its own agent profile, whose current allocations one human added
// by a commit of each profile's own, and one of whose stories is planned; a
// revision B made by a product code commit alone; a revision C whose commit
// modifies one profile; and a revision D whose commits remove the planned
// story's profile and re-add it with identical text, by another human.

import { slicePlan } from "./branchProgressRecords.ts";
import type { PublishedRevision } from "./publishedFiles.ts";
import {
  pathChange,
  type MadeCommit,
  type PathChange,
} from "./pathHistoryAnswers.ts";
import { onAvatarHost } from "./avatarAnswers.ts";
import { creditedAvatar } from "./agentAttributionRecords.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const repository = "terryyin/open-dough";
export const opened = new Date("2026-10-07T09:00:00.000Z");
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);
const revision = (pair: string) => pair.repeat(20);
const revisionA = revision("8a");
const revisionB = revision("8b");
const revisionC = revision("8c");
const revisionD = revision("8d");

const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const seedPath = ".planning/seeds/SEED-281-credit.md";
export const planPath = ".planning/slice-plans/281-credit/PLAN.md";
export const profileOf = (agent: string) =>
  `.planning/agents/${agent.toLowerCase()}-chan.json`;

export const human = "Terry Yin";
const modifier = "Mo Modifier";
const remover = "Remy Remover";
export const readder = "Rhea Readder";

// Seven Taken assignments, one agent each; Yua's story is planned, so its
// card runs a slice clock from its Take.
export const agents = ["Yui", "Akiho", "Yuma", "Sola", "Yua", "Ai", "Kirara"];
export const titleOf = (agent: string) => `Credit kept for ${agent}`;
const anchorOf = (agent: string) => agent.toLowerCase();
export const planned = "Yua";

const backlog = `# Product backlog

## Taken

${agents
  .map(
    (agent) =>
      `- [${titleOf(agent)}](seeds/SEED-281-credit.md#${anchorOf(agent)}) — SEED-281#${anchorOf(agent)}`,
  )
  .join("\n")}

## Backlog list
`;

const seed = `# Credit fixture
${agents
  .map(
    (agent) => `
<a id="${anchorOf(agent)}"></a>

### ${titleOf(agent)}

**Identity:** SEED-281#${anchorOf(agent)}
${
  agent === planned
    ? `\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/281-credit/PLAN.md"}
\`\`\`
`
    : ""
}`,
  )
  .join("")}`;

const profileText = (agent: string, host = "claude") =>
  renderAgentProfile({
    name: agent,
    identity: `SEED-281#${anchorOf(agent)}`,
    mode: "trunk",
    branch: "main",
    host,
    model: undefined,
  });

// Each profile's own addition by the same human, each by a commit of its
// own, on the same account.
export const additionOf = (agent: string): PathChange => ({
  ...pathChange(0x91 + agents.indexOf(agent), "added", human, {
    login: "terryyin",
    avatarUrl: onAvatarHost(creditedAvatar),
  }),
  committedAt: minutesBefore(120 + agents.indexOf(agent)),
});

export const atA: PublishedRevision = {
  revision: revisionA,
  files: {
    [backlogPath]: backlog,
    [seedPath]: seed,
    [planPath]: slicePlan(5, 2),
    ...Object.fromEntries(
      agents.map((agent) => [profileOf(agent), profileText(agent)]),
    ),
  },
  committed: { [planPath]: minutesBefore(30) },
  history: Object.fromEntries(
    agents.map((agent) => [profileOf(agent), [additionOf(agent)]]),
  ),
};

// What B, C, and D publish, each with the commits a move to it is made by.
export type Move = {
  readonly at: PublishedRevision;
  readonly by: readonly MadeCommit[];
};
const made = (change: PathChange, files: MadeCommit["files"]): MadeCommit => ({
  ...change,
  files,
});

// B changes only product code.
const atB: PublishedRevision = { ...atA, revision: revisionB };
export const toB: Move = {
  at: atB,
  by: [
    made(pathChange(0x81, null, "Fixture Committer"), [
      { filename: "dashboard/src/app.ts", status: "modified" },
    ]),
  ],
};

// C modifies Kirara's profile, by someone else.
const modifying = {
  ...pathChange(0x82, "modified", modifier),
  committedAt: minutesBefore(20),
};
const atC: PublishedRevision = {
  ...atB,
  revision: revisionC,
  files: {
    ...atB.files,
    [profileOf("Kirara")]: profileText("Kirara", "codex"),
  },
  history: {
    ...atB.history,
    [profileOf("Kirara")]: [modifying, additionOf("Kirara")],
  },
};
export const toC: Move = {
  at: atC,
  by: [
    made(modifying, [{ filename: profileOf("Kirara"), status: "modified" }]),
  ],
};

// D removes Yua's profile and re-adds it with identical text, by someone
// else, later.
const removing = {
  ...pathChange(0x83, "removed", remover),
  committedAt: minutesBefore(15),
};
const readding = {
  ...pathChange(0x84, "added", readder),
  committedAt: minutesBefore(10),
};
const atD: PublishedRevision = {
  ...atC,
  revision: revisionD,
  history: {
    ...atC.history,
    [profileOf(planned)]: [readding, removing, additionOf(planned)],
  },
};
export const toD: Move = {
  at: atD,
  by: [
    made(removing, [{ filename: profileOf(planned), status: "removed" }]),
    made(readding, [{ filename: profileOf(planned), status: "added" }]),
  ],
};
