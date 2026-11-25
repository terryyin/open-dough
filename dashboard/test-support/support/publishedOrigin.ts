// A real local origin whose default branch holds a published repository's
// backlog and files, so a Git read routed to it (./fixtureOriginRoute.ts)
// finds the same trunk the fake GitHub answers for.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { backlogPath } from "../publishedOriginBasics.ts";

export type PublishedOrigin = {
  readonly origin: string;
  readonly revision: string;
};

const origins: string[] = [];
// Each publication is its own commit, even of the same contents, as each
// synthetic revision it replaces was distinct.
let publications = 0;
process.once("exit", () => {
  for (const origin of origins)
    rmSync(origin, { recursive: true, force: true });
});

const commitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: "Fixture",
  GIT_AUTHOR_EMAIL: "fixture@example.com",
  GIT_COMMITTER_NAME: "Fixture",
  GIT_COMMITTER_EMAIL: "fixture@example.com",
  GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z",
  GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z",
};

// Commits `backlog` at the backlog path and every file in `files` (which
// win over the backlog path) as the one commit on `branch`.
export function commitPublishedOrigin(published: {
  readonly branch: string;
  readonly backlog?: string;
  readonly files?: Readonly<Record<string, string>>;
}): PublishedOrigin {
  const origin = mkdtempSync(path.join(tmpdir(), "dough-published-origin-"));
  origins.push(origin);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", origin, ...args], {
      env: commitEnv,
      encoding: "utf8",
    }).trim();
  git("init", "--quiet", "-b", published.branch);
  const contents = {
    [backlogPath]: published.backlog ?? "",
    ...published.files,
  };
  for (const [file, body] of Object.entries(contents)) {
    mkdirSync(path.dirname(path.join(origin, file)), { recursive: true });
    writeFileSync(path.join(origin, file), body);
  }
  git("add", "--all");
  publications += 1;
  git(
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    `Publish fixture ${String(publications)}`,
  );
  return { origin, revision: git("rev-parse", "HEAD") };
}
