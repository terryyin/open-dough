// Typed observation replies for an assigned story branch plus a trunk sibling:
// branch head, branch-file, and commit-time ops drive startup detail and a
// moved-head reread through the production observation reads.
import { expect } from "vitest";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { renderSlicePlan } from "../../../Distribution/tests/support/published-plan.mjs";
import { renderPublishedBacklog } from "../../../Distribution/tests/support/published-backlog.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { renderPublishedPreparation } from "../../../Distribution/tests/support/story-preparation.mjs";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

export const revision = "a1".repeat(20);
export const branchHead = "b2".repeat(20);
export const movedHead = "c3".repeat(20);
export const storyBranch = "story/example";
export const onBranchIdentity = "SEED-413#on-branch";
export const onTrunkIdentity = "SEED-413#on-trunk";
export const vanishedIdentity = "SEED-413#vanished";
export const vanishedBranch = "story/vanished";

const seedPath = ".planning/seeds/SEED-413-branch-progress.md";
export const onBranchPlanPath = ".planning/slice-plans/413-on-branch/PLAN.md";
export const onTrunkPlanPath = ".planning/slice-plans/413-on-trunk/PLAN.md";
export const vanishedPlanPath = ".planning/slice-plans/413-vanished/PLAN.md";

export const akihoProfile = `.planning/${agentIdentity("Akiho").path}`;
export const yumaProfile = `.planning/${agentIdentity("Yuma").path}`;
export const kiraraProfile = `.planning/${agentIdentity("Kirara").path}`;

const planAt = (statuses: ReadonlyArray<"planned" | "done">) =>
  renderSlicePlan(makeMe.aSlicePlan.withStatuses([...statuses]).please(), {
    heading: "Slices",
  });

const trunkPlan = planAt(["planned", "planned"]);
const branchPlan = planAt(["done", "planned"]);
const movedPlan = planAt(["done", "done"]);

const entry = (
  title: string,
  anchor: string,
): {
  identity: string;
  title: string;
  href: string;
  plan: { label: string; target: string };
} => ({
  identity: `SEED-413#${anchor}`,
  title,
  href: `seeds/SEED-413-branch-progress.md#${anchor}`,
  plan: {
    label: "plan",
    target: `./slice-plans/413-${anchor}/PLAN.md`,
  },
});

const onBranch = entry("Progress on its story branch", "on-branch");
const onTrunk = entry("Progress on trunk", "on-trunk");
const vanished = entry("Recorded branch vanished", "vanished");

const linkedBacklog = renderPublishedBacklog({
  direction: "Read Taken progress at each recorded story-branch head.",
  taken: [onBranch, onTrunk, vanished],
  queued: [],
});

const storyBody = (planRelative: string) =>
  `${renderPublishedPreparation({
    refinement: "refined",
    approach: "planned",
    plan: planRelative,
  })}\n`;

const seedText = `# Branch progress through typed observation

${renderStorySection(onBranch, {
  body: storyBody("../slice-plans/413-on-branch/PLAN.md"),
})}
${renderStorySection(onTrunk, {
  body: storyBody("../slice-plans/413-on-trunk/PLAN.md"),
})}
${renderStorySection(vanished, {
  body: storyBody("../slice-plans/413-vanished/PLAN.md"),
})}
`;

const detailTexts: Record<string, string> = {
  [seedPath]: seedText,
  [onBranchPlanPath]: trunkPlan,
  [onTrunkPlanPath]: trunkPlan,
  [vanishedPlanPath]: trunkPlan,
};

const branchPlans: Record<string, Record<string, string>> = {
  [branchHead]: { [onBranchPlanPath]: branchPlan },
  [movedHead]: { [onBranchPlanPath]: movedPlan },
};

export const planCommittedAt = new Date("2026-01-15T11:00:00.000Z");
export const takeCommittedAt = "2026-01-15T10:00:00.000Z";
export const additionCommit = "d".repeat(40);

export type BranchAsks = {
  readonly heads: string[];
  readonly files: Array<{ path: string; head: string }>;
  readonly commitTimes: Array<{ path: string; head?: string }>;
};

export function observationSupplying(options?: {
  readonly branchHeads?: ReadonlyMap<string, string | undefined>;
}): {
  readonly reads: PublishedObservationReadSource;
  readonly asks: BranchAsks;
} {
  const heads =
    options?.branchHeads ??
    new Map<string, string | undefined>([
      [storyBranch, branchHead],
      [vanishedBranch, undefined],
    ]);
  const asks: BranchAsks = { heads: [], files: [], commitTimes: [] };
  const unread = pageReadsSupplying({}).observation;
  const reads: PublishedObservationReadSource = {
    ...unread,
    readSnapshot: () => Promise.resolve({ revision, backlog: linkedBacklog }),
    readDetailFile: (...args) => {
      const path = args[1];
      const at = args[2];
      expect(at).toBe(revision);
      const text = detailTexts[path];
      if (text === undefined) {
        return Promise.reject(new Error(`Unexpected detail path ${path}`));
      }
      return Promise.resolve(text);
    },
    readProfiles: () =>
      Promise.resolve({
        profiles: [
          {
            path: akihoProfile,
            text: renderAgentProfile({
              name: "Akiho",
              identity: onBranchIdentity,
              mode: "story-branch",
              branch: storyBranch,
              host: "claude",
              model: "claude-opus-5-5",
            }),
          },
          {
            path: yumaProfile,
            text: renderAgentProfile({
              name: "Yuma",
              identity: onTrunkIdentity,
              mode: "trunk",
              branch: "origin/main",
              host: "claude",
              model: "claude-opus-5-5",
            }),
          },
          {
            path: kiraraProfile,
            text: renderAgentProfile({
              name: "Kirara",
              identity: vanishedIdentity,
              mode: "story-branch",
              branch: vanishedBranch,
              host: "claude",
              model: "claude-opus-5-5",
            }),
          },
        ],
        settings: undefined,
      }),
    readProfileAddition: (...args) => {
      expect(args[2]).toBe(revision);
      return Promise.resolve({
        commit: additionCommit,
        committerName: "Terry",
        committedAt: takeCommittedAt,
        login: "terryyin",
      });
    },
    readDoneCatalog: () =>
      Promise.resolve({
        status: "catalogued" as const,
        records: [],
        unreadable: [],
      }),
    listPublishedSessions: () => Promise.resolve([]),
    readBranchHead: (...args) => {
      const at = args[1];
      const branch = args[2];
      expect(at).toBe(revision);
      asks.heads.push(branch);
      if (!heads.has(branch)) {
        return Promise.reject(new Error(`Unexpected branch head ${branch}`));
      }
      return Promise.resolve(heads.get(branch));
    },
    readFileOnBranch: (...args) => {
      const path = args[1];
      const at = args[2];
      const onBranchHead = args[3];
      expect(at).toBe(revision);
      asks.files.push({ path, head: onBranchHead.head });
      const text = branchPlans[onBranchHead.head]?.[path];
      return Promise.resolve(text);
    },
    readCommitTime: (...args) => {
      const path = args[1];
      const at = args[2];
      const onBranchHead = args[4];
      expect(at).toBe(revision);
      asks.commitTimes.push(
        onBranchHead === undefined
          ? { path }
          : { path, head: onBranchHead.head },
      );
      return Promise.resolve(planCommittedAt);
    },
  };
  return { reads, asks };
}
