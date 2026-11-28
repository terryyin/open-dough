// Typed transient-recovery eligibility on the local authenticated read
// boundary: recognized connectivity, owned timeouts, and upstream HTTP
// 408/500/502/503/504 carry `recovery: "transient"`; access, missing, and
// unknown failures do not. Eligibility is never inferred from the boundary's
// generic 502 wrapper. Shares the harness with
// ./authenticated-read-boundary.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  failsWith,
} from "../../test-support/support/fakeGitHub.ts";
import {
  httpErrorAnswer,
  noConnection,
} from "../../test-support/originAnswers.ts";
import {
  pinnedAt,
  readAt,
  sharedReadsPublished,
  sharedSeedPath,
  unnamedRevision,
} from "../../test-support/support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const knownRepository = "terryyin/open-dough";
const reading = `${sharedSeedPath} at ${unnamedRevision}`;

test.describe("authenticated read transient eligibility (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
    server.github.serve(everyRepository, sharedReadsPublished(unnamedRevision));
    expect((await readAt(server, `&revision=${unnamedRevision}`)).status).toBe(
      200,
    );
  });

  test.afterAll(async () => {
    await server.close();
  });

  for (const status of [408, 500, 502, 503, 504] as const) {
    test(`marks GitHub HTTP ${String(status)} as transient recovery, never from the boundary's 502 wrapper`, async () => {
      server.github.serve(everyRepository, () =>
        Promise.resolve(httpErrorAnswer(status)),
      );
      const response = await pinnedAt(server);
      expect(response.status).toBe(502);
      expect(JSON.parse(response.body)).toEqual({
        error: `GitHub answered HTTP ${String(status)} to the local GitHub CLI while reading ${reading}.`,
        recovery: "transient",
      });
    });
  }

  test("marks a lost GitHub connection as transient recovery", async () => {
    server.github.serve(everyRepository, () => Promise.resolve(noConnection));
    const response = await pinnedAt(server);
    expect(response.status).toBe(502);
    expect(JSON.parse(response.body)).toEqual({
      error: `The local GitHub CLI could not reach GitHub while reading ${reading}.`,
      recovery: "transient",
    });
  });

  for (const { status, label } of [
    { status: 401, label: "authentication" },
    { status: 403, label: "an unmarked 403" },
    { status: 404, label: "a missing fact" },
  ] as const) {
    test(`does not mark ${label} as transient recovery`, async () => {
      server.github.serve(everyRepository, () =>
        Promise.resolve(httpErrorAnswer(status)),
      );
      const response = await pinnedAt(server);
      expect(response.status).toBe(502);
      expect(JSON.parse(response.body)).toEqual({
        error: `GitHub answered HTTP ${String(status)} to the local GitHub CLI while reading ${reading}. Check that \`gh auth status\` succeeds and that this login can read ${knownRepository}, then reload the page.`,
      });
    });
  }

  test("does not mark an unknown CLI failure as transient recovery", async () => {
    server.github.serve(
      everyRepository,
      failsWith("gh: unexplained failure\n"),
    );
    const response = await pinnedAt(server);
    expect(response.status).toBe(502);
    expect(JSON.parse(response.body)).toEqual({
      error: `The local authenticated read failed while reading ${reading}. Check that \`gh auth status\` succeeds and that this login can read ${knownRepository}, then reload the page.`,
    });
  });
});
