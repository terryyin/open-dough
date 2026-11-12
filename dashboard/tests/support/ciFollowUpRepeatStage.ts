// The stage a landing's automatic CI repeat stands at on the machine that
// keeps it (./ciFollowUpKeptLanding.ts), and what the landing's follow-up
// ledger entry (../../server/ciFollowUpStore.ts) holds at that stage beside
// its receipt.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type {
  FollowUpLedger,
  GithubRepeatRequest,
  RepeatRequest,
} from "../../server/ciFollowUpStore.ts";

// "eligible receipt": measured, admitted by this machine when it recorded the
// receipt, its allowance unspent. "accepted request": that allowance spent on
// a rerun request the provider accepted, with no later attempt observed yet.
// "settled request": that request settled as recovered by a full repeat that
// passed within the rule's range of the saved average.
export type RepeatStage =
  "eligible receipt" | "accepted request" | "settled request";

// The stage a case states for a landing, and with "settled request" how long
// the full repeat that settled it took.
export type AtStage =
  | { readonly stage: Exclude<RepeatStage, "settled request"> }
  | { readonly stage: "settled request"; readonly repeatSeconds: number };

// The explanation collection saves with an accepted reply.
const accepted = "Full repeat accepted; no later CI attempt has been observed";

// What collection saves of a request once `repeat`, the build it keeps of the
// repeat attempt, settles it as recovered.
function recoveredBy(
  repeat: RepeatRequest["original"] | undefined,
  workflowId: number,
): RepeatRequest["outcome"] {
  if (repeat?.runId === undefined || repeat.runAttempt === undefined)
    throw new Error("A settled request names its repeat's run and attempt.");
  const { runId, runAttempt, revision, runUrl, startedAt, completedAt } =
    repeat;
  return {
    settled: true,
    kind: "recovered",
    explanation: "CI timing returned to range",
    observed: {
      runId,
      runAttempt,
      revision,
      workflowId,
      status: "completed",
      conclusion: "success",
      ...(runUrl === undefined ? {} : { runUrl }),
      ...(startedAt === undefined ? {} : { startedAt }),
      ...(completedAt === undefined ? {} : { completedAt }),
    },
    repeat,
  };
}

// What the ledger entry of a landing at `stage` holds: from "accepted
// request" on, the request as collection saved it once the provider replied,
// naming the `original` build that measured the landing, its workflow, that
// build's one `job`, and the `reference` frozen when the request was sent;
// at "settled request", with the `repeat` build that settled it.
export function heldAt(
  stage: RepeatStage,
  measured: Pick<
    GithubRepeatRequest,
    "original" | "reference" | "workflowId"
  > & {
    readonly job: { readonly databaseId: number; readonly name: string };
    readonly repeat?: RepeatRequest["original"];
  },
): Pick<FollowUpLedger["landings"][string], "request"> {
  if (stage === "eligible receipt") return {};
  const { original, reference, workflowId, job, repeat } = measured;
  const { runId, startedAt, completedAt } = original;
  if (
    runId === undefined ||
    startedAt === undefined ||
    completedAt === undefined
  )
    throw new Error("A request's original names its run and bounds.");
  const request = makeMe.aCiRepeatRequest
    .with({
      provider: "github",
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
      outcome:
        stage === "settled request"
          ? recoveredBy(repeat, workflowId)
          : { kind: "unverified", explanation: accepted },
    })
    .please();
  return { request };
}
