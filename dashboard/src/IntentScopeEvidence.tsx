// The CI evidence a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) names, from Intent's one CI evidence owner
// (`./IntentCiEvidence.tsx`): the summary of a named attempt -- the attempt,
// its revision and the judged branch, and when the tree shows another
// revision, that a file added or changed since has no result or an earlier
// one -- or the one line saying why there is none, as the homepage says it
// (`./useIntentCiShownProof.ts`). Either way, a judgment previously
// retrieved, not newly verified, and a failed refresh beside it are said in
// the homepage's words (`./IntentCiJudgedBranch.tsx`).

import type { ReactNode } from "react";
import { shortSha } from "./baseCiWording.ts";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import {
  PreviouslyRetrieved,
  previouslyRetrievedAt,
  RefreshFailed,
} from "./IntentCiJudgedBranch.tsx";
import { AttemptName } from "./IntentCiProof.tsx";
import type { ShownCiProofRun } from "./shownCiProofRun.ts";
import { unreadReason } from "./useIntentCiJudgment.ts";
import {
  shownProofStateOf,
  type ShownProofState,
} from "./useIntentCiShownProof.ts";

// The shown judgment's freshness when it is not newly verified: when it was
// previously retrieved, and a failed refresh beside it.
export type KeptEvidence = {
  readonly checkedAt: string;
  readonly refreshFailed: string | undefined;
};

// What the Summary can say from the evidence: a summary of a named attempt,
// or why there is none (`checking` while it is still being read).
export type ScopeEvidence = (
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
    }
) & { readonly kept?: KeptEvidence };

export function scopeEvidenceOf(evidence: CiEvidence): ScopeEvidence {
  if (evidence.kind === "inactive")
    return { kind: "none", checking: true, line: "Checking the CI…" };
  if (evidence.kind === "gap")
    return { kind: "none", checking: false, line: evidence.why };
  const { branch, story, judged, proof } = evidence;
  const { shown } = judged;
  const checkedAt = previouslyRetrievedAt(judged);
  const kept =
    checkedAt === undefined
      ? {}
      : { kept: { checkedAt, refreshFailed: judged.refreshFailed } };
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
      ...kept,
    };
  if (proof === undefined)
    return {
      kind: "none",
      checking: false,
      line: `The branch ${branch} is no longer published, so it has no CI status.`,
      ...kept,
    };
  const state = shownProofStateOf(shown, proof);
  if (state.kind !== "summary")
    return {
      kind: "none",
      checking: state.kind === "checking",
      line: state.line,
      ...kept,
    };
  return {
    kind: "summary",
    summary: state.summary,
    run: state.run,
    branch,
    story,
    ancestor: shown.state === "running",
    ...kept,
  };
}

// That the evidence is a previously retrieved judgment, and any failed
// refresh beside it, as the homepage says it; nothing when newly verified.
export function EvidenceKept({
  kept,
}: {
  readonly kept: KeptEvidence | undefined;
}) {
  if (kept === undefined) return null;
  return (
    <>
      <p className="intent-summary-kept">
        <PreviouslyRetrieved checkedAt={kept.checkedAt} />
      </p>
      {kept.refreshFailed !== undefined && (
        <RefreshFailed failure={kept.refreshFailed} />
      )}
    </>
  );
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
  const { run, branch, story, ancestor, kept } = evidence;
  return (
    <>
      <EvidenceKept kept={kept} />
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
