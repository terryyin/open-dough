// Activation crosses real consumer/owner process boundaries. Unmatched native
// child APIs retain their overloads and promisified return values.
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, hangs } from "../../tests/support/fakeGitHub.ts";
import { expect, test } from "../support/fakeGhInProcess.ts";

test("an explicitly selected boundary server reaches the fast owner with its API executable poisoned", async ({
  client,
}) => {
  client.github.serve(everyRepository, hangs);
  const server = await startDashboardServer({
    ...developmentBoundary,
    ghTransport: "in-process",
    github: client.github,
    pathPrefix: [client.gh.binDir],
    requestOwnerRoot: client.gh.requestOwnerRoot,
  });
  try {
    const reading = fetch(
      `${server.baseURL}/__authenticated-read?source=open-dough`,
      { headers: { Origin: server.origin } },
    ).catch(() => undefined);
    await expect.poll(() => client.github.unansweredCalls).toBe(1);
    expect(client.apiLaunched()).toBe(false);
    expect(server.ghPid()).toBeUndefined();
    await server.close();
    await reading;
    await expect.poll(() => client.github.unansweredCalls).toBe(0);
  } finally {
    await server.close();
  }
});

test("the owner preload preserves native overloads and promisification while fake API promises have no PID", async ({
  client,
}) => {
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "text/plain",
      body: "probe",
    }),
  );
  const script = path.join(client.root, "github-request-owner.mjs");
  writeFileSync(
    script,
    `
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
await new Promise((resolve, reject) => execFile('/usr/bin/true', (error) => error ? reject(error) : resolve()));
const auth = await promisify(execFile)('gh', ['auth', 'token']);
const api = promisify(execFile)('gh', ['api', 'repos/test/repo'], { encoding: 'buffer' });
const answer = await api;
process.stdout.write(JSON.stringify({ auth: auth.stdout, body: answer.stdout.toString(), pid: api.child.pid ?? null }));
`,
  );
  const preload = new URL(
    "../../tests/support/fakeGhPreload.mjs",
    import.meta.url,
  ).href;
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ["--import", preload, script],
    {
      env: { ...process.env, ...client.env },
      timeout: 10_000,
    },
  );
  expect(JSON.parse(stdout)).toEqual({
    auth: "fixture-token",
    body: "probe",
    pid: null,
  });
  expect(client.apiLaunched()).toBe(false);
});

test("the real request bound cancels a held fast call and retires its HTTP request", async ({
  client,
}) => {
  const requests = client.consumer({ boundMs: 1000 });
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "text/plain",
      body: "ready",
    }),
  );
  expect(
    (
      await requests.request(
        ["api", "repos/test/warm"],
        new AbortController().signal,
      )
    ).body,
  ).toBe("ready");
  client.github.serve(everyRepository, hangs);
  const bounded = requests
    .request(["api", "repos/test/held"], new AbortController().signal)
    .catch((error: unknown) => {
      if (!(error instanceof Error) || !("reason" in error)) {
        throw error;
      }
      return error.reason;
    });
  await expect.poll(() => client.github.unansweredCalls).toBe(1);
  expect(await bounded).toEqual({ kind: "timed-out" });
  await expect.poll(() => client.github.unansweredCalls).toBe(0);
  expect(client.apiLaunched()).toBe(false);
});
