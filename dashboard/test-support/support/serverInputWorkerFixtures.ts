// The worker fixtures that request what a worker's servers and installed
// origins start from, declared with the suite's other worker fixtures in
// ./pageTest.ts. Each takes the bounded worker lifetime of cold shared
// preparation (coldInputPreparation), so the first case waits for none of it
// in its own default 30 seconds. Preparation stays in the run's elapsed time
// and is deduplicated by the run owner (./runArtifacts.ts).
import type { Fixtures } from "@playwright/test";
import { servedArtifacts } from "./dashboardServerOptions.ts";
import { coldInputPreparation } from "./publishedMainWorkerFixtures.ts";

export type FixtureServerMode = "preview" | "boundary";
type Host = "claude" | "codex";

export type ServerInputWorkerFixtures = {
  serverMode: FixtureServerMode;
  dashboardServerInputsReady: undefined;
  dashboardPreviewReady: undefined;
  dashboardBoundaryReady: undefined;
  queuedOriginsReady: undefined;
  queuedCodexOriginReady: undefined;
  queuedClaudePreviewReady: undefined;
  queuedCodexPreviewReady: undefined;
};

// The run artifacts a worker requests for the named hosts' queued origins and
// what its unmounted server start serves (servedArtifacts).
export async function serverInputKeys(
  hosts: readonly Host[],
  served: FixtureServerMode | undefined,
): Promise<string[]> {
  // Only a worker that takes an installed origin loads its preparation.
  const [origins, app, bundle] = await Promise.all([
    hosts.length === 0
      ? []
      : import("./startOriginPreparation.ts").then(
          ({ startOriginArtifactKey }) =>
            hosts.map((host) => startOriginArtifactKey(host, "queued")),
        ),
    import("./dashboardBuild.ts"),
    import("./serverBundle.ts"),
  ]);
  const serves =
    served === undefined
      ? { app: false, bundle: false }
      : servedArtifacts(served, false);
  return [
    ...origins,
    ...(serves.app ? [app.dashboardAppArtifactKey] : []),
    ...(serves.bundle ? [bundle.serverBundleArtifactKey] : []),
  ];
}

async function prepareServerInputs(
  hosts: readonly Host[],
  served: FixtureServerMode | undefined,
) {
  const { requestRunArtifact } = await import("./runArtifacts.ts");
  await Promise.all(
    (await serverInputKeys(hosts, served)).map((key) =>
      requestRunArtifact(key),
    ),
  );
}

function prepared(
  hosts: readonly Host[],
  served: FixtureServerMode | undefined,
) {
  // eslint-disable-next-line no-empty-pattern
  return async ({}, use: (value: undefined) => Promise<void>) => {
    await prepareServerInputs(hosts, served);
    await use(undefined);
  };
}

export const serverInputWorkerFixtures: Fixtures<
  object,
  ServerInputWorkerFixtures
> = {
  serverMode: ["preview", { scope: "worker", option: true }],
  dashboardServerInputsReady: [
    async ({ serverMode }, use) => {
      await prepareServerInputs([], serverMode);
      await use(undefined);
    },
    coldInputPreparation,
  ],
  // Reading-only previews need the app and boundaries, with no installed origin.
  dashboardPreviewReady: [prepared([], "preview"), coldInputPreparation],
  // A custom boundary server needs only the server bundle.
  dashboardBoundaryReady: [prepared([], "boundary"), coldInputPreparation],
  // Installed preparation origins: both hosts' queued bases, so a worker that
  // runs either host, or both, starts each private copy from a prepared base.
  queuedOriginsReady: [
    prepared(["claude", "codex"], undefined),
    coldInputPreparation,
  ],
  // Each host's preview needs its queued origin and the same immutable app inputs.
  queuedClaudePreviewReady: [
    prepared(["claude"], "preview"),
    coldInputPreparation,
  ],
  queuedCodexPreviewReady: [
    prepared(["codex"], "preview"),
    coldInputPreparation,
  ],
  // Requested only by native readers that need this installed queued input.
  queuedCodexOriginReady: [
    prepared(["codex"], undefined),
    coldInputPreparation,
  ],
};
