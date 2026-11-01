// A launch dialog's confirmation for a session in the default checkout that
// holds uncommitted changes: which paths changed and how many (never their
// content), that continuing includes them in the session's result, and the
// landing that remains selected, which confirming never changes. Its heading
// takes the keyboard when it opens, and again when the changes changed before
// Continue, which then asks once more. Nothing is preselected: the developer
// chooses Back or Continue with existing changes.

import { useEffect, useRef } from "react";
import type { ExistingChangesFound, SessionPolicy } from "./agentLaunch.ts";

const existingChangesHeading = "Existing changes in default main";

// What stays selected after checks, said under the changes.
function landingRemains(landing: SessionPolicy["landing"]): string {
  return landing === "auto-land"
    ? "Automatically land remains selected; verified changes may land without another review."
    : "Wait for review remains selected.";
}

export function LaunchExistingChanges({
  id,
  found,
  landing,
  starting,
  onBack,
  onContinue,
}: {
  readonly id: string;
  readonly found: ExistingChangesFound;
  readonly landing: SessionPolicy["landing"];
  readonly starting: boolean;
  readonly onBack: () => void;
  readonly onContinue: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  // The fingerprint first shown in this confirmation: a later one means the
  // changes changed after they were shown.
  const first = useRef(found.fingerprint);
  const changed = found.fingerprint !== first.current;
  const headingId = `${id}-changes-heading`;
  const countId = `${id}-changes-count`;
  const more = found.count - found.paths.length;

  useEffect(() => {
    heading.current?.focus();
  }, [found.fingerprint]);

  return (
    <section className="launch-changes" aria-labelledby={headingId}>
      <div className="launch-dialog-body">
        <h2 id={headingId} ref={heading} tabIndex={-1}>
          {existingChangesHeading}
        </h2>
        <p role="status" className="launch-changes-notice">
          {changed
            ? "The changes in default main changed after they were shown; review them again."
            : ""}
        </p>
        <p>
          Continuing includes these changes in this session's result. When
          committed, all checkout changes are committed together.
        </p>
        <p id={countId} className="launch-changes-count">
          {found.count === 1
            ? "1 changed path"
            : `${found.count} changed paths`}
        </p>
        <ul className="launch-changes-paths" aria-labelledby={countId}>
          {found.paths.map((path) => (
            <li key={path}>
              <code>{path}</code>
            </li>
          ))}
        </ul>
        {more > 0 && <p className="quiet">and {more} more</p>}
        <p className="launch-changes-landing">{landingRemains(landing)}</p>
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
            {starting ? "Starting…" : "Continue with existing changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
