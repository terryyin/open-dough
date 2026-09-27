// The records the agent roster journey (agent-roster.spec.ts) publishes: an
// Open Dough revision whose profiles, spelled by the shared profile renderer,
// assign one Taken and one Preparing agent, one agent for work its backlog
// no longer lists and with nothing recorded about host or model, one
// malformed profile, and one profile filed under Yui whose text names Sola;
// and a Doughnut revision whose profile directory cannot be
// listed at all; and a Pygardon revision that publishes no backlog.

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
  // Filed under Yui, it names Sola preparing the queued story: evidence about
  // Yui that contradicts itself, and no assignment for Sola or that story.
  [`${agents}/yui-chan.json`]: renderAgentProfile({
    name: "Sola",
    identity: queuedIdentity,
    activity: "preparation",
    host: "codex",
  }),
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

export const backlogUnreadable = `GitHub answered HTTP 404 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${pygardon.revision}.`;

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
  await page.goto("/?project=pygardon&view=roster");
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
    pygardon.repository,
  );
}
