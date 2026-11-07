// Intent's CI evidence and comparison identity as one strip of grouped short
// labels instead of sentences: CI status Proof's attempt and CI wall time
// (`./IntentCiProof.tsx`); a Summary's or a file's Proof evidence -- the
// attempt, revision, branch, a running result's completed ancestor, the tree's
// newer revision, a previously retrieved judgment and a failed refresh
// (`./IntentScopeEvidenceLabels.tsx`) -- or a story comparison's Baseline,
// Branch and Landed with their status words, the provisional mark and the
// observed-not-attributed framing (`./IntentScopeComparisonTable.tsx`); and
// the notes on a Summary's figures (`./IntentScopeSingleProofTable.tsx`). Each
// label shows a Lucide icon, hidden from assistive technology, beside its
// short words; the label's accessible name names what the icon stands for
// with those words, and any fuller words are its description and hover. The
// labels naming an attempt both Proof and a Summary show live here.

import type { ReactNode } from "react";
import {
  CirclePlay,
  GitCommitHorizontal,
  History,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { shortSha } from "./baseCiWording.ts";
import { isAdapterProofAttempt } from "./ciProof.ts";
import { ciWallTime } from "./ciProofTimeWords.ts";
import { Icon } from "./Icon.tsx";
import type { ShownCiProofRun } from "./shownCiProofRun.ts";
import "./ci-evidence-labels.css";

export type EvidenceLabel = {
  readonly key: string;
  readonly icon: LucideIcon;
  // What a reader of the label hears: what the icon stands for and the
  // label's short words, such as "Revision abc1234".
  readonly name: string;
  // What the label shows beside its icon, when not just its name.
  readonly shown?: ReactNode;
  // The fact in full, as the label's description and on hover.
  readonly full?: string;
  readonly className?: string;
};

export function EvidenceLabels({
  label,
  labels,
}: {
  // The strip's accessible name, such as "CI evidence".
  readonly label: string;
  readonly labels: readonly EvidenceLabel[];
}) {
  if (labels.length === 0) return null;
  return (
    <ul aria-label={label} className="intent-evidence-labels">
      {labels.map(({ key, icon, name, shown, full, className }) => (
        <li
          key={key}
          aria-label={name}
          title={full}
          className={
            className === undefined
              ? "intent-evidence-label"
              : `intent-evidence-label ${className}`
          }
        >
          <Icon icon={icon} />
          <span className="intent-evidence-label-words">{shown ?? name}</span>
        </li>
      ))}
    </ul>
  );
}

// "Run 41 · attempt 2" or an adapter's "Attempt 9f1c", linked to the run
// when it has a link: the attempt CI proof was read from.
export function attemptLabel(run: ShownCiProofRun): EvidenceLabel {
  const words = isAdapterProofAttempt(run)
    ? `Attempt ${run.attemptId}`
    : `Run ${String(run.runId)} · attempt ${String(run.runAttempt)}`;
  return {
    key: "attempt",
    icon: CirclePlay,
    name: words,
    shown:
      run.runUrl === undefined ? (
        words
      ) : (
        <a href={run.runUrl} target="_blank" rel="noreferrer">
          {words}
        </a>
      ),
  };
}

export function revisionLabel(revision: string): EvidenceLabel {
  const sha = shortSha(revision);
  return {
    key: "revision",
    icon: GitCommitHorizontal,
    name: `Revision ${sha}`,
    shown: <code>{sha}</code>,
  };
}

// That the proof shown is a running result's completed ancestor's.
export const ancestorLabel: EvidenceLabel = {
  key: "ancestor",
  icon: History,
  name: "Completed ancestor",
  full: "The completed ancestor of the running result",
};

export function wallTimeLabel(run: ShownCiProofRun): EvidenceLabel {
  const { words, full } = ciWallTime(run.startedAt, run.completedAt);
  return {
    key: "wall time",
    icon: Timer,
    name: words,
    ...(full === undefined ? {} : { full }),
  };
}
