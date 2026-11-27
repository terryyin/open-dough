// The published-main worker fixtures (./publishedMainFixture.ts), declared
// with the suite's other worker fixtures in ./pageTest.ts. The worker that
// takes one prepares it before that case starts, so no case pays its cold
// preparation in its own default 30 seconds. Each is loaded only by a worker
// that takes it.
import type { Fixtures } from "@playwright/test";
import type { PublishedMainSourceProfile } from "./publishedMainSource.ts";

// Cold shared preparation has its own bounded worker lifetime. It can outlast
// a case's default 30 seconds without extending any case or hook timeout.
export const coldInputPreparation = {
  scope: "worker",
  timeout: 60_000,
} as const;

// CI supplies a prepared executable. A local worker may acquire the package
// on demand and keeps the separate cold preparation allowance.
export const pinnedWatcherCodexPreparation = {
  scope: "worker",
  timeout: 180_000,
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
  // The pinned native Codex executable a published-main watcher journey
  // drains through (./watcherNativeCodex.ts). Each journey starts and stops
  // its own daemon from the executable the worker resolves.
  pinnedWatcherCodex: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { pinnedWatcherCodex } = await import("./watcherNativeCodex.ts");
      await use(await pinnedWatcherCodex());
    },
    pinnedWatcherCodexPreparation,
  ],
};
