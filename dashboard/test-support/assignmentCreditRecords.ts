// The records the assignment credit journey
// (unchanged-assignment-credit.spec.ts) publishes: seven Taken assignments,
// each with its own agent profile, whose current allocations one human added
// by a commit of each profile's own, and one of whose stories is planned; a
// revision B made by a product code commit alone; a revision C whose commit
// modifies one profile; and a revision D whose commits remove the planned
// story's profile and re-add it with identical text, by another human.

import { renderSlicePlan } from "../../Distribution/tests/support/published-plan.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { PublishedRevision } from "./publishedFiles.ts";
import { type MadeCommit, type PathChange } from "./pathHistoryAnswers.ts";
import { onAvatarHost } from "./avatarAnswers.ts";
import { creditedAvatar } from "./agentAttributionRecords.ts";
import type { RepositoryBuilder } from "../../Distribution/tests/support/repositoryTestData.mjs";

export const repository = "terryyin/open-dough";
export const opened = new Date("2026-10-07T09:00:00.000Z");
const minutesBefore = (minutes: number) =>
  new Date(opened.getTime() - minutes * 60_000);
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
export const agents = [
  "Yui",
  "Akiho",
  "Yuma",
  "Sola",
  "Yua",
  "Ai",
  "Kirara",
] as const;
export const titleOf = (agent: string) => `Credit kept for ${agent}`;
const anchorOf = (agent: string) => agent.toLowerCase();
export const planned = "Yua";

const entries = agents.map((agent) =>
  makeMe.aBacklogEntry
    .with({
      identity: `SEED-281#${anchorOf(agent)}`,
      href: `seeds/SEED-281-credit.md#${anchorOf(agent)}`,
      title: titleOf(agent),
    })
    .please(),
);
const seed = `# Credit fixture

${entries.map((entry) => renderStorySection(entry)).join("\n")}`;

const agentProfileOf = (agent: string, host = "claude") =>
  makeMe.anAgentProfile
    .executing({
      name: agent,
      identity: `SEED-281#${anchorOf(agent)}`,
      mode: "trunk",
      branch: "main",
      host,
    })
    .please();

// A publishes the seven assignments, Yua's planned; C modifies Kirara's
// profile, to Codex.
const appPath = "dashboard/src/app.ts";
const creditCommitter = (name: string, date: Date) => ({
  name,
  email: "credit@example.test",
  date: date.toISOString(),
});
let withAllocations: RepositoryBuilder<"base" | (typeof agents)[number]> =
  makeMe.aRepository.withRevision("base");
for (const [index, agent] of agents.entries()) {
  withAllocations = withAllocations.withRevision(agent, {
    agentProfiles: [agentProfileOf(agent)],
    committer: creditCommitter(human, minutesBefore(120 + index)),
  });
}

export const creditHistory = withAllocations
  .withRevision("A", {
    backlog: {
      taken: entries,
    },
    files: {
      [seedPath]: seed,
      [appPath]: "// Before refresh\n",
      [planPath]: renderSlicePlan(
        makeMe.aSlicePlan
          .withStatuses(["done", "done", "planned", "planned", "planned"])
          .please(),
        { heading: "Slices" },
      ),
    },
    storyStates: [
      {
        identity: `SEED-281#${anchorOf(planned)}`,
        href: `seeds/SEED-281-credit.md#${anchorOf(planned)}`,
        ...makeMe.aStoryPreparation
          .plannedIn("../slice-plans/281-credit/PLAN.md")
          .please(),
      },
    ],
  })
  .withRevision("B", { files: { [appPath]: "// After refresh\n" } })
  .withRevision("C", {
    agentProfiles: [agentProfileOf("Kirara", "codex")],
    committer: creditCommitter(modifier, minutesBefore(20)),
  })
  .withRevision("removed", {
    remove: [profileOf(planned)],
    committer: creditCommitter(remover, minutesBefore(15)),
  })
  .withRevision("D", {
    agentProfiles: [agentProfileOf(planned)],
    committer: creditCommitter(readder, minutesBefore(10)),
  })
  .please();

type Fixture = Readonly<
  Record<(typeof creditHistory.revisions)[number]["name"], string>
>;

export const additionOf = (
  agent: (typeof agents)[number],
  shas: Fixture,
): PathChange => ({
  sha: shas[agent],
  status: "added",
  committer: human,
  login: "terryyin",
  avatarUrl: onAvatarHost(creditedAvatar),
  committedAt: minutesBefore(120 + agents.indexOf(agent)),
});

const change = (
  sha: string,
  status: PathChange["status"],
  committer: string,
  minutes: number,
): PathChange => ({
  sha,
  status,
  committer,
  committedAt: minutesBefore(minutes),
});
export function creditDetails(shas: Fixture) {
  const a = {
    committed: { [planPath]: minutesBefore(30) },
    history: Object.fromEntries(
      agents.map((agent) => [profileOf(agent), [additionOf(agent, shas)]]),
    ),
  };
  const c = {
    ...a,
    history: {
      ...a.history,
      [profileOf("Kirara")]: [
        change(shas.C, "modified", modifier, 20),
        additionOf("Kirara", shas),
      ],
    },
  };
  const d = {
    ...c,
    history: {
      ...c.history,
      [profileOf(planned)]: [
        change(shas.D, "added", readder, 10),
        change(shas.removed, "removed", remover, 15),
        additionOf(planned, shas),
      ],
    },
  };
  return { A: a, B: a, C: c, D: d };
}

export type Move = {
  readonly at: PublishedRevision;
  readonly by: readonly MadeCommit[];
};
const made = (
  sha: string,
  committer: string,
  filename: string,
  status: MadeCommit["files"][number]["status"],
  committedAt?: Date,
): MadeCommit => ({
  sha,
  committer,
  files: [{ filename, status }],
  ...(committedAt === undefined ? {} : { committedAt }),
});

export function creditMoves(origin: {
  revisions: Fixture;
  published: Readonly<Record<"B" | "C" | "D", PublishedRevision>>;
}) {
  const { revisions: shas, published } = origin;
  return {
    toB: {
      at: published.B,
      by: [made(shas.B, "Fixture Committer", appPath, "modified")],
    },
    toC: {
      at: published.C,
      by: [
        made(
          shas.C,
          modifier,
          profileOf("Kirara"),
          "modified",
          minutesBefore(20),
        ),
      ],
    },
    toD: {
      at: published.D,
      by: [
        made(
          shas.removed,
          remover,
          profileOf(planned),
          "removed",
          minutesBefore(15),
        ),
        made(shas.D, readder, profileOf(planned), "added", minutesBefore(10)),
      ],
    },
  };
}
