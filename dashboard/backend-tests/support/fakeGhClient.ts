// A private installation of the real synthetic CLI, with observable raw output.
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "../../tests/support/pageTest.ts";
export { expect };
import { startFakeGitHub } from "../../tests/support/fakeGitHub.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../tests/support/fakeGh.ts";
import {
  endGroup,
  spawnGroupLeader,
} from "../../tests/support/processGroup.ts";

export async function clientFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-gh-client-"));
  const scratch = path.join(root, "scratch");
  mkdirSync(scratch);
  const github = await startFakeGitHub();
  const gh = installFakeGh(root, { transport: "cli" });
  const children: ReturnType<typeof spawnGroupLeader>[] = [];
  const environment = {
    ...process.env,
    ...fakeGhEnv(gh, github.url),
    GH_TOKEN: "fixture-token",
    HOME: root,
    CURL_HOME: root,
    TMPDIR: scratch,
    HTTP_PROXY: "http://127.0.0.1:1",
    http_proxy: "http://127.0.0.1:1",
    ALL_PROXY: "http://127.0.0.1:1",
    all_proxy: "http://127.0.0.1:1",
    NO_PROXY: "",
    no_proxy: "",
  };
  writeFileSync(path.join(root, ".curlrc"), "url = http://127.0.0.1:1\nfail\n");
  const start = (
    command: string,
    argv: string[],
    extra: Record<string, string | undefined> = {},
  ) => {
    const child = spawnGroupLeader(command, argv, {
      env: { ...environment, ...extra },
    });
    children.push(child);
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    const result = new Promise<{
      code: number | null;
      signal: string | null;
      stdout: Buffer;
      stderr: Buffer;
    }>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => {
        resolve({
          code,
          signal,
          stdout: Buffer.concat(stdout),
          stderr: Buffer.concat(stderr),
        });
      });
    });
    return { child, result };
  };
  return {
    root,
    scratch,
    github,
    gh,
    run(argv: string[], extra: Record<string, string | undefined> = {}) {
      return start(path.join(gh.binDir, "gh"), argv, extra);
    },
    runOwner() {
      const entry = new URL(
        "../../../src/skills/dough-execute-plan/scripts/github-requests.mjs",
        import.meta.url,
      ).href;
      return start(process.execPath, [
        "--input-type=module",
        "-e",
        `
        import { GitHubRequests } from ${JSON.stringify(entry)};
        const requests = new GitHubRequests({ boundMs: 30000, backoffBaseMs: 1 });
        const answer = await requests.request(["api", "repos/test/repo"], new AbortController().signal);
        if (answer.failure) throw new Error(JSON.stringify(answer.failure));
      `,
      ]);
    },
    async close() {
      await Promise.all(children.map(endGroup));
      await endFakeGh(gh);
      await github.close();
      rmSync(root, { recursive: true, force: true });
    },
  };
}

type Client = Awaited<ReturnType<typeof clientFixture>>;
export const test = base.extend<{ client: Client }>({
  // eslint-disable-next-line no-empty-pattern
  client: async ({}, use) => {
    const client = await clientFixture();
    try {
      await use(client);
    } finally {
      await client.close();
    }
  },
});
