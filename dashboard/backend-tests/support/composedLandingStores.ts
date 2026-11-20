// In-memory attempt and record stores for the landing adapter collaborator.
import { randomUUID } from "node:crypto";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { LandingStores } from "../../server/launchLandingReporting.ts";
import { leaveMachineJson } from "../../server/machineJsonStore.ts";
import { withBranchResultAtDone } from "../../server/sessionBranchCapture.ts";
import { aDeclaringLaunch } from "./declaredBranchCase.ts";
import {
  canonicalGitDirectory,
  source,
  type Checkout,
} from "./doneCaptureCase.ts";
import { dashboardOrigin } from "./publisherDashboardOrigin.ts";

type AttemptDocument = Parameters<LandingStores["replaceAttempts"]>[0] extends (
  kept: infer K,
) => unknown
  ? K
  : never;
type RecordDocument = Parameters<LandingStores["replaceRecords"]>[0] extends (
  kept: infer K,
) => unknown
  ? K
  : never;

// Mutable attempt and record documents the adapter's collaborator shape reads
// and replaces, defaulting empty like missing machine files.
export function composedLandingStores(initial?: {
  attempts?: AttemptDocument;
  records?: RecordDocument;
}): LandingStores & {
  attempts: () => AttemptDocument;
  records: () => RecordDocument;
  recordOf: (sessionId: string) => LaunchRecord | undefined;
  markDone: (sessionId: string, at: string) => Promise<void>;
} {
  let attempts: AttemptDocument = structuredClone(initial?.attempts ?? {});
  let records: RecordDocument = structuredClone(initial?.records ?? {});
  const recordOf = (sessionId: string) =>
    (records[source] ?? []).find(
      (entry): entry is LaunchRecord =>
        "session" in entry && entry.session.sessionId === sessionId,
    );
  const replaceRecords: LandingStores["replaceRecords"] = async (change) => {
    const next = await change(records);
    if (next !== leaveMachineJson) records = next;
  };
  return {
    attempts: () => attempts,
    records: () => records,
    recordOf,
    markDone: async (sessionId, at) => {
      const candidate = recordOf(sessionId);
      if (candidate === undefined) return;
      await withBranchResultAtDone(candidate, at, async (settle) => {
        let saved: LaunchRecord | undefined;
        await replaceRecords(async (kept) => {
          const list = kept[source] ?? [];
          const next = [];
          for (const entry of list) {
            if (
              !("session" in entry) ||
              entry.session.sessionId !== sessionId
            ) {
              next.push(entry);
              continue;
            }
            saved = await settle({
              ...entry,
              dispositionChangedAt: new Date().toISOString(),
              doneAt: at,
            });
            next.push(saved);
          }
          return { ...kept, [source]: next };
        });
        return saved;
      });
    },
    withKeptAttempts: (observe) => observe(Object.values(attempts).flat()),
    replaceAttempts: async (change) => {
      const next = await change(attempts);
      if (next !== leaveMachineJson) attempts = next;
    },
    keptRecords: (sourceId) =>
      Promise.resolve(
        (records[sourceId] ?? []).filter(
          (entry): entry is LaunchRecord => "session" in entry,
        ),
      ),
    replaceRecords,
  };
}

// A declared branch launch with landing reporting, composed without HOME.
export function aComposedDeclaredLanding(
  checkout: Checkout,
  {
    workspace,
    branch,
  }: {
    workspace: string;
    branch: string;
  },
) {
  const reference = randomUUID();
  const repository = canonicalGitDirectory(checkout);
  const authority = makeMe.aLandingAuthority
    .ofRepository(repository)
    .inWorktree({ workspace, branch })
    .please();
  const record: LaunchRecord = {
    ...aDeclaringLaunch(checkout)
      .withLandingReporting({
        origin: dashboardOrigin,
        authority,
        preparations: [],
        branchContext: {
          reference,
          file: "/tmp/composed-landing-context.json",
        },
      })
      .please(),
    branchEntry: {
      repository,
      workspace,
      branch,
      committedTip: checkout.base,
      tree: checkout.base,
      trunk: { remote: authority.remote, target: authority.target },
    },
  };
  return {
    record,
    reference,
    stores: composedLandingStores({ records: { [source]: [record] } }),
  };
}
