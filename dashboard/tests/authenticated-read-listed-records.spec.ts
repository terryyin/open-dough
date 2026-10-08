// The records listed beside the backlog (done records, agent profiles) as the
// local authenticated read boundary (../server/listedRecordsRead.ts) reads
// them -- done records as their catalog names them
// (../server/doneCatalogRead.ts): several at once, and each only while
// GitHub's listing names a blob the boundary has not read, so a later
// revision asks only for new or changed records. A failed record read names
// that record. Tested directly against real HTTP and a synthetic `gh`
// answering from the fake GitHub, observing the `gh` calls that reach it.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
  type GhCall,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
// Each test publishes its own revisions and record texts: the boundary
// remembers what it read for as long as the server runs.
const revisionOf = (pair: string) => pair.repeat(20);
const doneDirectory = ".planning/done";
const catalogPath = `${doneDirectory}/.catalog.json`;
const agentsDirectory = ".planning/agents";
const settingsPath = ".planning/open-dough.json";

// Done records named `SEED-<n>_x.json`, each holding text of its own, which
// their catalog lists as records it could not read.
function doneRecords(
  label: string,
  count: number,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    [...Array(count).keys()].map((index) => [
      `${doneDirectory}/SEED-${String(index + 1).padStart(3, "0")}_x.json`,
      `{"test":"${label}","record":${String(index + 1)}}\n`,
    ]),
  );
}

// The content reads of records in `directory` at `revision` that reached
// GitHub, by path.
function contentReads(
  calls: readonly GhCall[],
  directory: string,
  revision: string,
): string[] {
  return calls.flatMap(({ request }) =>
    request.kind === "content" &&
    request.revision === revision &&
    request.path.startsWith(`${directory}/`)
      ? [request.path]
      : [],
  );
}

test.describe("authenticated listed records read (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const listedAt = async (revision: string, query: string) =>
    rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&${query}`,
      headers: { Origin: server.origin },
    });
  // Every record of `files`, by the file names their catalog lists.
  const fileOf = (path: string) =>
    `&file=${encodeURIComponent(path.split("/").pop() ?? "")}`;
  const doneAt = (revision: string, files: Readonly<Record<string, string>>) =>
    listedAt(revision, `done=bodies${Object.keys(files).map(fileOf).join("")}`);
  const profilesAt = (revision: string) =>
    listedAt(revision, "agents=profiles");

  test("several done records are read from GitHub at once", async () => {
    const revision = revisionOf("a1");
    const files = doneRecords("together", 6);
    const published = publishes({
      revision,
      files: withDoneCatalog(files, doneDirectory),
    });
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.github.serve(everyRepository, async (call) => {
      if (
        call.request.kind === "content" &&
        call.request.path !== catalogPath
      ) {
        await released;
      }
      return published(call);
    });

    const answered = doneAt(revision, files);
    try {
      await expect
        .poll(
          () =>
            contentReads(server.github.calls, doneDirectory, revision).filter(
              (path) => path !== catalogPath,
            ).length,
          { timeout: 5_000 },
        )
        .toBeGreaterThan(1);
    } finally {
      release();
    }

    const response = await answered;
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      records: Object.entries(files).map(([path, text]) => ({ path, text })),
    });
  });

  test("a later revision asks GitHub only for the record whose blob changed", async () => {
    const first = revisionOf("b2");
    const second = revisionOf("c3");
    const files = doneRecords("unchanged", 4);
    const changed = `${doneDirectory}/SEED-003_x.json`;
    const later = { ...files, [changed]: '{"test":"changed"}\n' };

    server.github.serve(
      everyRepository,
      publishes({
        revision: first,
        files: withDoneCatalog(files, doneDirectory),
      }),
    );
    expect((await doneAt(first, files)).status).toBe(200);

    server.github.serve(
      everyRepository,
      publishes({
        revision: second,
        files: withDoneCatalog(later, doneDirectory),
      }),
    );
    const response = await doneAt(second, later);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision: second,
      records: Object.entries(later).map(([path, text]) => ({ path, text })),
    });
    expect(contentReads(server.github.calls, doneDirectory, second)).toEqual([
      catalogPath,
      changed,
    ]);
  });

  test("one failing record among several fails the read naming that record", async () => {
    const revision = revisionOf("d4");
    const files = doneRecords("failing", 3);
    const failing = `${doneDirectory}/SEED-002_x.json`;
    const after = `${doneDirectory}/SEED-003_x.json`;
    const published = publishes({
      revision,
      files: withDoneCatalog(files, doneDirectory),
    });
    let failed: () => void = () => undefined;
    const answeredFailure = new Promise<void>((resolve) => {
      failed = resolve;
    });
    const answerer: RepositoryAnswerer = async (call) => {
      const { request } = call;
      if (request.kind === "content" && request.path === failing) {
        // Fails once a later record's read has started, when it does, so a
        // failure named by whichever read started last would name that one.
        await expect
          .poll(
            () => contentReads(server.github.calls, doneDirectory, revision),
            { timeout: 1_000 },
          )
          .toContain(after)
          .catch(() => undefined);
        failed();
        return { exitCode: 1, stderr: "connection reset" };
      }
      if (request.kind === "content" && request.path === after) {
        await answeredFailure;
      }
      return published(call);
    };
    server.github.serve(everyRepository, answerer);

    const response = await doneAt(revision, files);
    expect(response.status).toBe(502);
    expect((JSON.parse(response.body) as { error: string }).error).toContain(
      `while reading ${failing} at ${revision}.`,
    );
  });

  test("a later revision with unchanged profiles asks GitHub for no profile content", async () => {
    const first = revisionOf("e5");
    const second = revisionOf("f6");
    const files = {
      [`${agentsDirectory}/akiho-chan.json`]: '{"profile":"akiho-chan"}\n',
      [`${agentsDirectory}/kirara-chan.json`]: '{"profile":"kirara-chan"}\n',
      [settingsPath]: '{"nerds":true}',
    };
    const profiles = Object.entries(files)
      .filter(([path]) => path.startsWith(`${agentsDirectory}/`))
      .map(([path, text]) => ({ path, text }));

    server.github.serve(everyRepository, publishes({ revision: first, files }));
    const before = await profilesAt(first);
    expect(before.status).toBe(200);
    expect(JSON.parse(before.body)).toEqual({
      revision: first,
      profiles,
      settings: '{"nerds":true}',
    });

    server.github.serve(
      everyRepository,
      publishes({ revision: second, files }),
    );
    const after = await profilesAt(second);
    expect(after.status).toBe(200);
    expect(JSON.parse(after.body)).toEqual({
      revision: second,
      profiles,
      settings: '{"nerds":true}',
    });
    expect(contentReads(server.github.calls, agentsDirectory, second)).toEqual(
      [],
    );
  });
});
