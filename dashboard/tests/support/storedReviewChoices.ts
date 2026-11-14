// Refresh integration owns store -> real reader -> transport -> displayed choice.
// Every test has a private origin/store; no native launch arranges these records.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { test as base } from "../dashboardTest.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import {
  keepLaunchStore,
  keepMoreLaunchRecordsBesideServer,
} from "./launchStore.ts";
import {
  startOrigin,
  type StartOrigin,
  type StartOriginFixtures,
} from "./startOrigin.ts";
import { reviewLaunch } from "./reviewRunRecords.ts";

export { expect } from "../dashboardTest.ts";
export const test = base.extend<StartOriginFixtures>({
  projectFolders: ["open-dough"],
  originRepository: [
    queuedReadyRepository()
      .withRevision("first", { files: { "first.txt": "first.txt\n" } })
      .withRevision("second", { files: { "second.txt": "second.txt\n" } })
      .withRevision("third", { files: { "third.txt": "third.txt\n" } })
      .please(),
    { option: true },
  ],
  origin: async ({ originRepository }, use) => {
    const origin = await startOrigin(originRepository);
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});

const captures = {
  first: { offset: 0, reference: "11111111-1111-4111-8111-111111111111" },
  second: { offset: 1, reference: "22222222-2222-4222-8222-222222222222" },
  third: { offset: 2, reference: "33333333-3333-4333-8333-333333333333" },
} as const;
type Name = keyof typeof captures;

export async function storedCapturedChoice(
  dashboard: DashboardServer,
  origin: StartOrigin,
  name: Name,
) {
  const { offset, reference } = captures[name];
  const revisions = (await origin.originGit("rev-list", "--reverse", "main"))
    .trim()
    .split("\n");
  const base = revisions[offset];
  const revision = revisions[offset + 1];
  if (base === undefined || revision === undefined) {
    throw new Error("Missing immutable review comparison");
  }
  const record = reviewLaunch({
    sessionId: `review-${name}`,
    workspace: path.join(origin.machine, `retired-${name}`),
    launchedAt: `2026-01-01T0${String(offset + 1)}:00:00.000Z`,
    reference,
  })
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: origin.origin, identity: "SEED-A#a" })
        .forLaunch(reference)
        .comparing({ base, revision })
        .please(),
    )
    .markedDoneAt(new Date().toISOString())
    .please();
  await keepMoreLaunchRecordsBesideServer(dashboard, [record]);
  return { record, key: reference, name };
}

export async function storedReviewChoices<const Selected extends Name>(
  dashboard: DashboardServer,
  origin: StartOrigin,
  names: readonly Selected[],
) {
  const legacyRecord = reviewLaunch({
    sessionId: "review-legacy",
    workspace: path.join(origin.machine, "retired-legacy"),
    launchedAt: "2026-01-01T00:00:00.000Z",
  })
    .markedDoneAt(new Date().toISOString())
    .please();
  keepLaunchStore(dashboard, { "open-dough": [legacyRecord] });
  const captured = {} as Record<
    Selected,
    Awaited<ReturnType<typeof storedCapturedChoice>>
  >;
  for (const name of names) {
    captured[name] = await storedCapturedChoice(dashboard, origin, name);
  }
  return {
    ...captured,
    legacy: { ...legacyRecord, key: "codex:review-legacy" },
  };
}
