// The worker fixtures that request what a worker's servers and installed
// origins start from, declared with the suite's other worker fixtures in
// ./pageTest.ts. Each takes the bounded worker lifetime of cold shared
// preparation (coldInputPreparation), so the first case waits for none of it
// in its own default 30 seconds. Preparation stays in the run's elapsed time
// and is deduplicated by the run owner (./runArtifacts.ts).
import type { Fixtures } from "@playwright/test";
import { coldInputPreparation } from "./publishedMainWorkerFixtures.ts";

export type FixtureServerMode = "preview" | "boundary";
type Host = "claude" | "codex";
// What a worker serves: a server mode, or only the static app (frontend runs).
type ServedInputs = FixtureServerMode | "app";

export type ServerInputWorkerFixtures = {
  serverMode: FixtureServerMode;
  dashboardAppReady: undefined;
  dashboardServerInputsReady: undefined;
  dashboardPreviewReady: undefined;
  dashboardBoundaryReady: undefined;
  queuedOriginsReady: undefined;
  queuedCodexOriginReady: undefined;
  queuedClaudePreviewReady: undefined;
  queuedClaudeBoundaryReady: undefined;
  queuedCodexPreviewReady: undefined;
};

// Requests the named hosts' queued origins and what the served inputs need:
// the app build for previews and app-only runs, the server bundle for any
// dashboard server.
async function prepareServerInputs(
  hosts: readonly Host[],
  served: ServedInputs | undefined,
) {
  const [artifacts, origins, app, bundle] = await Promise.all([
    import("./runArtifacts.ts"),
    import("./startOriginPreparation.ts"),
    import("./dashboardBuild.ts"),
    import("./serverBundle.ts"),
  ]);
  await Promise.all(
    [
      ...hosts.map((host) => origins.startOriginArtifactKey(host, "queued")),
      ...(served === "preview" || served === "app"
        ? [app.dashboardAppArtifactKey]
        : []),
      ...(served === "preview" || served === "boundary"
        ? [bundle.serverBundleArtifactKey]
        : []),
    ].map((key) => artifacts.requestRunArtifact(key)),
  );
}

function prepared(hosts: readonly Host[], served: ServedInputs | undefined) {
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
  // Frontend runs serve only the static app build (./frontendApp.ts).
  dashboardAppReady: [prepared([], "app"), coldInputPreparation],
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
  // Boundary servers on the queued Claude origin open no app.
  queuedClaudeBoundaryReady: [
    prepared(["claude"], "boundary"),
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
