// Synthetic remote CI answers; mailbox observation and terminal receipts stay real.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { privateRequestOwner } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";

export function completionCi(machine: string, revisions: readonly string[]) {
  const release = path.join(machine, "release-ci");
  const bin = path.join(machine, "ci-provider-bin");
  mkdirSync(bin);
  const runs = revisions.map((head_sha, index) => ({
    id: index + 1,
    run_attempt: 1,
    head_sha,
    head_branch: "main",
    event: "push",
    status: "completed",
    conclusion: "success",
    html_url: `https://ci.invalid/${index}`,
    created_at: `2026-10-02T00:0${index}:00Z`,
  }));
  const provider = path.join(bin, "gh");
  const requests = privateRequestOwner();
  // Answers `gh api --include` as GitHub's Actions API does: the workflow,
  // its runs once released, no jobs, and any run or attempt as succeeded.
  writeFileSync(
    provider,
    `#!/usr/bin/env node
import { existsSync } from 'node:fs';
if (process.argv[2] === 'auth') process.exit(1);
const route = process.argv[4] ?? '';
const runs = ${JSON.stringify(runs)};
const answer = (body) =>
  process.stdout.write('HTTP/2.0 200 OK\\r\\n\\r\\n' + JSON.stringify(body));
if (/\\/workflows\\/[^/]+$/.test(route)) answer({ id: 7001, name: 'CI' });
else if (/\\/workflows\\/7001\\/runs\\?/.test(route))
  answer({ workflow_runs: existsSync(${JSON.stringify(release)}) ? runs : [runs[0]] });
else if (/\\/jobs\\?/.test(route)) answer({ total_count: 0, jobs: [] });
else answer({ run_attempt: 1, status: 'completed', conclusion: 'success', html_url: 'https://ci.invalid/run' });
`,
    { mode: 0o755 },
  );
  return {
    provider,
    release: () => {
      writeFileSync(release, "CI result available after registration\n");
    },
    env: {
      ...process.env,
      DOUGH_CI_MAILBOX_ROOT: path.join(machine, "mailboxes"),
      PATH: `${bin}:${process.env.PATH}`,
      ...requests.env,
    },
    // Ends the request owner the observers asked this provider through.
    endRequests: requests.end,
  };
}
