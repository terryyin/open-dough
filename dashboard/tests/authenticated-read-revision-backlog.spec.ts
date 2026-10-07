// The local authenticated read boundary reading the backlog, tested directly
// against real HTTP and the synthetic `gh`, not through the browser: at a
// revision already resolved (`revision` without `path`,
// ../server/authenticatedRead.ts) it never resolves `main` again, and a
// membership read asks anew which commit the ref names but reads the backlog
// at that commit only once per dashboard process. Revision checks:
// ./authenticated-read-revision-check.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, publishes } from "./support/fakeGitHub.ts";
import { rawRequest } from "./support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";

test.describe("authenticated read boundary backlog (dev launch mode)", () => {
  let server: DashboardServer;
  // A membership read: the configured ref resolved, with its backlog.
  const membershipRead = () =>
    rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("reads the backlog pinned to the named revision without resolving main", async () => {
    server.github.serve(
      everyRepository,
      publishes({ revision: revisionA, backlog }),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon&revision=${revisionB}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(JSON.parse(response.body)).toEqual({ revision: revisionB, backlog });
    expect(server.ghCalls()).toEqual([
      [
        "api",
        "--include",
        "-H",
        "Accept: application/vnd.github.raw",
        `repos/terryyin/pygardon/contents/.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`,
      ],
    ]);
  });

  test("refuses a revision that is not a commit sha before launching gh", async () => {
    const callsBefore = server.ghCalls().length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=pygardon&revision=main`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(400);
    expect(server.ghCalls()).toHaveLength(callsBefore);
  });

  test("asks again which commit the ref names on each membership read, but not for a backlog already read at that commit, and reads a new commit's backlog", async () => {
    const revision = "3a".repeat(20);
    const nextRevision = "3b".repeat(20);
    const nextBacklog =
      "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [Next](seeds/SEED-next.md#next) — SEED-next#next\n";
    const refCall = [
      "api",
      "--include",
      `repos/${knownRepository}/commits/main`,
      "--jq",
      ".sha",
    ];
    const backlogCall = (at: string) => [
      "api",
      "--include",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${knownRepository}/contents/.planning/PRODUCT-BACKLOG.md?ref=${at}`,
    ];
    const membership = async () => {
      const response = await membershipRead();
      expect(response.status).toBe(200);
      return JSON.parse(response.body) as {
        revision: string;
        backlog: string;
        askedAt: string;
      };
    };

    server.github.serve(everyRepository, publishes({ revision, backlog }));
    let callsBefore = server.ghCalls().length;
    const first = await membership();
    const second = await membership();
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      refCall,
      backlogCall(revision),
      refCall,
    ]);
    expect(first).toMatchObject({ revision, backlog });
    expect(second).toMatchObject({ revision, backlog });
    // Each answer carries when its own ref resolution asked GitHub.
    expect(Date.parse(second.askedAt)).toBeGreaterThanOrEqual(
      Date.parse(first.askedAt),
    );

    server.github.serve(
      everyRepository,
      publishes({ revision: nextRevision, backlog: nextBacklog }),
    );
    callsBefore = server.ghCalls().length;
    expect(await membership()).toMatchObject({
      revision: nextRevision,
      backlog: nextBacklog,
    });
    // The new commit's backlog is read there directly, never first compared
    // with the one whose backlog was read before.
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      refCall,
      backlogCall(nextRevision),
    ]);
  });

  test("names the backlog at the resolved revision when its read fails, and asks for it again on the next membership read", async () => {
    const revision = "3c".repeat(20);
    const published = publishes({ revision, backlog });
    let refuse = true;
    server.github.serve(everyRepository, (call) =>
      refuse && call.request.kind === "content"
        ? Promise.resolve({
            status: 500,
            contentType: "application/json",
            body: "{}",
          })
        : published(call),
    );
    const failed = await membershipRead();
    expect(failed.status).toBe(502);
    expect((JSON.parse(failed.body) as { error: string }).error).toContain(
      `while reading .planning/PRODUCT-BACKLOG.md at ${revision}.`,
    );

    refuse = false;
    const callsBefore = server.ghCalls().length;
    const read = await membershipRead();
    expect(read.status).toBe(200);
    expect(JSON.parse(read.body)).toMatchObject({ revision, backlog });
    // The ref and the backlog, never compared with the revision whose backlog
    // was read before.
    expect(server.ghCalls().slice(callsBefore)).toHaveLength(2);
  });
});
