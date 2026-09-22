// The `gh`-invocation concern for the local authenticated read boundary
// (`./privateRead.ts`): the two read-only `gh api` calls a backlog or
// reachability-checked record read needs (resolve ref, then read content
// pinned to that resolved commit), each with a fixed argument array -- never
// a shell string, and never a caller-supplied repository. Kept apart from
// `./localOrigin.ts`'s request-refusal concern: everything here already
// trusts that the request was allowed to reach this point.

import { execFile } from "node:child_process";

// How long an owned `gh` subprocess may run before this boundary gives up on
// it, mirroring the browser's own overall read deadline
// (`../src/publishedWork.ts`'s `readWaitLimitMs`). A test may shorten this
// through the environment to observe termination without waiting out the
// production bound, which stays 30 seconds whenever the environment says
// nothing.
export function readTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_PRIVATE_READ_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0 ? configured : 30_000;
}

function runGh(args: readonly string[], signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "gh",
      [...args],
      {
        timeout: readTimeoutMs(),
        signal,
        maxBuffer: 1024 * 1024,
        encoding: "utf8",
        env: { ...process.env, GH_PROMPT_DISABLED: "1" },
      },
      (error, stdout) => {
        if (error) {
          const failure: Error = error;
          reject(failure);
          return;
        }
        resolve(stdout);
      },
    );
  });
}

export const commitShaPattern = /^[0-9a-f]{40}$/;

export async function resolveRevisionViaGh(
  repository: string,
  ref: string,
  signal: AbortSignal,
): Promise<string> {
  const stdout = await runGh(
    ["api", `repos/${repository}/commits/${ref}`, "--jq", ".sha"],
    signal,
  );
  const sha = stdout.trim();
  if (!commitShaPattern.test(sha)) {
    throw new Error("gh did not answer the ref read with a commit sha.");
  }
  return sha;
}

// One pinned file at a known repository path. Callers that need the catalog
// backlog use the source's own `backlogPath`; extra canonical/plan reads use
// paths already checked against that revision's records
// (`./privatePathAllowlist.ts`).
export async function readRepositoryFileViaGh(
  repository: string,
  path: string,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  return runGh(
    [
      "api",
      "-H",
      "Accept: application/vnd.github.raw+json",
      `repos/${repository}/contents/${path}?ref=${revision}`,
    ],
    signal,
  );
}
