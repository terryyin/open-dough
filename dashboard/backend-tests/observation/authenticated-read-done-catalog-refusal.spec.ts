// A failing record read names its path and a departed reader releases its
// request, observed through real HTTP and a controlled upstream process.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { waitUntil } from "../../test-support/support/waitUntil.ts";
import {
  everyRepository,
  publishes,
  type RepositoryAnswerer,
} from "../../test-support/support/fakeGitHub.ts";
import { holdingAnswer } from "../../test-support/support/heldGitHubAnswer.ts";
import { processAlive } from "../../test-support/support/processGroup.ts";
import { abandonedRequest } from "../../test-support/support/rawHttp.ts";
import {
  answerOf,
  doneCatalogReads,
  doneRecords,
  fileOf,
  identityOf,
  pathOf,
  publishedDone,
} from "../../test-support/support/doneCatalogReads.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated done catalog refusal (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      ...developmentBoundary,
      ghTransport: "cli",
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const { catalogAt, bodiesAt, contentAsked } = doneCatalogReads(() => server);

  test("a failing record read names that record", async () => {
    const files = publishedDone({ doneRecords: doneRecords("failing", 3) });
    const failing = pathOf(identityOf("failing", 1));
    const published = publishes({ files });
    const { revision } = published;
    const answerer: RepositoryAnswerer = (call) =>
      call.request.kind === "content" && call.request.path === failing
        ? Promise.resolve({ exitCode: 1, stderr: "connection reset" })
        : published(call);
    server.github.serve(everyRepository, answerer);
    const response = await bodiesAt(revision, [
      fileOf(identityOf("failing", 2)),
      fileOf(identityOf("failing", 1)),
    ]);
    expect(response.status).toBe(502);
    expect(String(answerOf(response).error)).toContain(
      `while reading ${failing} at ${revision}.`,
    );
  });

  test("a record read its request leaves is ended, and a later request asks again", async () => {
    const files = publishedDone({ doneRecords: doneRecords("leaving", 2) });
    const published = publishes({ files });
    const { revision } = published;
    const heldPath = pathOf(identityOf("leaving", 1));
    const held = holdingAnswer(
      published,
      (request) => request.kind === "content" && request.path === heldPath,
    );
    server.github.serve(everyRepository, held.answer);
    expect((await catalogAt(revision)).status).toBe(200);

    const before = server.github.calls.length;
    const leaving = abandonedRequest({
      url: `${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&done=bodies&file=${fileOf(identityOf("leaving", 1))}`,
      headers: { Origin: server.origin },
    });
    await expect
      .poll(() => contentAsked(before), { timeout: 5_000 })
      .toEqual([`content ${heldPath}@${revision}`]);
    leaving.cutAfter(0);
    expect(
      await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      }),
    ).toBe(true);
    expect(server.ghExitedBy()).toBe("SIGTERM");

    held.release();
    const again = await bodiesAt(revision, [fileOf(identityOf("leaving", 1))]);
    expect(answerOf(again)).toEqual({
      revision,
      records: [{ path: heldPath, text: files[heldPath] }],
    });
    expect(contentAsked(before)).toEqual([
      `content ${heldPath}@${revision}`,
      `content ${heldPath}@${revision}`,
    ]);
  });
});
