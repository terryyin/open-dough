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
import * as readRules from "../../src/authenticatedReadRules.ts";
import * as avatarPublication from "../../test-support/authenticatedAvatarRecords.ts";
import { avatarPng } from "../../test-support/avatarAnswers.ts";
import { refuseOriginThroughServedHomes } from "../../test-support/support/fixtureOriginRefusal.ts";
import * as done from "../../test-support/support/doneCatalogReads.ts";
import * as fakeGh from "../../test-support/support/fakeGh.ts";
import * as fakeGitHub from "../../test-support/support/fakeGitHub.ts";
import { holdingAnswer } from "../../test-support/support/heldGitHubAnswer.ts";
import * as processGroup from "../../test-support/support/processGroup.ts";
import {
  routeDashboardHome,
  routeServedHomesToPublication,
} from "../../test-support/support/fixtureOriginRoute.ts";
import * as http from "../../test-support/support/rawHttp.ts";

const openDough = makeMe.aPublishedSource.openDough.please();
const pygardon = makeMe.aPublishedSource.pygardon.please();
const shownRevision = "ab".repeat(20);
const diagnosticMarker = "gho_should-never-reach-a-browser-1234567890";

let origin: string;
let github: fakeGitHub.FakeGitHub;
let pidPath: string;

beforeEach(async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-read-http-"));
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
  const upstream = await fakeGitHub.startFakeGitHub();
  onTestFinished(() => upstream.close());
  const gh = fakeGh.installFakeGh(machine);
  pidPath = gh.pidPath;
  onTestFinished(() => fakeGh.endFakeGh(gh));
  for (const [key, value] of Object.entries({
    ...fakeGh.fakeGhEnv(gh, upstream.url),
    HOME: machine,
    GH_TOKEN: "fixture-token",
    DOUGH_AVATAR_ORIGIN: upstream.url.replace(/\/$/, ""),
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
    const closed = once(server, "close");
    server.close();
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

const urlAt = (endpoint: string, params: Record<string, string>) =>
  `${origin}${endpoint}?${new URLSearchParams(params).toString()}`;
const avatarUrl = () =>
  urlAt(readRules.authenticatedAvatarEndpoint, {
    source: openDough.id,
    revision: avatarPublication.revision,
    path: `${avatarPublication.agents}/yui-chan.json`,
  });

function checkRevision(
  options?: Omit<http.RawRequestOptions, "url">,
  source = openDough.id,
) {
  return http.rawRequest({
    url: urlAt(readRules.authenticatedReadEndpoint, {
      source,
      since: shownRevision,
    }),
    headers: { Origin: origin },
    ...options,
  });
}

test.each([
  {
    name: "a foreign Origin",
    status: 403,
    headers: { Origin: "http://outside.example" },
  },
  { name: "no Origin or Fetch Metadata", status: 403, headers: {} },
  {
    name: "cross-site Fetch Metadata without Origin",
    status: 403,
    headers: { "Sec-Fetch-Site": "cross-site" },
  },
  { name: "an unknown source", status: 404, source: "unknown-project" },
  { name: "a non-GET method", status: 405, method: "POST" },
])(
  "refuses $name before asking GitHub",
  async ({ status, headers, source, method }) => {
    const response = await checkRevision(
      { ...(method && { method }), headers: headers ?? { Origin: origin } },
      source,
    );
    expect(response.status).toBe(status);
    expect(github.calls).toHaveLength(0);
  },
);

test("refuses a foreign avatar Origin before asking GitHub or the avatar host", async () => {
  const headers = { Origin: "http://outside.example" };
  const response = await http.rawRequest({ url: avatarUrl(), headers });
  expect(response.status).toBe(403);
  expect(response.headers["content-type"]).toBe("application/json");
  expect(github.calls).toHaveLength(0);
  expect(github.avatarReads).toHaveLength(0);
});

test("serves the matched avatar bytes with bounded image headers", async () => {
  const image = avatarPng(4);
  github.serve(openDough.repository, avatarPublication.publishedRevisions());
  github.serveAvatars(avatarPublication.avatarHost);
  const response = await http.rawRequest({
    url: avatarUrl(),
    headers: { Origin: origin },
  });
  expect(response).toMatchObject({
    status: 200,
    headers: {
      "content-type": "image/png",
      "x-content-type-options": "nosniff",
      "cache-control": "no-store",
    },
    raw: image.body,
  });
});

test("admits same-origin Fetch Metadata without an Origin header", async () => {
  const published = fakeGitHub.publishes({});
  github.serve(openDough.repository, published);
  routeServedHomesToPublication(github, openDough.repository);
  const response = await checkRevision({
    headers: { "Sec-Fetch-Site": "same-origin" },
  });
  expect(response.status).toBe(200);
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(response.body)).toMatchObject({
    revision: published.revision,
  });
  expect(github.calls).toHaveLength(0);
});

test("reports actionable login guidance for the selected source without exposing diagnostics", async () => {
  github.serve(pygardon.repository, fakeGitHub.publishes({}));
  routeServedHomesToPublication(github, pygardon.repository);
  onTestFinished(
    refuseOriginThroughServedHomes(github, pygardon.repository, 401),
  );
  const response = await checkRevision(undefined, pygardon.id);
  expect(response.status).toBe(502);
  expect(response.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(response.body)).toEqual({
    error:
      "GitHub answered HTTP 401 to the local GitHub CLI while reading main of terryyin/pygardon. Check that `gh auth status` succeeds and that this login can read terryyin/pygardon, then reload the page.",
  });
  expect(response.body).not.toContain(diagnosticMarker);
  expect(response.body).not.toContain("GH_TOKEN");
});

test("reports unavailable origin without forwarding raw stderr or using a REST fallback", async () => {
  const response = await checkRevision();
  expect(response.status).toBe(502);
  expect(response.body).toContain("The published trunk is unavailable");
  expect(response.body).not.toContain("fatal:");
  expect(github.calls).toEqual([]);
});

test("a departed Done reader ends its child and a later request reads the body", async () => {
  // Observe the native gh child rather than the in-process substitute.
  vi.stubEnv("FAKE_GH_TRANSPORT", "cli");
  const record = makeMe.aDoneRecord
    .completed({ identity: "SEED-101#leaving" })
    .please();
  const path = done.pathOf(record.identity);
  const files = done.publishedDone({ doneRecords: [record] });
  const held = holdingAnswer(
    fakeGitHub.publishes({ revision: shownRevision, files }),
    (request) => request.kind === "content" && request.path === path,
  );
  github.serve(openDough.repository, held.answer);
  onTestFinished(held.release);
  const url = urlAt(readRules.authenticatedReadEndpoint, {
    source: openDough.id,
    revision: shownRevision,
    done: "bodies",
    file: done.fileOf(record.identity),
  });
  const options = { url, headers: { Origin: origin } };
  const bodyCalls = () =>
    github.calls.filter(
      ({ request }) =>
        request.kind === "content" &&
        request.path === path &&
        request.revision === shownRevision,
    );
  const leaving = http.abandonedRequest(options);
  await expect.poll(() => bodyCalls().length).toBe(1);
  const pid = processGroup.readPid(pidPath);
  expect(processGroup.processAlive(pid)).toBe(true);
  leaving.cutAfter(0);
  await expect.poll(() => processGroup.processAlive(pid)).toBe(false);
  expect(readFileSync(`${pidPath}.exited`, "utf8").trim()).toBe("SIGTERM");
  held.release();
  const response = await http.rawRequest(options);
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toEqual({
    revision: shownRevision,
    records: [{ path, text: files[path] }],
  });
  expect(bodyCalls()).toHaveLength(2);
});
