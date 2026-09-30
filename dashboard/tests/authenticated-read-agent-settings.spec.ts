// The project setting file (.planning/open-dough.json) as the local
// authenticated read boundary (../server/authenticatedRead.ts) answers it
// beside the agent profiles: read at the pinned revision only as part of the
// profile read, its text returned as published, and null when the revision has
// none. No client-supplied path reaches it. Tested directly against real HTTP
// and a synthetic `gh` answering from the fake GitHub. What the roster shows
// from it is ./agent-roster-collection.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import {
  commitAnswer,
  directoryListingAnswer,
  notFoundAnswer,
  rawFileAnswer,
} from "./originAnswers.ts";
import { rawRequest } from "./support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
// Each test publishes its own revision: the boundary remembers what it read
// at a pinned revision.
const revisionOf = (pair: string) => pair.repeat(20);
const settingsPath = ".planning/open-dough.json";

// A revision with an empty backlog and no agent profiles whose setting file
// holds `settings`, is absent (undefined), or cannot be read (null: a
// connection failure).
function publishedRevision(
  revision: string,
  settings: string | undefined | null,
): RepositoryAnswerer {
  return ({ request }) => {
    if (request.kind === "ref") {
      return Promise.resolve(commitAnswer(revision));
    }
    if (request.kind === "listing") {
      return Promise.resolve(directoryListingAnswer(request.path, []));
    }
    if (request.kind === "content" && request.path === settingsPath) {
      return Promise.resolve(
        settings === null
          ? { exitCode: 1, stderr: "connection reset" }
          : settings === undefined
            ? notFoundAnswer()
            : rawFileAnswer(settings),
      );
    }
    return Promise.resolve(
      request.kind === "content"
        ? rawFileAnswer("# Product backlog\n\n## Taken\n\n## Backlog list\n")
        : notFoundAnswer(),
    );
  };
}

test.describe("authenticated agent settings read (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const profilesAt = async (revision: string) =>
    rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&agents=profiles`,
      headers: { Origin: server.origin },
    });

  test("the profile read returns the setting file's text published at the pinned revision", async () => {
    const revision = revisionOf("5e");
    server.github.serve(
      everyRepository,
      publishedRevision(revision, '{"nerds":true}'),
    );
    const answered = await profilesAt(revision);
    expect(answered.status).toBe(200);
    expect(JSON.parse(answered.body)).toEqual({
      revision,
      profiles: [],
      settings: '{"nerds":true}',
    });
  });

  test("a revision without the setting file answers null, while any other failure to read it fails the read", async () => {
    const revision = revisionOf("6f");
    server.github.serve(
      everyRepository,
      publishedRevision(revision, undefined),
    );
    const absent = await profilesAt(revision);
    expect(absent.status).toBe(200);
    expect(JSON.parse(absent.body)).toEqual({
      revision,
      profiles: [],
      settings: null,
    });

    server.github.serve(everyRepository, publishedRevision(revision, null));
    const failed = await profilesAt(revision);
    expect(failed.status).toBe(502);
    expect(failed.body).toContain(settingsPath);
  });

  test("a client-supplied path to the setting file is refused as unreachable", async () => {
    const revision = revisionOf("7a");
    server.github.serve(
      everyRepository,
      publishedRevision(revision, '{"nerds":true}'),
    );
    const refused = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(settingsPath)}`,
      headers: { Origin: server.origin },
    });
    expect(refused.status).toBe(404);
  });
});
