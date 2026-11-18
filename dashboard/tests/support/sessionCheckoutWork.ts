// Work in a project's Default main checkout as plain Git leaves it in the
// checkout's `HEAD` log: a commit made there, and another developer's
// published work pulled into it. Each states its time, which Git logs.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import path from "node:path";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";

// Commits `file` in the checkout at `at` and answers the commit.
export function commitInCheckout(
  checkout: string,
  at: string,
  file: string,
): Promise<string> {
  return commitDeclaredRevision(checkout, {
    message: `Add ${file}`,
    files: { [file]: `${file} at ${at}\n` },
    committer: { ...dashboardDeveloper, date: at },
  });
}

// Another developer publishes `file` on trunk at `at` and the project's
// checkout pulls it, fast-forward; answers the pulled commit.
export async function pullPublishedWork(
  origin: Pick<StartOrigin, "machine" | "origin" | "project">,
  at: string,
  file: string,
): Promise<string> {
  const git = (cwd: string, ...args: string[]) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      env: { ...process.env, GIT_COMMITTER_DATE: at },
    });
  const other = mkdtempSync(path.join(origin.machine, "other-developer-"));
  git(origin.machine, "clone", "--quiet", origin.origin, other);
  const pulled = await commitInCheckout(other, at, file);
  git(other, "push", "--quiet", "origin", "HEAD:main");
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  return pulled;
}
