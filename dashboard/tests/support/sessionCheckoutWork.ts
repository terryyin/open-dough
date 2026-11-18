// Work in a project's Default main checkout as plain Git leaves it in the
// checkout's `HEAD` log: a commit made or amended there, and another
// developer's published work pulled, merged or rebased onto. Each states its time, which Git logs.
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
      env: {
        ...process.env,
        GIT_COMMITTER_DATE: at,
        GIT_COMMITTER_NAME: dashboardDeveloper.name,
        GIT_COMMITTER_EMAIL: dashboardDeveloper.email,
        GIT_AUTHOR_NAME: dashboardDeveloper.name,
        GIT_AUTHOR_EMAIL: dashboardDeveloper.email,
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
  const other = mkdtempSync(path.join(origin.machine, "other-developer-"));
  git(origin.machine, "clone", "--quiet", origin.origin, other);
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
