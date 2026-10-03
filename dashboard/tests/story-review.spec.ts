// A story's review from its card. Story A has a kept launch record whose
// start names a real worktree of the project, off a real bare origin
// (./support/startOrigin.ts): the record is a precondition, written into the
// machine store as a launch would keep it. The worktree's story commits
// rename a trunk file and add one, it merged trunk carrying another story's
// file, trunk moved on since, and it holds a staged, an unstaged, an
// untracked, and an ignored file. Review changes names the worktree, its
// branch, and the baseline, and lists the story's files with their kinds,
// without either trunk file or the ignored one; the worktree's own index and
// status stay as they were. Requests the launch boundary does not admit are
// refused before any Git runs: trunk is not fetched.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { storyReviewEndpoint } from "../src/storyReview.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { queuedIdentity, type StartOrigin } from "./support/startOrigin.ts";

const branch = "claude/story-a";

const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function commitAll(cwd: string, message: string) {
  git(cwd, "add", "--all");
  git(cwd, "commit", "--quiet", "-m", message);
}

// Lines enough for a small edit to stay a rename.
const lines = (word: string) =>
  [...Array(12).keys()].map((line) => `${word} ${String(line)}\n`).join("");

// Story A's worktree as the review should find it, and the trunk commit the
// story merged, which is the review's baseline.
function storyWorktree(origin: StartOrigin) {
  const project = origin.project;
  // Trunk's files the story changes.
  writeFileSync(path.join(project, "old.txt"), lines("old"));
  writeFileSync(path.join(project, "staged.txt"), lines("staged"));
  writeFileSync(path.join(project, "unstaged.txt"), lines("unstaged"));
  commitAll(project, "trunk files");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = path.join(project, ".worktrees", "story-a");
  git(project, "worktree", "add", "--quiet", "-b", branch, workspace, "main");
  git(workspace, "mv", "old.txt", "new.txt");
  writeFileSync(path.join(workspace, "new.txt"), `${lines("old")}renamed\n`);
  commitAll(workspace, "rename with a small edit");
  writeFileSync(path.join(workspace, "story.txt"), "story\n");
  commitAll(workspace, "story file");

  // Another story lands on trunk, and the story merges trunk.
  const elsewhere = mkdtempSync(path.join(origin.machine, "elsewhere-"));
  git(elsewhere, "clone", "--quiet", origin.origin, ".");
  git(elsewhere, "config", "user.name", "Another Developer");
  git(elsewhere, "config", "user.email", "another@example.test");
  writeFileSync(path.join(elsewhere, "other.txt"), "other story\n");
  commitAll(elsewhere, "another story");
  git(elsewhere, "push", "--quiet", "origin", "main");
  const merged = git(elsewhere, "rev-parse", "HEAD");
  git(workspace, "fetch", "--quiet", "origin", "main");
  git(workspace, "merge", "--quiet", "--no-ff", "-m", "merge trunk", merged);

  // Trunk moves on after the merge; nothing here fetches it.
  writeFileSync(path.join(elsewhere, "other2.txt"), "later trunk\n");
  commitAll(elsewhere, "later trunk");
  git(elsewhere, "push", "--quiet", "origin", "main");
  const later = git(elsewhere, "rev-parse", "HEAD");
  rmSync(elsewhere, { recursive: true, force: true });

  // What the worktree holds beyond its commits.
  writeFileSync(path.join(workspace, "staged.txt"), `${lines("staged")}more\n`);
  git(workspace, "add", "staged.txt");
  writeFileSync(
    path.join(workspace, "unstaged.txt"),
    `${lines("unstaged")}more\n`,
  );
  mkdirSync(path.join(workspace, "fresh"));
  writeFileSync(path.join(workspace, "fresh", "new.txt"), "untracked\n");
  const exclude = path.join(
    git(workspace, "rev-parse", "--git-common-dir"),
    "info",
    "exclude",
  );
  writeFileSync(exclude, "ignored.log\n", { flag: "a" });
  writeFileSync(path.join(workspace, "ignored.log"), "ignored\n");
  return { workspace, merged, later };
}

