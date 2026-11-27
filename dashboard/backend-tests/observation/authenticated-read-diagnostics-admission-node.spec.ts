// A fresh diagnostic read at the authenticated read boundary
// (../../server/authenticatedRead.ts, ../../server/readDiagnostics.ts) is
// empty and asks GitHub nothing. Unknown source, disallowed origin, and
// non-GET are refused before any GitHub call. The production environment
// mounts the same route through configurePreviewServer and also asks
// GitHub nothing. In process over Node HTTP. The failure list is one
// module-level list, so the empty read is the first case.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { installAuthenticatedReadMiddleware } from "../../server/authenticatedRead.ts";
import { authenticatedReadDiagnosticsEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import { startFakeGitHub } from "../../test-support/support/fakeGitHub.ts";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import { startInProcessBoundaryHttp } from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

const source = makeMe.aPublishedSource.openDough.please();

function diagnosticsUrl(origin: string, id: string): string {
  return `${origin}${authenticatedReadDiagnosticsEndpoint}?source=${id}`;
}

function failuresOf(body: string): unknown {
  const parsed: unknown = JSON.parse(body);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("failures" in parsed)
  ) {
    throw new Error("The diagnostic answer has no failure list.");
  }
  return parsed.failures;
}

describe("development diagnostic admission", () => {
  let read: Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;

  beforeAll(async () => {
    read = await startInProcessAuthenticatedRead();
  });

  afterAll(async () => {
    await read.close();
  });

  test("a fresh diagnostic read is empty and does no upstream work", async () => {
    const callsBefore = read.github.calls.length;
    const seen = await rawRequest({
      url: diagnosticsUrl(read.origin, source.id),
      headers: { Origin: read.origin },
    });
    expect(seen.status).toBe(200);
    expect(failuresOf(seen.body)).toEqual([]);
    expect(read.github.calls).toHaveLength(callsBefore);
  });

  test("refuses an unknown source, a disallowed origin, and a non-GET before any GitHub call", async () => {
    const callsBefore = read.github.calls.length;
    expect(
      (
        await rawRequest({
          url: diagnosticsUrl(read.origin, "not-a-real-project"),
          headers: { Origin: read.origin },
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await rawRequest({
          url: diagnosticsUrl(read.origin, source.id),
          headers: { Origin: "http://evil.example" },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await rawRequest({
          url: diagnosticsUrl(read.origin, source.id),
          method: "POST",
          headers: { Origin: read.origin },
        })
      ).status,
    ).toBe(405);
    expect(read.github.calls).toHaveLength(callsBefore);
  });
});

test("the production environment mounts the same route and asks GitHub nothing", async () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-production-read-"));
  const github = await startFakeGitHub();
  const gh = installFakeGh(tempRoot);
  const restore = withRestoredEnv({
    ...fakeGhEnv(gh, github.url),
    HOME: path.join(tempRoot, "home"),
  });
  try {
    const boundary = await startInProcessBoundaryHttp(
      {
        name: "dough-authenticated-read",
        install: installAuthenticatedReadMiddleware,
      },
      "production",
    );
    try {
      const callsBefore = github.calls.length;
      const seen = await rawRequest({
        url: diagnosticsUrl(boundary.origin, source.id),
        headers: { Origin: boundary.origin },
      });
      expect(seen.status).toBe(200);
      expect(failuresOf(seen.body)).toEqual([]);
      expect(github.calls).toHaveLength(callsBefore);
    } finally {
      try {
        await boundary.closeBoundary();
      } finally {
        await boundary.closeHttp();
      }
    }
  } finally {
    restore();
    await endFakeGh(gh);
    await github.close();
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
