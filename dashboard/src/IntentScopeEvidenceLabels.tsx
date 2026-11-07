// The CI evidence a selected entry's or folder's Summary
// (`./IntentScopeProof.tsx`) or a selected file's Proof
// (`./IntentFileProof.tsx`) names (`./IntentScopeEvidence.tsx`), as short
// labels (`./CiEvidenceLabels.tsx`): the attempt, its revision, the judged
// branch, a running result's completed ancestor, and when the tree shows
// another revision, that newer files are unproved there. A judgment
// previously retrieved, not newly verified, and a failed refresh beside it
// are labelled in the homepage's words (`./IntentCiJudgedBranch.tsx`).

import { CircleAlert, Clock, GitBranch, TriangleAlert } from "lucide-react";
import { shortSha } from "./baseCiWording.ts";
import {
  ancestorLabel,
  attemptLabel,
  EvidenceLabels,
  revisionLabel,
  type EvidenceLabel,
} from "./CiEvidenceLabels.tsx";
import { PreviouslyRetrieved } from "./IntentCiJudgedBranch.tsx";
import type { KeptEvidence, ScopeEvidence } from "./IntentScopeEvidence.tsx";

// That the evidence is a previously retrieved judgment, and any failed
// refresh beside it, as labels in the homepage's words; none when newly
// verified. The failure itself is announced as the homepage announces it.
function keptLabels(kept: KeptEvidence | undefined): EvidenceLabel[] {
  if (kept === undefined) return [];
  const at = new Date(kept.checkedAt).toLocaleTimeString();
  const labels: EvidenceLabel[] = [
    {
      key: "kept",
      icon: Clock,
      name: `Previously retrieved at ${at}`,
      shown: <PreviouslyRetrieved checkedAt={kept.checkedAt} />,
      full: "Previously retrieved, not newly verified",
    },
  ];
  const failure = kept.refreshFailed;
  if (failure !== undefined)
    labels.push({
      key: "refresh failed",
      icon: CircleAlert,
      name: "Refresh failed",
      shown: (
        <>
          Refresh failed
          <span role="alert" className="visually-hidden">
            {failure}
          </span>
        </>
      ),
      full: failure,
      className: "intent-ci-refresh-failed intent-evidence-caution",
    });
  return labels;
}

export function EvidenceKept({
  kept,
}: {
  readonly kept: KeptEvidence | undefined;
}) {
  return <EvidenceLabels label="CI evidence" labels={keptLabels(kept)} />;
}

function branchLabel(branch: string, story: string | undefined): EvidenceLabel {
  return {
    key: "branch",
    icon: GitBranch,
    name: `Branch ${branch}`,
    shown: <code>{branch}</code>,
    ...(story === undefined ? {} : { full: `The story branch of ${story}` }),
  };
}

// That the tree shows a newer revision than the evidence's, so a file added
// or changed since has no CI result here, or an earlier one.
function treeLabel(evidenceRevision: string, revision: string): EvidenceLabel {
  const evidenceSha = shortSha(evidenceRevision);
  const treeSha = shortSha(revision);
  return {
    key: "tree",
    icon: TriangleAlert,
    name: `Tree at ${treeSha} — newer files unproved here`,
    shown: (
      <>
        Tree at <code>{treeSha}</code> — newer files unproved here
      </>
    ),
    full: `Evidence at ${evidenceSha}, tree at ${treeSha}: a file added or changed since has no CI result here, or an earlier one.`,
    className: "intent-evidence-caution",
  };
}

// The named evidence as labels: `Run 41 · attempt 2` (linked), `abc1234`,
// `main`, a running result's completed ancestor, and when the tree shows
// another revision, `Tree at def5678 — newer files unproved here`.
export function EvidenceNamed({
  evidence,
  revision,
}: {
  readonly evidence: Extract<ScopeEvidence, { kind: "summary" }>;
  readonly revision: string;
}) {
  const { run, branch, story, ancestor, kept } = evidence;
  return (
    <EvidenceLabels
      label="CI evidence"
      labels={[
        ...keptLabels(kept),
        attemptLabel(run),
        revisionLabel(run.revision),
        branchLabel(branch, story),
        ...(ancestor ? [ancestorLabel] : []),
        ...(run.revision === revision
          ? []
          : [treeLabel(run.revision, revision)]),
      ]}
    />
  );
}
