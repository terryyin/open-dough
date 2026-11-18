// Git commands dated for the checkout work that the session reviews read.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import path from "node:path";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";

export const gitAt =
  (at: string, editors: Record<string, string> = {}) =>
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
        ...editors,
      },
    }).trim();

// Commits `file` in the checkout at `at`, holding `content` when given, and
// answers the commit.
export function commitAt(
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

export function anotherDeveloperCheckout(
  origin: Pick<StartOrigin, "machine" | "origin">,
  at: string,
): string {
  const other = mkdtempSync(path.join(origin.machine, "other-developer-"));
  gitAt(at)(origin.machine, "clone", "--quiet", origin.origin, other);
  return other;
}
