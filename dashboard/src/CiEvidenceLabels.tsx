// Intent's CI evidence and comparison identity as one strip of grouped short
// labels instead of sentences: CI status Proof's attempt and CI wall time
// (`./IntentCiProof.tsx`); a Summary's or a file's Proof evidence -- the
// attempt, revision, branch, a running result's completed ancestor, the tree's
// newer revision, a previously retrieved judgment and a failed refresh
// (`./IntentScopeEvidenceLabels.tsx`) -- or a story comparison's Baseline,
// Branch and Landed with their status words, the provisional mark and the
// observed-not-attributed framing (`./IntentScopeComparisonTable.tsx`); and
// the notes on a Summary's figures (`./IntentScopeSummaryRows.tsx`). Each
// label shows a Lucide icon, hidden from assistive technology, beside its
// short words. A reader hears the label from its content: unseen words naming
// what the icon stands for where the short words leave it out ("Revision"
// before `abc1234`), the short words, then any fuller words, unseen too and
// shown on hover. The labels naming an attempt both Proof and a Summary show
// live here.

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
  // What a reader hears before the label's words but does not see: what the
  // icon stands for when the words leave it out, such as "Revision" before
  // `abc1234`.
  readonly prefix?: string;
  // What the label shows beside its icon, and a reader hears.
  readonly words: ReactNode;
  // The fact in full, heard after the words and shown on hover.
  readonly full?: string;
  // The full words are announced as they appear, as a failure is.
  readonly announced?: boolean;
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
      {labels.map(
        ({ key, icon, prefix, words, full, announced, className }) => (
          <li
            key={key}
            className={
              className === undefined
                ? "intent-evidence-label"
                : `intent-evidence-label ${className}`
            }
          >
            {/* The hover is the content's, not the list item's: a list item's
              title would become its accessible name. */}
            <span className="intent-evidence-label-content" title={full}>
              <Icon icon={icon} />
              <span className="intent-evidence-label-heard">
                {prefix !== undefined && (
                  <span className="visually-hidden">{`${prefix} `}</span>
                )}
                <span className="intent-evidence-label-words">{words}</span>
              </span>
              {full !== undefined && (
                <span className="visually-hidden">
                  {", "}
                  <span
                    className="intent-evidence-label-full"
                    {...(announced === true ? { role: "alert" } : {})}
                  >
                    {full}
                  </span>
                </span>
              )}
            </span>
          </li>
        ),
      )}
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
    words:
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
    prefix: "Revision",
    words: <code>{sha}</code>,
  };
}

// That the proof shown is a running result's completed ancestor's.
export const ancestorLabel: EvidenceLabel = {
  key: "ancestor",
  icon: History,
  words: "Completed ancestor",
  full: "The completed ancestor of the running result",
};

export function wallTimeLabel(run: ShownCiProofRun): EvidenceLabel {
  const { words, full } = ciWallTime(run.startedAt, run.completedAt);
  return {
    key: "wall time",
    icon: Timer,
    words,
    ...(full === undefined ? {} : { full }),
  };
}
