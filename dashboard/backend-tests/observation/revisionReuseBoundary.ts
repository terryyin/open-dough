// Revision reuse specs exercise authenticated reads over real HTTP in a
// development-environment server. Fake GitHub answers from the same publication
// reached by Git (../../test-support/revisionReuseOrigin.ts).
// GitHub calls are described by kind, path, and full revision.

import { z } from "zod";
import { parseDoneCatalog } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { expectServedHomesReach } from "../../test-support/support/fixtureOriginRoute.ts";
import { defaultRepository } from "../../test-support/publishedOriginBasics.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import type {
  MadeCommit,
  PathHistories,
} from "../../test-support/pathHistoryAnswers.ts";
import {
  advanceReusePublication,
  otherSeedPath,
  planPath,
  reusePublication,
  seedPath,
  serveReusePublication,
  sourceId,
  type Files,
  type ReusePublication,
} from "../../test-support/revisionReuseOrigin.ts";
import { describedExactly } from "../../test-support/revisionReuseCalls.ts";

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
    server = await startDashboardServer(developmentBoundary);
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
    // The done catalog, then every record it lists, as the records'
    // answer.
    done: async () => {
      const catalog = await read(`&revision=${revision}&done=catalog`);
      const listed = z.object({ catalog: z.string() }).safeParse(catalog.body);
      if (catalog.status !== 200 || !listed.success) return catalog;
      const parsed = parseDoneCatalog(listed.data.catalog);
      if (!parsed.ok) throw new Error(parsed.error);
      const { records, unreadable } = parsed.catalog;
      return read(
        `&revision=${revision}&done=bodies${[...records, ...unreadable]
          .map(({ fileName }) => `&file=${encodeURIComponent(fileName)}`)
          .join("")}`,
      );
    },
  });
  // Every kind of read a page asks at a revision: the backlog, the seeds and
  // plan it names, both listings with the profiles and setting file, and the
  // done catalog with the records it lists.
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
    return started().github.calls.slice(before).map(describedExactly);
  };

  // Publishes `files` at revision A as what the ref names, with `history`
  // as each path's history there when given, and has this process answer
  // everything there.
  const publishedAt = async (files: Files, history: PathHistories = {}) => {
    const published = reusePublication(files, history);
    const { revision } = published;
    serveReusePublication(started().github, published);
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
    published: ReusePublication,
    since: string,
    next: { files: Files; history?: PathHistories },
    by?: readonly MadeCommit[],
  ) => {
    const revision = await advanceReusePublication(published, next, by);
    expectServedHomesReach(started().github, defaultRepository, revision);
    expect(await read(`&since=${since}`)).toMatchObject({
      status: 200,
      body: { revision, changed: true },
    });
    return revision;
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
