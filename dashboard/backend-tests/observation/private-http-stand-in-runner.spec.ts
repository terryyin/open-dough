// Ownership and isolation of the Cursor runner stand-in selected by private
// HTTP fixtures that do not prove Cursor operations
// (../../tests/support/cursorRunnerStandIn.ts via dashboardServer). The
// authenticated-read refusal complete spec exercises the same opt-in for its
// refusals and accepted read; this file owns absence of a real runner,
// unexpected protocol diagnostics after cleanup, overlapping fixtures and
// runs, and retirement of owned resources after success or failure.

import { existsSync } from "node:fs";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { describedBacklog } from "../../tests/describedRevisions.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import {
  expectCursorRunnerStandIn,
  runnersFor,
} from "../../tests/support/cursorRunnerJourney.ts";

const knownSourceId = "open-dough";
const withStandIn = {
  ...developmentBoundary,
  cursorRunner: "stand-in" as const,
};

async function readRevision(baseURL: string, origin: string) {
  return rawRequest({
    url: `${baseURL}/__authenticated-read?source=${knownSourceId}`,
    headers: { Origin: origin },
  });
}

test("a stand-in private HTTP fixture has no real Cursor runner", async () => {
  const server = await startDashboardServer(withStandIn);
  try {
    expectCursorRunnerStandIn(server.home);
    expect(
      (
        await rawRequest({
          url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
          headers: { Origin: "http://evil.example" },
        })
      ).status,
    ).toBe(403);
  } finally {
    await server.close();
  }
  expect(existsSync(server.home)).toBe(false);
  expect(readCursorRunnerAddress(server.home)).toBeUndefined();
  expect(runnersFor(server.home)).toBe(0);
});

test("unexpected Cursor protocol work fails the stand-in fixture after cleanup", async () => {
  const server = await startDashboardServer(withStandIn);
  const home = server.home;
  const address = readCursorRunnerAddress(home);
  expect(address).toBeDefined();
  await rawRequest({
    url: `http://127.0.0.1:${String(address?.port)}/keep`,
    method: "POST",
    body: "{}",
    headers: { "content-type": "application/json" },
  });
  await expect(server.close()).rejects.toThrow(
    /Unexpected Cursor protocol work on the runner stand-in: POST \/keep/,
  );
  expect(existsSync(home)).toBe(false);
  expect(readCursorRunnerAddress(home)).toBeUndefined();
  expect(runnersFor(home)).toBe(0);
});

test("overlapping stand-in fixtures keep private answers and retire only their own resources", async () => {
  const firstRevision = "ab".repeat(20);
  const secondRevision = "cd".repeat(20);
  const emptyBacklog = describedBacklog(makeMe.aRepository.please());
  const first = await startDashboardServer(withStandIn);
  const second = await startDashboardServer(withStandIn);
  const firstHome = first.home;
  const secondHome = second.home;
  try {
    first.github.serve(
      everyRepository,
      publishes({
        revision: firstRevision,
        backlog: emptyBacklog,
      }),
    );
    second.github.serve(
      everyRepository,
      publishes({
        revision: secondRevision,
        backlog: emptyBacklog,
      }),
    );
    const firstRead = await readRevision(first.baseURL, first.origin);
    const secondRead = await readRevision(second.baseURL, second.origin);
    expect(firstRead.status).toBe(200);
    expect(secondRead.status).toBe(200);
    expect(JSON.parse(firstRead.body)).toMatchObject({
      revision: firstRevision,
    });
    expect(JSON.parse(secondRead.body)).toMatchObject({
      revision: secondRevision,
    });
    expect(runnersFor(firstHome)).toBe(0);
    expect(runnersFor(secondHome)).toBe(0);
    await first.close();
    expect(existsSync(firstHome)).toBe(false);
    expect(readCursorRunnerAddress(firstHome)).toBeUndefined();
    const afterClose = await readRevision(second.baseURL, second.origin);
    expect(afterClose.status).toBe(200);
    expect(JSON.parse(afterClose.body)).toMatchObject({
      revision: secondRevision,
    });
  } finally {
    await second.close().catch(() => undefined);
    if (existsSync(firstHome)) await first.close().catch(() => undefined);
  }
  expect(existsSync(secondHome)).toBe(false);
  expect(readCursorRunnerAddress(secondHome)).toBeUndefined();
  expect(runnersFor(secondHome)).toBe(0);
});

test("a failed stand-in fixture still retires its owned resources", async () => {
  const server = await startDashboardServer(withStandIn);
  const home = server.home;
  expectCursorRunnerStandIn(home);
  // Simulate the case failing after the fixture started: close still owns
  // retirement of the listener, address, server, request owner and scratch.
  await expect(async () => {
    try {
      throw new Error(
        "deliberate case failure while the stand-in fixture is live",
      );
    } finally {
      await server.close();
    }
  }).rejects.toThrow(/deliberate case failure/);
  expect(existsSync(home)).toBe(false);
  expect(readCursorRunnerAddress(home)).toBeUndefined();
  expect(runnersFor(home)).toBe(0);
});