// Story A's kept launch record, its start naming the worktree.
async function keepLaunchRecord(dashboard: DashboardServer, workspace: string) {
  const record: LaunchRecord = {
    request: {
      source: "open-dough",
      identity: queuedIdentity,
      title: "Story A",
      workflow: "execution",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId: "story-a-session",
      shortId: "story-a",
      name: "Story A",
    },
    start: {
      identity: queuedIdentity,
      publisherId: "a1b2c3",
      workspace,
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: "b2".repeat(20),
    },
    launchedAt: new Date().toISOString(),
  };
  const store = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  await mkdir(path.dirname(store), { recursive: true });
  await writeFile(store, JSON.stringify({ "open-dough": [record] }));
}

// What Git says of the worktree's own index and files.
const observed = (workspace: string) => ({
  status: git(workspace, "status", "--porcelain=v1", "--ignored"),
  staged: git(workspace, "diff", "--cached", "--name-status"),
});

test("a story's review names its worktree, branch, and baseline and lists only the story's changed files", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged, later } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);
  const fetchedTrunk = () => git(workspace, "rev-parse", "origin/main");
  expect(fetchedTrunk()).toBe(merged);

  await test.step("requests the boundary does not admit are refused and nothing runs", async () => {
    const asked = (query: string) =>
      page.request.get(`${dashboard.baseURL}${storyReviewEndpoint}?${query}`, {
        headers: { Origin: dashboard.origin },
      });
    const story = new URLSearchParams({
      source: "open-dough",
      identity: queuedIdentity,
    });
    for (const [query, status, error] of [
      [
        new URLSearchParams({ source: "elsewhere", identity: queuedIdentity }),
        404,
        "Unknown catalog source.",
      ],
      [
        new URLSearchParams({
          source: "open-dough",
          identity: `${queuedIdentity}\nSEED-B#b`,
        }),
        400,
        "The review identity is malformed.",
      ],
      [
        new URLSearchParams({ source: "open-dough" }),
        400,
        "The review request is malformed.",
      ],
      [
        new URLSearchParams([...story, ["path", workspace]]),
        400,
        "The review request is malformed.",
      ],
      [
        new URLSearchParams([...story, ["workspace", "/tmp"]]),
        400,
        "The review request is malformed.",
      ],
    ] as const) {
      const response = await asked(query.toString());
      expect(response.status(), query.toString()).toBe(status);
      expect(await response.json()).toEqual({ error });
    }
    // No fetch ran: trunk's later commit is still unknown here.
    expect(fetchedTrunk()).toBe(merged);
    expect(observed(workspace)).toEqual(before);
  });

  const card = await openBacklog(page, origin);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.click();
  const review = page.getByRole("dialog", { name: "Review changes" });
  await expect(review).toContainText(`Story A ${queuedIdentity}`);
  const files = review.getByRole("list", { name: "5 changed files" });
  await expect(files.getByRole("listitem")).toHaveText([
    "Added fresh/new.txt",
    "Renamed old.txt → new.txt",
    "Modified staged.txt",
    "Added story.txt",
    "Modified unstaged.txt",
  ]);
  const facts = review.getByRole("definition");
  await expect(facts).toHaveText([
    "~/git/open-dough/.worktrees/story-a",
    branch,
    `${merged}, where ${branch} meets origin/main`,
  ]);
  for (const absent of ["other.txt", "other2.txt", "ignored.log"])
    await expect(review).not.toContainText(absent);
  // The review fetched trunk and left the worktree's index and files alone.
  expect(fetchedTrunk()).toBe(later);
  expect(observed(workspace)).toEqual(before);
  // Paths scroll within the review, never the page.
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(review).toBeHidden();
  await expect(action).toBeFocused();
});
