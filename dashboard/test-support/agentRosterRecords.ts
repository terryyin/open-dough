// The records the agent roster journey (agent-roster.spec.ts) publishes: an
// Open Dough revision whose profiles, spelled by the shared profile renderer,
// assign one Taken and one Preparing agent, one agent for work its backlog
// no longer lists and with nothing recorded about host or model, one
// malformed profile, and one profile filed under Yui whose text names Sola;
// and a Doughnut revision whose profile directory cannot be
// listed at all; and a Pygardon revision that publishes no backlog.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { RevisionFacts } from "../../Distribution/tests/support/repositoryTestData.mjs";
import type { Locator, Page } from "@playwright/test";
import { renderAgentProfile } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect } from "./dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  rosterParts,
  selectedProjectId,
} from "./dashboardPage.ts";
import { credit } from "./agentCredit.ts";
import { publishCommittedFiles, serveCommitted } from "./publishedOrigin.ts";
import { noConnection, notFoundAnswer } from "./originAnswers.ts";
import { publishes } from "./support/fakeGitHub.ts";
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

export const openDoughFacts = {
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
  // The bytes the roster's unreadable-profile gaps are about: a profile that
  // is not JSON, and one filed under Yui whose text names Sola preparing the
  // queued story (self-contradicting evidence about Yui, no Sola assignment).
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
} satisfies RevisionFacts;

export const { files: openDoughFiles } = describedRevision(
  makeMe.aRepository.withRevision("roster", openDoughFacts).please(),
  openDough.revision,
);

const doughnut = { repository: "nerds-odd-e/doughnut" };
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

// Doughnut publishes a Taken entry, but listing its agent profiles fails;
// returns its committed revision.
export function publishUnlistableProfiles(page: Page): string {
  const published = publishes({ backlog: doughnutBacklog });
  return serveCommitted(page, doughnut.repository, published, (call) => {
    const { request } = call;
    if (request.kind === "content" && request.path !== backlogPath)
      return Promise.resolve(notFoundAnswer());
    return ["ref", "matching-refs", "content"].includes(request.kind)
      ? published(call)
      : Promise.resolve(noConnection);
  });
}

// Pygardon commits no backlog, so its read fails before any published work
// is known.
const pygardon = { repository: "terryyin/pygardon", files: {} };

// Publishes each roster project, returning the revisions committed.
export function publishRosterOrigins(page: Page) {
  const { revision } = publishCommittedFiles(page, {
    repository: openDough.repository,
    files: openDoughFiles,
  });
  const doughnutRevision = publishUnlistableProfiles(page);
  publishCommittedFiles(page, pygardon);
  return { openDough: revision, doughnut: doughnutRevision };
}

// The address names each given project, view and story; null means none.
export function expectRoute(
  page: Page,
  expected: Partial<Record<"project" | "view" | "story", string | null>>,
) {
  const params = new URL(page.url()).searchParams;
  for (const [name, value] of Object.entries(expected))
    expect(params.get(name), name).toBe(value);
}

export const backlogUnreadable =
  "The published backlog (.planning/PRODUCT-BACKLOG.md) is unavailable at the verified trunk of Pygardon.";

export async function expectOpenDoughAssignments(
  members: Locator,
  member: (name: string) => Locator,
) {
  const akiho = member("Akiho-chan");
  await expect(akiho.locator(".roster-activity")).toHaveText("Taken");
  await expect(akiho).toContainText(takenStory);
  await expect(akiho).toContainText(takenIdentity);
  await expect(credit(akiho).summary).toHaveText(
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

  await expect(credit(member("Mana-chan")).gap).toHaveText(
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
  const { roster, back } = rosterParts(page);

  await expect.poll(() => selectedProjectId(page)).toBe("pygardon");
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
