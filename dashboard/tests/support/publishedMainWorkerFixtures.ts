// The published-main worker fixtures (./publishedMainFixture.ts), declared
// with the suite's other worker fixtures in ./pageTest.ts. The worker that
// takes one prepares it before that case starts, so no case pays its cold
// preparation in its own default 30 seconds. Each is loaded only by a worker
// that takes it.
import type { Fixtures } from "@playwright/test";
import type { PinnedDeployment } from "./pinnedDeployment.ts";
import type { PublishedMainFixture } from "./publishedMainFixture.ts";
import type { PublishedMainSourceProfile } from "./publishedMainSource.ts";

// Cold shared preparation has its own bounded worker lifetime. It can outlast
// a case's default 30 seconds without extending any case or hook timeout.
export const coldInputPreparation = {
  scope: "worker",
  timeout: 60_000,
} as const;

async function requestPublishedMainSource(profile: PublishedMainSourceProfile) {
  const [artifacts, source] = await Promise.all([
    import("./runArtifacts.ts"),
    import("./publishedMainSource.ts"),
  ]);
  await artifacts.requestRunArtifact(
    source.publishedMainSourceArtifactKeys[profile],
  );
}

export type PublishedMainWorkerFixtures = {
  publishedApplicationSourceReady: undefined;
  publishedRepositorySourceReady: undefined;
  pinnedDeployment: PinnedDeployment;
  ownerlessPublishedMain: PublishedMainFixture;
  pinnedWatcherCodex: string;
};

export const publishedMainWorkerFixtures: Fixtures<
  object,
  PublishedMainWorkerFixtures
> = {
  // Each profile's live-source snapshot (./publishedMainSource.ts): copying
  // and committing its files is cold shared preparation the worker does
  // before a reader of that profile starts.
  publishedApplicationSourceReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await requestPublishedMainSource("application");
      await use(undefined);
    },
    coldInputPreparation,
  ],
  publishedRepositorySourceReady: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await requestPublishedMainSource("repository");
      await use(undefined);
    },
    coldInputPreparation,
  ],
  // Installing and building the pinned commit (./pinnedDeployment.ts) is the
  // worker's; its reader only serves and inspects what was staged.
  pinnedDeployment: [
    async ({ publishedApplicationSourceReady }, use) => {
      await Promise.resolve(publishedApplicationSourceReady);
      const { stagePinnedDeployment } = await import("./pinnedDeployment.ts");
      const deployment = await stagePinnedDeployment();
      try {
        await use(deployment);
      } finally {
        await deployment.cleanup();
      }
    },
    coldInputPreparation,
  ],
  // A full-source fixture made while no run owner answers: it copies and
  // commits the whole live source itself. Its reader leaves its origin
  // unpublished again, as it found it.
  ownerlessPublishedMain: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { publishedMainFixture } =
        await import("./publishedMainFixture.ts");
      const owner = process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
      delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
      let fixture: PublishedMainFixture;
      try {
        fixture = await publishedMainFixture(true);
      } finally {
        if (owner !== undefined)
          process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"] = owner;
      }
      try {
        await use(fixture);
      } finally {
        await fixture.cleanup();
      }
    },
    coldInputPreparation,
  ],
  // The pinned native Codex executable a published-main watcher journey
  // drains through (./watcherNativeCodex.ts). Acquiring the package is the
  // worker's; each journey starts and stops its own daemon from it.
  pinnedWatcherCodex: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { pinnedWatcherCodex } = await import("./watcherNativeCodex.ts");
      await use(await pinnedWatcherCodex());
    },
    coldInputPreparation,
  ],
};
