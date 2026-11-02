// A launch dialog's confirmation for a new execution start whose origin
// target CI is not a pass: names the branch, judged revision and state, how
// many later commits lack their own result, and the run when given. Heading
// takes the keyboard; Back/Escape returns to the choices; Continue resends
// with the confirmed revision and state. A changed judgment asks again.
// Judgment wording is shared with Intent's CI status (`./baseCiWording.ts`).

import { useEffect, useRef } from "react";
import type { BaseCiFound } from "./baseCiConfirmation.ts";
import {
  completedAncestorLine,
  laterWithoutResultLine,
  noCompletedAncestorLine,
  shortSha,
} from "./baseCiWording.ts";

export const baseCiFailedHeading = "Base CI failed";
export const baseCiRunningHeading = "Base CI still running";
export const baseCiUnreadHeading = "Base CI could not be read";

export function baseCiHeading(state: BaseCiFound["state"]): string {
  if (state === "failed") return baseCiFailedHeading;
  if (state === "running") return baseCiRunningHeading;
  return baseCiUnreadHeading;
}

export function baseCiContinueLabel(state: BaseCiFound["state"]): string {
  if (state === "failed") return "Continue on failing base";
  if (state === "running") return "Continue while CI runs";
  return "Continue without CI result";
}

export function LaunchBaseCi({
  id,
  found,
  starting,
  onBack,
  onContinue,
}: {
  readonly id: string;
  readonly found: BaseCiFound;
  readonly starting: boolean;
  readonly onBack: () => void;
  readonly onContinue: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(`${found.revision}:${found.state}`);
  const changed = `${found.revision}:${found.state}` !== first.current;
  const headingId = `${id}-base-ci-heading`;
  const title = baseCiHeading(found.state);

  useEffect(() => {
    heading.current?.focus();
  }, [found.revision, found.state]);

  return (
    <section className="launch-changes" aria-labelledby={headingId}>
      <div className="launch-dialog-body">
        <h2 id={headingId} ref={heading} tabIndex={-1}>
          {title}
        </h2>
        <p role="status" className="launch-changes-notice">
          {changed
            ? "The base's CI changed after it was shown; review it again."
            : ""}
        </p>
        <p>
          Origin <code>{found.branch}</code>
          {found.revision === "unavailable"
            ? ""
            : ` at ${shortSha(found.revision)} (${found.subject})`}
          {found.state === "failed"
            ? " has a failing nearest result of the project's selected CI check."
            : found.state === "running"
              ? " has a nearest CI check that is still running."
              : " could not have its CI read."}
        </p>
        {found.laterWithoutResult > 0 && (
          <p>{laterWithoutResultLine(found.laterWithoutResult)}</p>
        )}
        {found.reason !== undefined && <p>{found.reason}</p>}
        {found.runUrl !== undefined && (
          <p>
            <a href={found.runUrl} target="_blank" rel="noreferrer">
              {found.runUrl}
            </a>
          </p>
        )}
        {found.state === "running" &&
          (found.completedAncestor === undefined ? (
            <p>{noCompletedAncestorLine}</p>
          ) : (
            <>
              <p>{completedAncestorLine(found.completedAncestor)}</p>
              {found.completedAncestor.runUrl !== undefined && (
                <p>
                  <a
                    href={found.completedAncestor.runUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {found.completedAncestor.runUrl}
                  </a>
                </p>
              )}
            </>
          ))}
      </div>
      <div className="launch-dialog-footer">
        <div className="launch-dialog-actions">
          <button
            type="button"
            className="frame-button"
            onClick={onBack}
            disabled={starting}
          >
            Back
          </button>
          <button
            type="button"
            className="frame-button frame-button-primary"
            onClick={onContinue}
            disabled={starting}
          >
            {starting ? "Starting…" : baseCiContinueLabel(found.state)}
          </button>
        </div>
      </div>
    </section>
  );
}
