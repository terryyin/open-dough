// The CI evidence a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) names, from Intent's one CI evidence owner
// (`./IntentCiEvidence.tsx`): the summary of a named attempt -- the attempt,
// its revision and the judged branch, and when the tree shows another
// revision, that a file added or changed since has no result or an earlier
// one -- or the one line saying why there is none, as the homepage says it
// (`./useIntentCiShownProof.ts`).

import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import { AttemptName } from "./IntentCiProof.tsx";
import type { ShownCiProofRun } from "./shownCiProofRun.ts";
import { unreadReason } from "./useIntentCiJudgment.ts";
import {
  shownProofStateOf,
  type ShownProofState,
} from "./useIntentCiShownProof.ts";

// What the Summary can say from the evidence: a summary of a named attempt,
// or why there is none (`checking` while it is still being read).
export type ScopeEvidence =
  | {
      readonly kind: "summary";
      readonly summary: Extract<
        ShownProofState,
        { kind: "summary" }
      >["summary"];
      readonly run: ShownCiProofRun;
      readonly branch: string;
      readonly story: string | undefined;
      readonly ancestor: boolean;
    }
  | {
      readonly kind: "none";
      readonly checking: boolean;
      readonly line: ReactNode;
    };

export function scopeEvidenceOf(evidence: CiEvidence): ScopeEvidence {
  if (evidence.kind === "inactive")
    return { kind: "none", checking: true, line: "Checking the CI…" };
  if (evidence.kind === "gap")
    return { kind: "none", checking: false, line: evidence.why };
  const { branch, story, judged, proof } = evidence;
  const { shown } = judged;
  if (shown === undefined)
    return {
      kind: "none",
      checking: true,
      line: <>Checking the CI of {branch}…</>,
    };
  if (shown.state === "unread")
    return {
      kind: "none",
      checking: false,
      line: shown.reason ?? unreadReason,
    };
  if (proof === undefined)
    return {
      kind: "none",
      checking: false,
      line: `The branch ${branch} is no longer published, so it has no CI status.`,
    };
  const state = shownProofStateOf(shown, proof);
  if (state.kind !== "summary")
    return {
      kind: "none",
      checking: state.kind === "checking",
      line: state.line,
    };
  return {
    kind: "summary",
    summary: state.summary,
    run: state.run,
    branch,
    story,
    ancestor: shown.state === "running",
  };
}

// The named evidence: "CI evidence: Attempt 2 of run 41 at abc1234 on main,
// the completed ancestor of the running result.", and when the tree shows
// another revision, what that leaves unproved.
export function EvidenceNamed({
  evidence,
  revision,
}: {
  readonly evidence: Extract<ScopeEvidence, { kind: "summary" }>;
  readonly revision: string;
}) {
  const { run, branch, story, ancestor } = evidence;
  return (
    <>
      <p className="intent-summary-evidence">
        CI evidence: <AttemptName run={run} /> at{" "}
        <code>{shortSha(run.revision)}</code> on <code>{branch}</code>
        {story === undefined ? "" : `, the story branch of ${story}`}
        {ancestor ? ", the completed ancestor of the running result" : ""}.
      </p>
      {run.revision !== revision && (
        <p className="intent-summary-revision">
          This evidence is of <code>{shortSha(run.revision)}</code>; the tree
          shows <code>{shortSha(revision)}</code>. A file added or changed since
          has no CI result here, or an earlier one.
        </p>
      )}
    </>
  );
}
