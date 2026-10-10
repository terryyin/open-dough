// What any launch's landing specs share: Git in a checkout, the installed
// scripts, a result commit, the publication envelope with its recorded
// landing, and the installed retirement of a launch's owned worktree.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { z } from "zod";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import type { StartOrigin } from "./startOrigin.ts";

// Keep the CLI envelope intact while typing its existing public landing receipt.
export const capturedPublicationSchema = z.looseObject({
  landing: z.object({
    state: z.literal("recorded"),
    receipt: landingReceiptSchema,
  }),
});
export const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" }).trim();
export const scripts = (workspace: string, skill = "dough-execute-plan") =>
  path.join(workspace, ".agents/skills", skill, "scripts");
export function commit(workspace: string, name: string) {
  writeFileSync(path.join(workspace, name), `${name}\n`);
  git(workspace, "add", name);
  git(workspace, "commit", "-m", `Result ${name}`);
  return git(workspace, "rev-parse", "HEAD");
}
export const refs = (workspace: string) =>
  git(workspace, "for-each-ref", "--format=%(refname) %(objectname)");
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
