// The records the Taken agent profile journey (taken-agent-profile.spec.ts)
// publishes at one revision: a backlog with Taken and queued work, and the
// agents' profiles beside it, plus a malformed profile and a file that is not
// a profile.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { describedRevision } from "./describedRevisions.ts";

export const repository = "terryyin/open-dough";
export const agents = ".planning/agents";
export const revisionA = "a1".repeat(20);

export const trunkStory = "See who owns Taken work";
export const branchStory = "Queue trunk integration on one machine";
export const modelless = "Name the model when it is known";
export const older = "Repair the installer's update report";
export const lastInRotation = "Show every agent's portrait";
export const queued = "Prepare stories in a clear workspace";

const entry = (title: string, identity: string, href: string) =>
  makeMe.aBacklogEntry.with({ title, identity, href }).please();
const olderPlan = "slice-plans/059-installer-update-report/PLAN.md";

export const { files } = describedRevision(
  makeMe.aRepository
    .withRevision("profiles", {
      backlog: {
        taken: [
          entry(
            trunkStory,
            "SEED-021#identify-taken-work-owner",
            "seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner",
          ),
          entry(
            branchStory,
            "SEED-008#same-machine-merge-queue",
            "seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue",
          ),
          entry(
            modelless,
            "SEED-030#known-model",
            "seeds/SEED-030-models.md#known-model",
          ),
          entry(older, olderPlan, olderPlan),
          entry(
            lastInRotation,
            "SEED-038#recognize-agents-and-tools-by-avatar",
            "seeds/SEED-038-agent-and-tool-avatars.md#recognize-agents-and-tools-by-avatar",
          ),
        ],
        queued: [
          entry(
            queued,
            "SEED-008#planning-workspace-procedure",
            "seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure",
          ),
        ],
      },
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "Akiho",
            identity: "SEED-021#identify-taken-work-owner",
            mode: "trunk",
            branch: "origin/main",
            host: "claude",
            model: "claude-opus-5-5",
          })
          .please(),
        makeMe.anAgentProfile
          .executing({
            name: "Yuma",
            identity: "SEED-008#same-machine-merge-queue",
            mode: "story-branch",
            branch: "codex/same-machine-merge-queue",
            host: "codex",
            model: "gpt-5-codex",
          })
          .please(),
        makeMe.anAgentProfile
          .executing({
            name: "Sola",
            identity: "SEED-030#known-model",
            mode: "trunk",
            branch: "origin/main",
            host: "cursor",
            // Unrecorded: no model was published.
          })
          .please(),
        makeMe.anAgentProfile
          .executing({
            name: "Rina",
            identity: "SEED-038#recognize-agents-and-tools-by-avatar",
            mode: "story-branch",
            branch: "claude/agent-portraits",
            host: "claude",
            model: "claude-opus-5-5",
          })
          .please(),
        // A preparation assignment for the queued story: shown as Preparing on
        // its queued card, never as a Taken owner. It records no model.
        makeMe.anAgentProfile
          .preparing({
            name: "Kirara",
            identity: "SEED-008#planning-workspace-procedure",
            host: "claude",
          })
          .please(),
      ],
      // The bytes the card's unreadable-profile gap is about.
      files: {
        [`${agents}/mana-chan.json`]: '{ "agent": "Mana-chan", ',
        [`${agents}/README.md`]: "Not an agent profile.\n",
      },
    })
    .please(),
  revisionA,
);
