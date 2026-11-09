// A recorded landing whose exact CI attempt is still queued. Collection runs
// with Intent closed; the public scoped read must retain the known attempt as
// pending evidence, with its link and no invented execution-time measurement.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  restartAsLandedCiReader,
  resultToLand,
  serveTrunkRuns,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });

const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

function retainedState(home: string): {
  readonly trunkOrder?: readonly string[];
  readonly landings?: Readonly<
    Record<
      string,
      {
        readonly observed: {
          readonly kind: string;
          readonly waitsFor?: string;
        };
      }
    >
  >;
} {
  try {
    return (
      (
        JSON.parse(
          readFileSync(
            path.join(home, ".open-dough/dashboard/landed-ci-history.json"),
            "utf8",
          ),
        ) as Record<string, ReturnType<typeof retainedState>>
      )["open-dough"] ?? {}
    );
  } catch {
    return {};
  }
}

test("a pending landed attempt keeps its known run identity and link in the local scope gap", async ({
  dashboard,
  origin,
  github,
}) => {
  const { record, revision } = await resultToLand(
    dashboard,
    "pending-proof.txt",
  );
  const runUrl = "https://ci.invalid/runs/51/attempts/2";
  serveTrunkRuns(github, origin, (main) => [
    makeMe.aCiRun
      .with({
        headSha: main,
        id: 51,
        attempt: 2,
        status: "queued",
        url: runUrl,
        createdAt: "2026-11-09T06:00:00Z",
      })
      .please(),
  ]);

  // The installed publication submits an accepted landing; no page is open.
  const receipt = land(record, origin, dashboard.home).result.landing.receipt;
  expect(receipt.revision).toBe(revision);
  await expect
    .poll(
      () =>
        github.calls.filter(
          ({ request }) =>
            request.kind === "actions-runs" && request.headSha === revision,
        ).length,
    )
    .toBeGreaterThan(0);

  const query = new URLSearchParams({
    source: "open-dough",
    intent: "ci-history",
    scope: "dashboard/tests",
    revision,
    through: receipt.receivedAt,
  });
  const readScope = async () => {
    const response = await rawRequest({
      url: `${dashboard.origin}/__authenticated-read?${query}`,
      headers: { Origin: dashboard.origin },
    });
    return {
      status: response.status,
      body: JSON.parse(response.body) as unknown,
    };
  };
  const pending = {
    status: 200,
    body: {
      path: "dashboard/tests",
      selectedRevision: revision,
      entries: [
        {
          kind: "gap",
          selected: true,
          reason: expect.stringMatching(/pending/i),
          landings: [{ revision, selected: true }],
          // An observed queued run is not a measured build. Its identity/link
          // belongs to the pending gap's own run evidence.
          run: { runId: 51, runAttempt: 2, runUrl },
        },
      ],
    },
  };
  await expect.poll(readScope).toMatchObject(pending);
  readers.push(await restartAsLandedCiReader(dashboard, origin, "boundary"));
  const observed = await readScope();
  expect(observed).toMatchObject(pending);
  const entries = (observed.body as { entries: Record<string, unknown>[] })
    .entries;
  expect(entries).toHaveLength(1);
  expect(entries[0]).toHaveProperty("readings", []);
  expect(entries[0]).not.toHaveProperty("build");

  const asked = github.calls.length;
  expect(await readScope()).toMatchObject(pending);
  expect(github.calls).toHaveLength(asked);
  expect(
    github.calls.filter(
      ({ request }) => request.kind === "actions-run-artifacts",
    ),
  ).toEqual([]);
});

test("an unread CI landing still retains independently evidenced local trunk order", async ({
  dashboard,
  origin,
  github,
}) => {
  const { record, revision } = await resultToLand(
    dashboard,
    "unread-ci-order.txt",
  );
  serveTrunkRuns(
    github,
    origin,
    () => [],
    () => false,
  );
  const receipt = land(record, origin, dashboard.home).result.landing.receipt;
  await expect
    .poll(() => retainedState(dashboard.home))
    .toMatchObject({
      landings: {
        [receipt.receipt]: { observed: { kind: "pending", waitsFor: "read" } },
      },
    });
  await expect
    .poll(() => retainedState(dashboard.home).trunkOrder)
    .toEqual([revision]);
  readers.push(await restartAsLandedCiReader(dashboard, origin, "boundary"));
  expect(retainedState(dashboard.home).trunkOrder).toEqual([revision]);
});
