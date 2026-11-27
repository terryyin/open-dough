import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
  doneRecords,
  fileOf,
  identityOf,
  pathOf,
  publishedDone,
} from "../../test-support/support/doneCatalogReads.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  failsWith,
  publishes,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { holdingAnswer } from "../../test-support/support/heldGitHubAnswer.ts";
import {
  processAlive,
  readPid,
} from "../../test-support/support/processGroup.ts";
import { routeDashboardHome } from "../../test-support/support/fixtureOriginRoute.ts";
import {
  abandonedRequest,
  rawRequest,
  type RawRequestOptions,
} from "../../test-support/support/rawHttp.ts";

const openDough = makeMe.aPublishedSource.openDough.please();
const pygardon = makeMe.aPublishedSource.pygardon.please();
const shownRevision = "ab".repeat(20);
const diagnosticMarker = "gho_should-never-reach-a-browser-1234567890";

let origin: string;
let github: FakeGitHub;
let pidPath: string;

beforeEach(async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-read-http-"));
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
  const upstream = await startFakeGitHub();
  onTestFinished(() => upstream.close());
  const gh = installFakeGh(machine);
  pidPath = gh.pidPath;
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
  onTestFinished(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
        server.closeAllConnections();
      }),
  );
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

test.each<
  [
    name: string,
    status: number,
    options: Omit<RawRequestOptions, "url">,
    source?: string,
  ]
>([
  ["a foreign Origin", 403, { headers: { Origin: "http://outside.example" } }],
  ["no Origin or Fetch Metadata", 403, { headers: {} }],
  [
    "cross-site Fetch Metadata without Origin",
    403,
    { headers: { "Sec-Fetch-Site": "cross-site" } },
  ],
  ["an unknown source", 404, {}, "unknown-project"],
  ["a non-GET method", 405, { method: "POST" }],
])(
  "refuses %s before asking GitHub",
  async (...[, status, options, source]) => {
    const response = await checkRevision(
      { ...options, headers: options.headers ?? { Origin: origin } },
      source,
    );
    expect(response.status).toBe(status);
    expect(github.calls).toHaveLength(0);
  },
);

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

test("a departed Done reader ends its child and a later request reads the body", async () => {
  // Observe the native gh child rather than the in-process substitute.
  vi.stubEnv("FAKE_GH_TRANSPORT", "cli");
  const identity = identityOf("leaving", 1);
  const path = pathOf(identity);
  const files = publishedDone({ doneRecords: doneRecords("leaving", 2) });
  const revision = shownRevision;
  const held = holdingAnswer(
    publishes({ revision, files }),
    (request) => request.kind === "content" && request.path === path,
  );
  github.serve(openDough.repository, held.answer);
  onTestFinished(held.release);
  const url = new URL(authenticatedReadEndpoint, origin);
  url.search = new URLSearchParams({
    source: openDough.id,
    revision,
    done: "bodies",
    file: fileOf(identity),
  }).toString();
  const options = { url: url.href, headers: { Origin: origin } };
  const bodyCalls = () =>
    github.calls.filter(
      ({ request }) =>
        request.kind === "content" &&
        request.path === path &&
        request.revision === revision,
    );
  const leaving = abandonedRequest(options);
  await expect.poll(() => bodyCalls().length).toBe(1);
  const pid = readPid(pidPath);
  expect(processAlive(pid)).toBe(true);
  leaving.cutAfter(0);
  await expect.poll(() => processAlive(pid)).toBe(false);
  expect(readFileSync(`${pidPath}.exited`, "utf8").trim()).toBe("SIGTERM");

  held.release();
  const response = await rawRequest(options);
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toEqual({
    revision,
    records: [{ path, text: files[path] }],
  });
  expect(bodyCalls()).toHaveLength(2);
});
