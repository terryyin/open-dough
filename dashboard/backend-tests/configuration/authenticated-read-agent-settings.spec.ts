// The project setting file (.planning/open-dough.json) as the local
// authenticated read boundary (../../server/authenticatedRead.ts) answers it
// beside the agent profiles: read at the pinned revision only as part of the
// profile read, its text returned as published, and null when the revision has
// none. No client-supplied path reaches it. Tested in-process against real HTTP
// and a synthetic `gh` answering from the fake GitHub. What the roster shows
// from it is ../../frontend-tests/stories/agent-roster-collection.spec.ts.

import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import {
  everyRepository,
  type RepositoryAnswerer,
} from "../../test-support/support/fakeGitHub.ts";
import {
  commitAnswer,
  notFoundAnswer,
  rawFileAnswer,
} from "../../test-support/originAnswers.ts";
import { directoryListingAnswer } from "../../test-support/listingAnswers.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { describedBacklog } from "../../test-support/describedRevisions.ts";

const knownSourceId = "open-dough";
// Each test publishes its own revision: the boundary remembers what it read
// at a pinned revision.
const revisionOf = (pair: string) => pair.repeat(20);
const settingsPath = ".planning/open-dough.json";
const emptyBacklog = describedBacklog(makeMe.aRepository.please());

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
        ? rawFileAnswer(emptyBacklog)
        : notFoundAnswer(),
    );
  };
}

describe("authenticated agent settings read (development environment)", () => {
  let server: Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;

  beforeAll(async () => {
    server = await startInProcessAuthenticatedRead();
  });

  afterAll(async () => {
    await server.close();
  });

  const profilesAt = async (revision: string) =>
    rawRequest({
      url: `${server.origin}/__authenticated-read?source=${knownSourceId}&revision=${revision}&agents=profiles`,
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

  test("a revision without the setting file, or one that cannot be read, answers null", async () => {
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
    expect(failed.status).toBe(200);
    expect(JSON.parse(failed.body)).toEqual({
      revision,
      profiles: [],
      settings: null,
    });
  });

  test("a client-supplied path to the setting file is refused as unreachable", async () => {
    const revision = revisionOf("7a");
    server.github.serve(
      everyRepository,
      publishedRevision(revision, '{"nerds":true}'),
    );
    const refused = await rawRequest({
      url: `${server.origin}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(settingsPath)}`,
      headers: { Origin: server.origin },
    });
    expect(refused.status).toBe(404);
  });
});
