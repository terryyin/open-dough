// Dated Git work in a project's Default main checkout: commits and rewrites
// there, and another developer's work pulled, merged, rebased onto or picked.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";

const gitAt =
  (at: string) =>
  (cwd: string, ...args: string[]) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        GIT_COMMITTER_DATE: at,
        GIT_COMMITTER_NAME: dashboardDeveloper.name,
        GIT_COMMITTER_EMAIL: dashboardDeveloper.email,
        GIT_AUTHOR_NAME: dashboardDeveloper.name,
        GIT_AUTHOR_EMAIL: dashboardDeveloper.email,
        GIT_EDITOR: "true",
        GIT_SEQUENCE_EDITOR: "true",
      },
    }).trim();

// Commits `file` in the checkout at `at`, holding `content` when given, and
// answers the commit.
export function commitInCheckout(
  checkout: string,
  at: string,
  file: string,
  content = `${file} at ${at}\n`,
): Promise<string> {
  return commitDeclaredRevision(checkout, {
    message: `Add ${file}`,
    files: { [file]: content },
    committer: { ...dashboardDeveloper, date: at },
  });
}

// Amends the checkout's last commit at `at` to also hold `file`, keeping its
// message; answers the amended commit.
export function amendInCheckout(
  checkout: string,
  at: string,
  file: string,
): string {
  const git = gitAt(at);
  writeFileSync(path.join(checkout, file), `${file} at ${at}\n`);
  git(checkout, "add", "--", file);
  git(checkout, "commit", "--quiet", "--amend", "--no-edit");
  return git(checkout, "rev-parse", "HEAD");
}

function anotherDeveloperCheckout(
  origin: Pick<StartOrigin, "machine" | "origin">,
  at: string,
): string {
  const other = mkdtempSync(path.join(origin.machine, "other-developer-"));
  gitAt(at)(origin.machine, "clone", "--quiet", origin.origin, other);
  return other;
}

// Picks another developer's edit to a file already changed in the checkout.
// Requires a conflict on that file and answers the commit after resolution.
export async function continueConflictedCherryPick(
  origin: Pick<StartOrigin, "machine" | "origin" | "project">,
  at: string,
  file: string,
  { incoming, resolution }: { incoming: string; resolution: string },
): Promise<string> {
  const git = gitAt(at);
  const checkout = origin.project;
  const other = anotherDeveloperCheckout(origin, at);
  const picked = await commitInCheckout(other, at, file, incoming);
  git(checkout, "fetch", "--quiet", other, picked);
  assert.throws(() => git(checkout, "cherry-pick", picked));
  assert.equal(git(checkout, "rev-parse", "CHERRY_PICK_HEAD"), picked);
  assert.ok(git(checkout, "ls-files", "--unmerged", "--", file));
  writeFileSync(path.join(checkout, file), resolution);
  git(checkout, "add", "--", file);
  git(checkout, "cherry-pick", "--continue");
  return git(checkout, "rev-parse", "HEAD");
}

// Adds `file` in a fixup or squash of `target` and answers the autosquashed
// commit, accepting Git's proposed message.
export function autosquashInCheckout(
  checkout: string,
  at: string,
  target: string,
  file: string,
  kind: "fixup" | "squash",
): string {
  const git = gitAt(at);
  writeFileSync(path.join(checkout, file), `${file} at ${at}\n`);
  git(checkout, "add", "--", file);
  git(
    checkout,
    "commit",
    "--quiet",
    `--${kind}=${target}`,
    "-m",
    `Add ${file}`,
  );
  git(
    checkout,
    "rebase",
    "--quiet",
    "--interactive",
    "--autosquash",
    `${target}^`,
  );
  return git(checkout, "rev-parse", "HEAD");
}

// How the project's checkout takes trunk's published work in: a fast-forward
// pull, a pull that merges, a pull that rebases the checkout's own commits,
// or a fetch and `git rebase --onto` of its last commit, as a publication
// from the checkout does.
export type TakenIn = "fast-forward" | "merge" | "rebase" | "rebase-onto";

// Another developer publishes `file` on trunk at `at`, holding `content`
// when given, and the project's checkout takes it in; answers the published
// commit.
export async function pullPublishedWork(
  origin: Pick<StartOrigin, "machine" | "origin" | "project">,
  at: string,
  file: string,
  { how = "fast-forward", content }: { how?: TakenIn; content?: string } = {},
): Promise<string> {
  const git = gitAt(at);
  const other = anotherDeveloperCheckout(origin, at);
  const pulled = await commitInCheckout(other, at, file, content);
  git(other, "push", "--quiet", "origin", "HEAD:main");
  if (how === "rebase-onto") {
    git(origin.project, "fetch", "--quiet", "origin", "main");
    git(origin.project, "rebase", "--quiet", "--onto", "origin/main", "HEAD~1");
  } else
    git(
      origin.project,
      "pull",
      "--quiet",
      { "fast-forward": "--ff-only", merge: "--no-rebase", rebase: "--rebase" }[
        how
      ],
      ...(how === "merge" ? ["--no-edit"] : []),
      "origin",
      "main",
    );
  return pulled;
}
