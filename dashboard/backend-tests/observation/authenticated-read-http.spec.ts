// The installed read middleware owns this loopback request and its wire answer.
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import { boundaryMiddlewareChain } from "../../server/localBoundary.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { headsAnswer, notLoggedIn } from "../../test-support/originAnswers.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  failsWith,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { routeDashboardHome } from "../../test-support/support/fixtureOriginRoute.ts";
import {
  rawRequest,
  type RawRequestOptions,
} from "../../test-support/support/rawHttp.ts";

const openDough = makeMe.aPublishedSource.openDough.please();
const pygardon = makeMe.aPublishedSource.pygardon.please();
const shownRevision = "ab".repeat(20);
const diagnosticMarker = "gho_should-never-reach-a-browser-1234567890";

let origin: string;
let github: FakeGitHub;

beforeEach(async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-read-http-"));
  onTestFinished(() => {
    rmSync(machine, { recursive: true, force: true });
  });
  const upstream = await startFakeGitHub();
  onTestFinished(() => upstream.close());
  const gh = installFakeGh(machine);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  onTestFinished(() => endFakeGh(gh));
  for (const [key, value] of Object.entries({
    ...fakeGhEnv(gh, upstream.url),
    HOME: machine,
    GH_TOKEN: "fixture-token",
  })) {
    vi.stubEnv(key, value);
  }
  routeDashboardHome(machine, upstream);

  onTestFinished(mountProjectConfiguration("development"));
  for (const source of [openDough, pygardon]) {
    appendConfiguredProject(
      makeMe.aConfiguredProject
        .with({ ...source, localPath: path.join(machine, source.id) })
        .please(),
    );
  }

  const middlewares = boundaryMiddlewareChain();
  const server = createServer((req, res) => {
    middlewares.handle(req, res);
  });
  onTestFinished(async () => {
    const closed = new Promise<void>((resolve) =>
      server.close(() => {
        resolve();
      }),
    );
    server.closeAllConnections();
    await closed;
  });
  onTestFinished(installAuthenticatedReadMiddleware(middlewares));
  const listening = once(server, "listening");
  server.listen(0, "127.0.0.1");
  await listening;

  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  github = upstream;
});

function checkRevision(
  options: Omit<RawRequestOptions, "url">,
  source = openDough.id,
) {
  const url = new URL(authenticatedReadEndpoint, origin);
  url.search = new URLSearchParams({ source, since: shownRevision }).toString();
  return rawRequest({ ...options, url: url.href });
}

test.each<{ name: string; headers: Readonly<Record<string, string>> }>([
  { name: "a foreign Origin", headers: { Origin: "http://outside.example" } },
  { name: "no Origin or Fetch Metadata", headers: {} },
  {
    name: "cross-site Fetch Metadata without Origin",
    headers: { "Sec-Fetch-Site": "cross-site" },
  },
])("refuses $name before asking GitHub", async ({ headers }) => {
  const response = await checkRevision({ headers });
  expect(response.status).toBe(403);
  expect(github.calls).toHaveLength(0);
});

test("refuses an unknown source before asking GitHub", async () => {
  const response = await checkRevision(
    { headers: { Origin: origin } },
    "unknown-project",
  );
  expect(response.status).toBe(404);
  expect(github.calls).toHaveLength(0);
});

test("refuses a non-GET method before asking GitHub", async () => {
  const response = await checkRevision({
    method: "POST",
    headers: { Origin: origin },
  });
  expect(response.status).toBe(405);
  expect(github.calls).toHaveLength(0);
});

test("admits same-origin Fetch Metadata without an Origin header", async () => {
  const revision = "cd".repeat(20);
  github.serve(openDough.repository, () =>
    Promise.resolve(headsAnswer({ [openDough.ref]: revision })),
  );

  const response = await checkRevision({
    headers: { "Sec-Fetch-Site": "same-origin" },
  });

  expect(response.status).toBe(200);
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(response.body)).toMatchObject({ revision });
  expect(github.calls).toHaveLength(1);
});

test("reports actionable login guidance for the selected source without exposing diagnostics", async () => {
  github.serve(
    pygardon.repository,
    failsWith(`${notLoggedIn.stderr}token file: ${diagnosticMarker}\n`),
  );

  const response = await checkRevision(
    { headers: { Origin: origin } },
    pygardon.id,
  );

  expect(response.status).toBe(502);
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(response.body)).toEqual({
    error:
      "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read. Run `gh auth login` (check with `gh auth status`), then reload the page.",
  });
  expect(response.body).not.toContain(diagnosticMarker);
  expect(response.body).not.toContain("GH_TOKEN");
});

test("reports a failed revision check without forwarding raw stderr or reading beyond the ref fallback", async () => {
  github.serve(openDough.repository, failsWith(`fatal: ${diagnosticMarker}\n`));

  const response = await checkRevision({ headers: { Origin: origin } });

  expect(response.status).toBe(502);
  expect(response.body).not.toContain(diagnosticMarker);
  expect(response.body).not.toContain("fatal:");
  expect(github.calls.map(({ argv }) => argv)).toEqual([
    [
      "api",
      "--include",
      `repos/${openDough.repository}/git/matching-refs/heads/`,
    ],
    [
      "api",
      "--include",
      `repos/${openDough.repository}/commits/${openDough.ref}`,
      "--jq",
      ".sha",
    ],
  ]);
});
