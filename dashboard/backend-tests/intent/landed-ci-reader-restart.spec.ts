// A stopped server no longer owns its old address. A retained-history reader
// starts on its own address even when another listener has claimed the old one.
import http from "node:http";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/preparationPage.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { listenOnReleasedRunnerPort } from "../../tests/support/cursorRunnerRecordedAddress.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import { publishedLanding } from "../../tests/support/landedCiTrunk.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";

test.use({ serverMode: "boundary" });

test("reader restart keeps local evidence when an unrelated listener takes the stopped server's port", async ({
  dashboard,
  origin,
  github,
}) => {
  const landing = await publishedLanding(origin, {
    title: "retained-port",
    receipt: "62000000-0000-4000-8000-000000000001",
    at: "2026-11-05T10:00:00Z",
  });
  keepLandedCiHistory(
    path.join(origin.machine, "home"),
    makeMe.aLandedCiHistory
      .measuredLanding({
        receipt: landing.receipt,
        revision: landing.revision,
        receivedAt: landing.at,
        repository: commonGitDir(origin.project),
        runId: 62,
        startedAt: landing.at,
        completedAt: "2026-11-05T10:02:00Z",
      })
      .inTrunkOrder([landing.revision])
      .please(),
  );
  const before = await landedCiHistory(dashboard);
  expect(before.body).toMatchObject({
    entries: [{ kind: "point", runId: 62, revision: landing.revision }],
  });
  const oldPort = Number(new URL(dashboard.origin).port);
  let unrelatedRequests = 0;
  const occupant = http.createServer((request, response) => {
    request.resume();
    unrelatedRequests += 1;
    response.end("unrelated listener");
  });
  let reader: DashboardServer | undefined;
  try {
    reader = await restartAsLandedCiReader(
      {
        ...dashboard,
        async close() {
          await dashboard.close();
          await listenOnReleasedRunnerPort(occupant, oldPort);
        },
      },
      origin,
      "boundary",
    );
    expect(reader.origin).not.toBe(dashboard.origin);
    const asked = github.calls.length;
    expect(await landedCiHistory(reader)).toEqual(before);
    expect(github.calls).toHaveLength(asked);
    expect(unrelatedRequests).toBe(0);
    expect((await rawRequest({ url: dashboard.origin })).body).toBe(
      "unrelated listener",
    );
    expect(unrelatedRequests).toBe(1);
  } finally {
    await reader?.close();
    if (occupant.listening)
      await new Promise<void>((resolve, reject) =>
        occupant.close((error) => {
          if (error) reject(error);
          else resolve();
        }),
      );
  }
});
