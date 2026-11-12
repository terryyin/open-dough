// The test every dashboard spec runs under, directly or through a fixture
// module built on it (../dashboardTest.ts and the modules extending that).
//
// A spec waits for the event it depends on and never waits out a deadline
// (../README.md, "Synchronization"); when the state it needs leaves no trace
// the test can see, it adds an observation of its own, such as a test-side
// loader in the server, rather than a sleep.
//
// One such event is shared by every page spec: the page's intercepted reads
// finishing. A route handler may still be reading its fetched answer when the
// test's last assertion passes, and Playwright disposes those answers with the
// context. So the `page` fixture finishes every handler of the page before it
// is torn down, and no spec needs a teardown of its own for it. Another is
// the answer to a read the page sent on opening: every page of the test's
// context notes its requests from before its own scripts run
// (../pageRequestNotes.ts), whichever server the spec opens it at, so a first
// check after an open can wait for that answer. Specs import `test` from
// here; the lint configuration rejects a direct import of `test` from
// `@playwright/test` under `dashboard/tests/`.
//
// Every worker-scoped fixture of the suite is declared here, whichever specs
// take it. Playwright runs a test only in a worker whose fixture pool
// declares the same worker-scoped fixtures (the worker hash is the set of
// those registrations, not the fixtures a test uses), so a worker-scoped
// fixture declared in one fixture module but not another splits the specs
// into worker populations that cannot share a worker, and each switch
// between them stops a worker and starts a fresh one. A `test.use` of a
// worker-scoped option (`launchOptions`) has the same effect, with one
// population per distinct value object.

import { test as base } from "@playwright/test";
import type { ComparisonRenderer } from "./comparisonRendering.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import { noteRequestsInEveryPage } from "../pageRequestNotes.ts";
import { endDescendantsAtExit } from "./processGroup.ts";

export { expect } from "@playwright/test";

// No process a test started outlives its worker (./processGroup.ts).
endDescendantsAtExit();

// Requests what a worker's servers start from, so the first test waits for
// none of it in its own time: the host's queued origin when it has one, the
// server bundle, and the app build unless only boundary servers start.
async function prepareServerInputs(
  host: "claude" | "codex" | undefined,
  serverMode: "preview" | "boundary",
) {
  const [artifacts, origins, app, bundle] = await Promise.all([
    import("./runArtifacts.ts"),
    import("./startOriginPreparation.ts"),
    import("./dashboardBuild.ts"),
    import("./serverBundle.ts"),
  ]);
  await Promise.all(
    [
      ...(host === undefined
        ? []
        : [origins.startOriginArtifactKey(host, "queued")]),
      ...(serverMode === "preview" ? [app.dashboardAppArtifactKey] : []),
      bundle.serverBundleArtifactKey,
    ].map((key) => artifacts.requestRunArtifact(key)),
  );
}

// Playwright's worker-only extension takes an empty test-fixture type.
export const test = base.extend<
  object,
  {
    launchJourney: LaunchJourney;
    comparisonRenderer: ComparisonRenderer;
    dashboardPreviewReady: undefined;
    queuedCodexOriginReady: undefined;
    queuedClaudePreviewReady: undefined;
    queuedClaudeBoundaryReady: undefined;
    queuedCodexPreviewReady: undefined;
    publishedApplicationSourceReady: undefined;
  }
>({
  // Reading-only previews need the app and boundaries, with no installed origin.
  dashboardPreviewReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await prepareServerInputs(undefined, "preview");
      await use(undefined);
    },
    { scope: "worker" },
  ],
  // Only readers of the real published app request this immutable source.
  // Its cold preparation stays in run elapsed, within the default worker budget.
  publishedApplicationSourceReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const [
        { requestRunArtifact },
        { publishedApplicationSourceArtifactKey },
      ] = await Promise.all([
        import("./runArtifacts.ts"),
        import("./publishedMainSource.ts"),
      ]);
      await requestRunArtifact(publishedApplicationSourceArtifactKey);
      await use(undefined);
    },
    { scope: "worker" },
  ],
  // Each host's preview needs its queued origin and the same immutable app inputs.
  queuedClaudePreviewReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await prepareServerInputs("claude", "preview");
      await use(undefined);
    },
    { scope: "worker" },
  ],
  // Boundary servers on the queued Claude origin open no app.
  queuedClaudeBoundaryReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await prepareServerInputs("claude", "boundary");
      await use(undefined);
    },
    { scope: "worker" },
  ],
  queuedCodexPreviewReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await prepareServerInputs("codex", "preview");
      await use(undefined);
    },
    { scope: "worker" },
  ],
  // Requested only by native readers that need this installed queued input.
  // Its setup has the worker's default budget, before a reading test starts.
  queuedCodexOriginReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const [{ requestRunArtifact }, { startOriginArtifactKey }] =
        await Promise.all([
          import("./runArtifacts.ts"),
          import("./startOriginPreparation.ts"),
        ]);
      await requestRunArtifact(startOriginArtifactKey("codex", "queued"));
      await use(undefined);
    },
    { scope: "worker" },
  ],
  comparisonRenderer: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { createComparisonRenderer } =
        await import("./comparisonRendering.ts");
      const renderer = await createComparisonRenderer();
      try {
        await use(renderer);
      } finally {
        await renderer.close();
      }
    },
    { scope: "worker" },
  ],
  // The launch journeys' origin (../launchJourney.ts says what it publishes),
  // published once per worker and read, never written, by every journey the
  // worker runs from it (../launchStoryCardPage.ts serves it as GitHub would).
  // Only a worker that takes the fixture loads the publishing code.
  launchJourney: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { publishLaunchJourney } = await import("../launchJourney.ts");
      const journey = await publishLaunchJourney();
      await use(journey);
      await journey.cleanup();
    },
    { scope: "worker" },
  ],
  context: async ({ context }, use) => {
    await noteRequestsInEveryPage(context);
    await use(context);
  },
  page: async ({ page }, use) => {
    await use(page);
    // A spec that closed its page has no handler left to finish.
    if (!page.isClosed()) await page.unrouteAll({ behavior: "wait" });
  },
});
