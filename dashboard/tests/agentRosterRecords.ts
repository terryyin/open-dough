// The records the agent roster journey (agent-roster.spec.ts) publishes: an
// Open Dough revision whose profiles, spelled by the shared profile renderer,
// assign one Taken and one Preparing agent, one agent for work its backlog
// no longer lists and with nothing recorded about host or model, one
// malformed profile, and one profile filed under Yui whose text names Sola;
// and a Doughnut revision whose profile directory cannot be
// listed at all; and a Pygardon revision that publishes no backlog.

import { makeMe } from "../../tests/support/makeMe.mjs";
import type { Locator, Page } from "@playwright/test";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect, githubFor } from "./dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  parts,
  rosterParts,
} from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  commitAnswer,
  headsAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
} from "./originAnswers.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { describedBacklog, describedRevision } from "./describedRevisions.ts";
import { backlogPath } from "./publishedOriginBasics.ts";

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

const entry = (title: string, identity: string, href: string) =>
  makeMe.aBacklogEntry.with({ title, identity, href }).please();

export const { files: openDoughFiles } = describedRevision(
  makeMe.aRepository
    .withRevision("roster", {
      backlog: {
        taken: [
          entry(
            takenStory,
            takenIdentity,
            "seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner",
          ),
        ],
        queued: [
          entry(
            queuedStory,
            queuedIdentity,
            "seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure",
          ),
        ],
      },
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "Akiho",
            identity: takenIdentity,
            mode: "trunk",
            branch: "origin/main",
            host: "claude",
            model: "claude-opus-5-5",
          })
          .please(),
        makeMe.anAgentProfile
          .preparing({
            name: "Kirara",
            identity: queuedIdentity,
            host: "cursor",
          })
          .please(),
        makeMe.anAgentProfile
          .executing({
            name: "Yuma",
            identity: unlistedIdentity,
            mode: "story-branch",
            branch: "codex/retired-story",
          })
          .please(),
      ],
      // The bytes the roster's unreadable-profile gaps are about: a profile
      // that is not JSON, and one filed under Yui whose text names Sola
      // preparing the queued story, evidence about Yui that contradicts itself
      // and no assignment for Sola or that story.
      files: {
        [`${agents}/mana-chan.json`]: '{ "agent": "Mana-chan", ',
        [`${agents}/yui-chan.json`]: renderAgentProfile(
          makeMe.anAgentProfile
            .preparing({
              name: "Sola",
              identity: queuedIdentity,
              host: "codex",
            })
            .please(),
        ),
      },
    })
    .please(),
  openDough.revision,
);

export const doughnut = {
  repository: "nerds-odd-e/doughnut",
  revision: "d9".repeat(20),
};
export const doughnutStory = "Doughnut's own taken story";
const doughnutBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("taken", {
      backlog: {
        taken: [
          entry(
            doughnutStory,
            "SEED-001#taken",
            "seeds/SEED-001-taken.md#taken",
          ),
        ],
      },
    })
    .please(),
);

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
      return Promise.resolve(rawFileAnswer(doughnutBacklog));
    }
    if (request.kind === "content") {
      return Promise.resolve(notFoundAnswer());
    }
    return Promise.resolve(noConnection);
  });
}

// Pygardon publishes no backlog, so its read fails before any published work
// is known.
export const pygardon = {
  repository: "terryyin/pygardon",
  revision: "e5".repeat(20),
  files: {},
};

export async function publishRosterOrigins(page: Page) {
  await publishFiles(page, { ...openDough, files: openDoughFiles });
  publishUnlistableProfiles(page);
  await publishFiles(page, pygardon);
}

export function expectRoute(
  page: Page,
  expected: { project?: string; view?: string | null },
) {
  const url = new URL(page.url());
  if (expected.project !== undefined) {
    expect(url.searchParams.get("project")).toBe(expected.project);
  }
  if (expected.view !== undefined) {
    expect(url.searchParams.get("view")).toBe(expected.view);
  }
}

export const backlogUnreadable =
  "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Pygardon (HTTP 404).";

export async function expectOpenDoughAssignments(
  members: Locator,
  member: (name: string) => Locator,
) {
  const akiho = member("Akiho-chan");
  await expect(akiho.locator(".roster-activity")).toHaveText("Taken");
  await expect(akiho).toContainText(takenStory);
  await expect(akiho).toContainText(takenIdentity);
  await expect(akiho.locator(".owner-summary")).toHaveText(
    "Trunk Mode · Claude Code · claude-opus-5-5",
  );

  const kirara = member("Kirara-chan");
  await expect(kirara.locator(".roster-activity")).toHaveText("Preparing");
  await expect(kirara).toContainText(queuedStory);
  await expect(kirara).toContainText(queuedIdentity);

  const yuma = member("Yuma-chan");
  await expect(yuma.locator(".roster-activity")).toHaveText("Taken");
  await expect(yuma).toContainText(unlistedIdentity);
  await expect(yuma).toContainText(
    "Task title not found: the published backlog at this revision lists no entry with this identity.",
  );

  await expect(member("Mana-chan").locator(".assignment-gap")).toHaveText(
    "Assignment uncertain: agent profile mana-chan.json is unreadable: profile is not JSON.",
  );
  await expect(member("Mana-chan")).not.toContainText("No assignment recorded");
  await expect(member("Yui-chan")).toContainText(
    "Assignment uncertain: agent profile yui-chan.json is unreadable: profile names another agent.",
  );
  await expect(member("Yui-chan")).not.toContainText("No assignment recorded");
  await expect(member("Sola-chan")).toContainText("No assignment recorded");
  await expect(member("Sola-chan")).not.toContainText(queuedIdentity);

  await expect(
    members.filter({ hasText: "No assignment recorded" }),
  ).toHaveCount(24);
}

export async function expectDirectRosterFailure(page: Page) {
  await openUntilRead(page, "/?project=pygardon&view=roster");
  const { project } = parts(page);
  const { roster, back } = rosterParts(page);

  await expect(project.getByRole("radio", { checked: true })).toHaveAttribute(
    "value",
    "pygardon",
  );
  await expect(roster).toBeVisible();
  await expect(roster).toContainText(
    "Pygardon: no published work has been read, so no assignment is known.",
  );
  await expect(
    roster.getByRole("heading", { name: "Agent roster" }),
  ).toBeFocused();

  await back.click();
  await expect(roster).toHaveCount(0);
  expectRoute(page, { project: "pygardon", view: null });
  await expectProblemAndNoSnapshot(
    page,
    backlogUnreadable,
    undefined,
    "Pygardon",
  );
}
