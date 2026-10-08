// The local authenticated read boundary at a revision its configured ref
// names next, as its specs (./authenticated-read-revision-reuse*.spec.ts)
// drive it: a dev-mode dashboard server over real HTTP and the synthetic
// `gh`, answered from one publication (./revisionReuseOrigin.ts), with every
// `gh` call GitHub received described by kind, path, and revision pair.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { rawRequest } from "./support/rawHttp.ts";
import type { MadeCommit, PathHistories } from "./pathHistoryAnswers.ts";
import {
  answerFrom,
  otherSeedPath,
  planPath,
  seedPath,
  sourceId,
  moved,
  type Files,
  type Publication,
} from "./revisionReuseOrigin.ts";
import { described } from "./revisionReuseCalls.ts";

export type Answer = { readonly status: number; readonly body: unknown };

// Starts the server for the enclosing `test.describe` and stops it after.
export function revisionReuseBoundary() {
  let server: DashboardServer | undefined;
  const started = () => {
    if (server === undefined) {
      throw new Error("The revision reuse boundary has not started.");
    }
    return server;
  };

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server?.close();
  });

  const read = async (query: string): Promise<Answer> => {
    const response = await rawRequest({
      url: `${started().baseURL}/__authenticated-read?source=${sourceId}${query}`,
      headers: { Origin: started().origin },
    });
    return {
      status: response.status,
      body: JSON.parse(response.body) as unknown,
    };
  };
  const at = (revision: string) => ({
    backlog: () => read(`&revision=${revision}`),
    file: (path: string) =>
      read(`&revision=${revision}&path=${encodeURIComponent(path)}`),
    // Which commit added a listed profile's allocation, and who committed it.
    addition: (path: string) =>
      read(
        `&revision=${revision}&path=${encodeURIComponent(path)}&committed=added`,
      ),
    // When a seed or plan the backlog names was last committed.
    lastCommitted: (path: string) =>
      read(
        `&revision=${revision}&path=${encodeURIComponent(path)}&committed=last`,
      ),
    profiles: () => read(`&revision=${revision}&agents=profiles`),
    done: () => read(`&revision=${revision}&done=records`),
  });
  // Every kind of read a page asks at a revision: the backlog, the seeds and
  // plan it names, both listings with the profiles and setting file, and the
  // done records.
  const readEverything = async (revision: string) => {
    const reads = at(revision);
    return [
      await reads.backlog(),
      await reads.file(seedPath),
      await reads.file(otherSeedPath),
      await reads.file(planPath),
      await reads.profiles(),
      await reads.done(),
    ];
  };
  // What GitHub was asked while `run` ran.
  const asked = async (run: () => Promise<unknown>) => {
    const before = started().github.calls.length;
    await run();
    return started().github.calls.slice(before).map(described);
  };

  // Publishes `files` at revision A as what the ref names, with `history`
  // as each path's history there when given, and has this process answer
  // everything there.
  const publishedAt = async (
    revision: string,
    files: Files,
    history: PathHistories = {},
  ) => {
    const published: Publication = {
      trunk: { revision },
      revisions: new Map([[revision, files]]),
      branches: new Map(),
      compared: new Map(),
      made: new Map(),
      histories: new Map([[revision, history]]),
    };
    started().github.serve(everyRepository, (call) =>
      Promise.resolve(answerFrom(published, call)),
    );
    const membership = await read("");
    expect(membership).toMatchObject({ status: 200, body: { revision } });
    for (const answer of await readEverything(revision)) {
      expect(answer.status).toBe(200);
    }
    return published;
  };

  // The ref moves to `revision` with `files`, and `history` as each path's
  // history there when given, by the commits `by` when given; a revision
  // check from `since` finds it.
  const movedTo = async (
    published: Publication,
    since: string,
    {
      revision,
      files,
      history = {},
    }: { revision: string; files: Files; history?: PathHistories },
    by?: readonly MadeCommit[],
  ) => {
    moved(published, revision, files, history, by);
    expect(await read(`&since=${since}`)).toMatchObject({
      status: 200,
      body: { revision, changed: true },
    });
  };

  return {
    server: started,
    read,
    at,
    readEverything,
    asked,
    publishedAt,
    movedTo,
  };
}
