// The stage a landing's automatic CI repeat stands at on the machine that
// keeps it (./ciFollowUpKeptLanding.ts), and what the landing's follow-up
// ledger entry (../../server/ciFollowUpStore.ts) holds at that stage beside
// its receipt.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type {
  FollowUpLedger,
  RepeatRequest,
} from "../../server/ciFollowUpStore.ts";

// "eligible receipt": measured, admitted while this machine has follow-up
// enabled, its allowance unspent. "accepted request": that allowance spent on
// a rerun request the provider accepted, with no later attempt observed yet.
export type RepeatStage = "eligible receipt" | "accepted request";

// The explanation collection saves with an accepted reply.
const accepted = "Full repeat accepted; no later CI attempt has been observed";

// What the ledger entry of a landing at `stage` holds: from "accepted
// request" on, the request as collection saved it once the provider replied,
// naming the `original` build that measured the landing, its workflow, that
// build's one `job`, and the `reference` frozen when the request was sent.
export function heldAt(
  stage: RepeatStage,
  measured: Pick<RepeatRequest, "original" | "reference" | "workflowId"> & {
    readonly job: { readonly databaseId: number; readonly name: string };
  },
): Pick<FollowUpLedger["landings"][string], "request"> {
  if (stage === "eligible receipt") return {};
  const { original, reference, workflowId, job } = measured;
  const { runId, startedAt, completedAt } = original;
  if (
    runId === undefined ||
    startedAt === undefined ||
    completedAt === undefined
  )
    throw new Error("A request's original names its run and bounds.");
  const request = makeMe.aCiRepeatRequest
    .with({
      repository: "terryyin/open-dough",
      workflow: "ci.yml",
      workflowId,
      original,
      reference,
      rule: { percent: 5, provisional: true, timingBasis: "attempt-start" },
      originalJobs: [
        {
          ...job,
          run_id: runId,
          head_sha: original.revision,
          started_at: startedAt,
          completed_at: completedAt,
          status: "completed",
        },
      ],
      requestedAt: new Date().toISOString(),
      submission: { kind: "accepted", explanation: accepted },
      outcome: { kind: "unverified", explanation: accepted },
    })
    .please();
  return { request };
}
