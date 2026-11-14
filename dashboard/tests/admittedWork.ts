// Admits a never-queued investigation through the real startup CLI into a
// local bare remote and publishes that remote, so the dashboard reads the
// accepted admission commit itself rather than a hand-built Taken entry. The
// published queue is materialized from its repository description; the story
// is drafted in the originating checkout as local files, with its
// preparation recorded by the production encoder (refined, approach
// unselected, no assessment). Admitting runs Git-heavy production commands, so
// a journey admits once in its setup and each page then serves that
// admission.

import { execFileSync } from "node:child_process";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { storySeed } from "../../Distribution/tests/support/queued-repository.mjs";
import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import { writeRevisionFiles } from "../../Distribution/tests/support/repository-revision-files.mjs";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

const startCli = join(
  repoRoot,
  "Distribution/src/skills/dough-execute-plan/scripts/execution-start.mjs",
);

export const admitted = {
  identity: "SEED-090#slow-start",
  href: "seeds/SEED-090-startup.md#slow-start",
  title: "Investigate slow startup",
  purpose: "Find why startup takes a minute before any change is decided.",
  branch: "claude/investigate-slow-start",
};

export const stillQueued = makeMe.aBacklogEntry
  .with({
    identity: "SEED-091#queued",
    href: "seeds/SEED-091-queued.md#queued",
    title: "Queued follow-up",
  })
  .please();

// The bare remote the startup CLI admitted into, and the commit it accepted.
export type Admission = {
  readonly origin: string;
  readonly revision: string;
};

// The published queue: one queued follow-up and its seed.
const publishedQueue = makeMe.aRepository
  .withRevision("published backlog", {
    backlog: { queued: [stillQueued] },
    files: {
      ".planning/seeds/SEED-091-queued.md": storySeed(
        stillQueued,
        "**Goal:** Follow up later.",
      ),
    },
  })
  .please();

// The accepted mission's story, only a local draft when it is admitted.
const draft = {
  files: {
    ".planning/seeds/SEED-090-startup.md": storySeed(
      admitted,
      `**Goal:** ${admitted.purpose}`,
    ),
  },
  storyStates: [
    {
      identity: admitted.identity,
      href: admitted.href,
      ...makeMe.aStoryPreparation
        .with({ refinement: "refined", approach: "unselected" })
        .please(),
    },
  ],
};

export async function admitInvestigation(
  after: (cleanup: () => Promise<void>) => void,
): Promise<Admission> {
  const built = await materializeRepository(publishedQueue);
  after(built.cleanup);
  const checkout = built.integration;
  writeRevisionFiles(checkout, draft);
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
        join(built.fixture, "workspace"),
        "--branch",
        admitted.branch,
        "--identity",
        admitted.identity,
        "--link",
        admitted.href,
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
  return { origin: built.origin, revision: receipt.publishedSha };
}

// Serves the bare remote at the admission commit it accepted.
export function publishAdmission(page: Page, admission: Admission) {
  return publishCommittedOrigin(page, {
    repoDir: admission.origin,
    revision: admission.revision,
    repository: "terryyin/open-dough",
  });
}
