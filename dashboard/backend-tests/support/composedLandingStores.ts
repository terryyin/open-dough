// In-memory attempt and record stores for the landing adapter collaborator.
import { randomUUID } from "node:crypto";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { LandingStores } from "../../server/launchLandingReporting.ts";
import { recordRetention } from "../../server/launchRecordDocument.ts";
import { withinRetention } from "../../server/launchRecordRetention.ts";
import { leaveMachineJson } from "../../server/machineJsonStore.ts";
import {
  aDefaultLaunch,
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
} {
  let attempts: AttemptDocument = structuredClone(initial?.attempts ?? {});
  let records: RecordDocument = structuredClone(initial?.records ?? {});
  const recordOf = (sessionId: string) =>
    (records[source] ?? []).find(
      (entry): entry is LaunchRecord =>
        "session" in entry && entry.session.sessionId === sessionId,
    );
  const replaceRecords: LandingStores["replaceRecords"] = async (change) => {
    const next = await change(recordRetention(records, Date.now()).kept);
    if (next !== leaveMachineJson) records = next;
  };
  return {
    attempts: () => attempts,
    records: () => records,
    recordOf,
    withKeptAttempts: (observe) => observe(Object.values(attempts).flat()),
    replaceAttempts: async (change) => {
      const next = await change(attempts);
      if (next !== leaveMachineJson) attempts = next;
    },
    keptRecords: (sourceId) =>
      Promise.resolve(
        withinRetention(records[sourceId] ?? [], Date.now()).filter(
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
  const entry = {
    repository,
    workspace,
    branch,
    committedTip: checkout.base,
    tree: checkout.base,
    trunk: { remote: authority.remote, target: authority.target },
  };
  const record = aDefaultLaunch(checkout)
    .withLandingReporting({
      origin: dashboardOrigin,
      authority,
      preparations: [],
      branchContext: {
        reference,
        file: "/tmp/composed-landing-context.json",
      },
    })
    .enteredBranch(entry)
    .please();
  return {
    record,
    reference,
    stores: composedLandingStores({ records: { [source]: [record] } }),
  };
}
