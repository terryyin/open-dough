// Synthetic remote CI answers; mailbox observation and terminal receipts stay real.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function completionCi(machine: string, revisions: readonly string[]) {
  const release = path.join(machine, "release-ci");
  const bin = path.join(machine, "ci-provider-bin");
  mkdirSync(bin);
  const runs = revisions.map((headSha, index) => ({
    databaseId: index + 1,
    attempt: 1,
    headSha,
    headBranch: "main",
    workflowName: "CI",
    event: "push",
    status: "completed",
    conclusion: "success",
    url: `https://ci.invalid/${index}`,
    createdAt: `2026-10-02T00:0${index}:00Z`,
  }));
  const provider = path.join(bin, "gh");
  writeFileSync(
    provider,
    `#!/usr/bin/env node\nimport {existsSync} from 'node:fs';\nprocess.stdout.write(JSON.stringify(process.argv.includes('list') ? (existsSync(${JSON.stringify(release)}) ? ${JSON.stringify(runs)} : ${JSON.stringify([runs[0]])}) : {attempt:1,status:'completed',conclusion:'success',url:'https://ci.invalid/run'}));\n`,
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
    },
  };
}
