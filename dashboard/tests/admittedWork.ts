// Admits a never-queued investigation through the real startup CLI into a
// local bare remote and publishes that remote, so the dashboard reads the
// accepted admission commit itself rather than a hand-built Taken entry. The story is drafted in the
// originating checkout and its preparation recorded with the real backlog CLI
// (refined, approach unselected, no assessment).

import { execFileSync } from "node:child_process";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import {
  recordState,
  scratchRepo,
  writePlanning,
} from "./storyReadinessCli.ts";

// Playwright loads test helpers as CommonJS, where import.meta is unavailable.
const startCli = join(
  process.cwd(),
  "src/skills/dough-execute-plan/scripts/execution-start.mjs",
);

export const admitted = {
  identity: "SEED-090#slow-start",
  link: "seeds/SEED-090-startup.md#slow-start",
  title: "Investigate slow startup",
  purpose: "Find why startup takes a minute before any change is decided.",
  branch: "claude/investigate-slow-start",
};

export const stillQueued = {
  identity: "SEED-091#queued",
  link: "seeds/SEED-091-queued.md#queued",
  title: "Queued follow-up",
};

function git(directory: string, ...args: string[]): string {
  return execFileSync("git", ["-C", directory, ...args], {
    encoding: "utf8",
  }).trim();
}

function story(anchor: string, identity: string, title: string) {
  return `<a id="${anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n`;
}

// Serves the bare remote at the admission commit it accepted.
export function publishAdmittedInvestigation(
  page: Page,
  after: (cleanup: () => void) => void,
) {
  const root = scratchRepo(after, "dough-admitted-work-");
  const origin = join(root, "origin.git");
  const checkout = join(root, "checkout");
  execFileSync("git", ["init", "--quiet", "--bare", "-b", "main", origin]);
  execFileSync("git", ["init", "--quiet", "-b", "main", checkout]);
  git(checkout, "config", "user.name", "Admission Fixture");
  git(checkout, "config", "user.email", "fixture@example.com");
  git(checkout, "remote", "add", "origin", origin);
  writePlanning(
    checkout,
    "PRODUCT-BACKLOG.md",
    `# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [${stillQueued.title}](${stillQueued.link}) — ${stillQueued.identity}\n`,
  );
  writePlanning(
    checkout,
    "seeds/SEED-091-queued.md",
    `---\nid: SEED-091\n---\n\n# Queued\n\n${story("queued", stillQueued.identity, stillQueued.title)}**Goal:** Follow up later.\n`,
  );
  git(checkout, "add", "-A");
  git(checkout, "commit", "--quiet", "-m", "published backlog");
  git(checkout, "push", "--quiet", "origin", "main");
  // The accepted mission's story is only a local draft when it is admitted.
  writePlanning(
    checkout,
    "seeds/SEED-090-startup.md",
    `---\nid: SEED-090\n---\n\n# Startup\n\n${story("slow-start", admitted.identity, admitted.title)}**Goal:** ${admitted.purpose}\n`,
  );
  recordState(checkout, admitted, {
    refinement: "refined",
    approach: "unselected",
  });
  const receipt = JSON.parse(
    execFileSync(
      process.execPath,
      [
        startCli,
        "start",
        "--admit",
        "--integration",
        checkout,
        "--workspace",
        join(root, "workspace"),
        "--branch",
        admitted.branch,
        "--identity",
        admitted.identity,
        "--link",
        admitted.link,
        "--title",
        admitted.title,
        "--publisher-id",
        "admission-fixture",
        "--mode",
        "story-branch",
        "--remote",
        "origin",
        "--target",
        "main",
        "--push-authorized",
        "--workspace-authorized",
        "--host",
        "claude",
        "--model",
        "claude-opus-5-5",
      ],
      { encoding: "utf8" },
    ),
  ) as { ok: boolean; publishedSha: string };
  if (!receipt.ok) throw new Error(JSON.stringify(receipt));
  return publishCommittedOrigin(page, {
    repoDir: origin,
    revision: receipt.publishedSha,
    repository: "terryyin/open-dough",
  });
}
