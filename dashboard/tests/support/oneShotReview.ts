// Real installed one-shot launch, delivery CLI, receiver, and owned retirement.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { stored } from "./codexStart.ts";
import { oneShot, requestFor } from "./oneShotLaunch.ts";
import {
  capturedPublicationSchema,
  context,
  git,
  scripts,
} from "./oneShotLanding.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReview.ts";
import { openBacklog } from "./sessionDialog.ts";

export async function startReviewRun(dashboard: DashboardServer) {
  const response = await launch(dashboard, {
    ...requestFor("refinement", oneShot("isolated", "auto-land")),
    host: "codex",
  });
  expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
  const record = stored(dashboard.home).at(-1);
  if (record === undefined) throw new Error("No real launch");
  return { record, ...context(record) };
}
export function captureReviewRun(
  run: Awaited<ReturnType<typeof startReviewRun>>,
  origin: StartOrigin,
) {
  const { established, reporting } = run;
  const result = capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(established.workspace),
            "execution-increment-delivery.mjs",
          ),
          "deliver",
          "--mode",
          "story-branch",
          "--tracking",
          "one-shot",
          "--workspace",
          established.workspace,
          "--branch",
          established.branch,
          "--previously-published-base",
          established.startingRevision ?? "",
          "--one-shot-identity",
          established.identity,
          "--host",
          "codex",
          "--repo",
          "terryyin/open-dough",
          "--target-ref",
          "refs/heads/main",
          "--landing-context",
          reporting.landingContext ?? "",
        ],
        {
          cwd: origin.machine,
          env: {
            ...process.env,
            DOUGH_CI_MAILBOX_ROOT: path.join(
              origin.machine,
              "review-mailboxes",
            ),
          },
          encoding: "utf8",
        },
      ),
    ),
  );
  expect(result).toMatchObject({
    ok: true,
    publication: "accepted",
    observation: { state: "unobserved" },
    landing: { state: "recorded" },
  });
  expect(existsSync(path.join(origin.machine, "review-mailboxes"))).toBe(false);
  return result.landing.receipt;
}
export const retireReviewRun = (
  run: Awaited<ReturnType<typeof startReviewRun>>,
  origin: StartOrigin,
  revision: string,
) => retireLaunchWorkspace(run.established, origin, revision);
// Retires a launch's owned worktree and branch with the installed retirement.
export function retireLaunchWorkspace(
  established: {
    readonly workspace: string;
    readonly branch: string;
    readonly identity: string;
  },
  origin: StartOrigin,
  revision: string,
  // The branch as separately published on the remote, removed with it.
  remoteBranch?: string,
) {
  const repository = git(
    established.workspace,
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  );
  const answer: unknown = JSON.parse(
    execFileSync(
      process.execPath,
      [
        path.join(
          scripts(origin.project, "dough-land"),
          "worktree-retirement.mjs",
        ),
        "retire",
        "--repository",
        repository,
        "--worktree",
        established.workspace,
        "--branch",
        established.branch,
        "--remote",
        "origin",
        "--target-ref",
        "refs/heads/main",
        "--identity",
        established.identity,
        "--created-for-work",
        "--contained",
        revision,
        ...(remoteBranch === undefined
          ? []
          : ["--remote-branch", remoteBranch]),
      ],
      { cwd: origin.machine, encoding: "utf8" },
    ),
  );
  expect(answer).toMatchObject({ ok: true });
  expect(existsSync(established.workspace)).toBe(false);
  expect(
    git(repository, "for-each-ref", `refs/heads/${established.branch}`),
  ).toBe("");
  return repository;
}
export async function openCapturedReview(page: Page, origin: StartOrigin) {
  const card = await openBacklog(page, origin);
  return { card, review: await readReview(page, card) };
}
export async function readReview(page: Page, card: Locator) {
  const answer = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await card.getByRole("button", { name: "Review changes" }).click();
  return storyReviewSchema.parse(await (await answer).json());
}
export function repositoryObservation(project: string) {
  return {
    refs: git(project, "for-each-ref", "--format=%(refname) %(objectname)"),
    head: git(project, "rev-parse", "HEAD"),
    status: git(project, "status", "--porcelain"),
    index: execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-path", "index"],
      { cwd: project, encoding: "utf8" },
    ).trim(),
  };
}
