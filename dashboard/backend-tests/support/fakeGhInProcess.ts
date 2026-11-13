// A direct real request consumer with the API executable poisoned: successful
// reads must be answered inside its real private request-owner process.
import {
  existsSync,
  mkdtempSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { GitHubRequests } from "../../../src/skills/dough-execute-plan/scripts/github-requests.mjs";
import { ownerRecords } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { expect, test as base } from "../../tests/support/pageTest.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../tests/support/fakeGh.ts";
import { startFakeGitHub } from "../../tests/support/fakeGitHub.ts";
import { runFakeGh } from "../../tests/support/fakeGhTransport.mjs";
import { withRestoredEnv } from "../../tests/support/testEnv.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
export { expect };

type RecordedOwner = {
  readonly pid: number;
  readonly protocol: number;
  readonly token: string;
  readonly socket: string;
  readonly directory: string;
  readonly file: string;
};

export async function inProcessFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-gh-in-process-"));
  const github = await startFakeGitHub();
  const gh = installFakeGh(root, { transport: "in-process" });
  const poison = path.join(root, "api-launched");
  const executable = path.join(gh.binDir, "gh");
  unlinkSync(executable);
  writeFileSync(
    executable,
    `#!/bin/sh
if [ "$1" = api ]; then printf poison > ${JSON.stringify(poison)}; exit 99; fi
exec ${JSON.stringify(path.join(repoRoot, "dashboard/tests/fixtures/fake-gh"))} "$@"
`,
    { mode: 0o755 },
  );
  const env = { ...fakeGhEnv(gh, github.url), GH_TOKEN: "fixture-token" };
  const restore = withRestoredEnv(env);
  const consumers: GitHubRequests[] = [];
  let closed = false;
  const consumer = (options = {}) => {
    const requests = new GitHubRequests({
      boundMs: 10_000,
      backoffBaseMs: 1,
      ...options,
    });
    consumers.push(requests);
    return requests;
  };
  return {
    root,
    github,
    gh,
    env,
    consumer,
    owners: (): RecordedOwner[] =>
      ownerRecords(gh.requestOwnerRoot) as RecordedOwner[],
    apiLaunched: () => existsSync(poison),
    read: (args: string[], options = {}) =>
      consumer(options).request(args, new AbortController().signal),
    raw: (args: string[], options: Record<string, unknown> = {}) =>
      new Promise<{
        error: (Error & { code?: string | number }) | null;
        stdout: Buffer;
        stderr: Buffer;
        pid: unknown;
      }>((resolve) => {
        const child = runFakeGh(
          args,
          { env, encoding: "buffer", ...options },
          (error: Error | null, stdout: Buffer, stderr: Buffer) => {
            resolve({ error, stdout, stderr, pid: Reflect.get(child, "pid") });
          },
        );
      }),
    async close() {
      if (closed) {
        return;
      }
      closed = true;
      for (const requests of consumers) {
        requests.disconnect();
      }
      await endFakeGh(gh);
      await github.close();
      restore();
      rmSync(root, { recursive: true, force: true });
    },
  };
}

type Client = Awaited<ReturnType<typeof inProcessFixture>>;
export const test = base.extend<{ client: Client }>({
  // eslint-disable-next-line no-empty-pattern
  client: async ({}, use) => {
    const client = await inProcessFixture();
    try {
      await use(client);
    } finally {
      await client.close();
    }
  },
});
