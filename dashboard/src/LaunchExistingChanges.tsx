// A launch dialog's confirmation state for a session in the default checkout
// that holds uncommitted changes: which paths changed and how many (never
// their content), that continuing includes them in the session's result, and
// the landing that remains selected, which confirming never changes. Its
// heading takes the keyboard when it opens, and again when the changes
// changed before Continue, which then asks once more. Nothing is
// preselected: the developer chooses Back or Continue with existing changes.

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import type {
  ExistingChangesFound,
  LaunchChoices,
  SessionPolicy,
} from "./agentLaunch.ts";

// What a launch answers its dialog: whether a session was launched, or the
// default checkout's existing changes to confirm, with nothing started.
export type StartAnswer = boolean | ExistingChangesFound;

// A launch dialog's confirmation state: `start` asks for the launch; changes
// it finds are shown (`view`, the choices hidden behind it) until Back,
// Escape, or a launch answer, and Continue sends that Start's choices again
// with the confirmation. Back returns the keyboard to Start (`startButton`)
// once the choices show again. Any other answer is the dialog's to end with
// (`ended`).
export function useExistingChangesConfirmation({
  id,
  policy,
  starting,
  onStart,
  ended,
}: {
  readonly id: string;
  readonly policy: SessionPolicy | undefined;
  readonly starting: boolean;
  readonly onStart: (choices: LaunchChoices) => Promise<StartAnswer>;
  readonly ended: (launched: boolean) => void;
}): {
  readonly view: ReactNode;
  readonly startButton: RefObject<HTMLButtonElement | null>;
  readonly start: (choices: LaunchChoices) => void;
  readonly onCancel: (event: SyntheticEvent) => void;
} {
  const [found, setFound] = useState<ExistingChangesFound>();
  const asked = useRef<LaunchChoices>(undefined);
  const startButton = useRef<HTMLButtonElement>(null);
  const backToChoices = useRef(false);
  useEffect(() => {
    if (found === undefined && backToChoices.current) {
      backToChoices.current = false;
      startButton.current?.focus();
    }
  }, [found]);
  const start = (choices: LaunchChoices) => {
    void onStart(choices).then((answer) => {
      if (typeof answer !== "object") {
        ended(answer);
        return;
      }
      asked.current = choices;
      setFound(answer);
    });
  };
  const back = () => {
    backToChoices.current = true;
    setFound(undefined);
  };
  return {
    view: found !== undefined && policy !== undefined && (
      <LaunchExistingChanges
        id={id}
        found={found}
        policy={policy}
        starting={starting}
        onBack={back}
        onContinue={() => {
          if (asked.current === undefined) return;
          start({ ...asked.current, existingChanges: found.fingerprint });
        }}
      />
    ),
    startButton,
    start,
    onCancel: (event) => {
      if (found !== undefined && !starting) {
        event.preventDefault();
        back();
      }
    },
  };
}

const existingChangesHeading = "Existing changes in default main";

// What stays selected after checks, said under the changes.
function landingRemains(policy: SessionPolicy): string {
  return policy.landing === "auto-land"
    ? "Automatically land remains selected; verified changes may land without another review."
    : "Wait for review remains selected.";
}

function LaunchExistingChanges({
  id,
  found,
  policy,
  starting,
  onBack,
  onContinue,
}: {
  readonly id: string;
  readonly found: ExistingChangesFound;
  readonly policy: SessionPolicy;
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
        <p className="launch-changes-landing">{landingRemains(policy)}</p>
      </div>
      <div className="launch-dialog-footer">
        <div className="launch-dialog-actions">
          <button type="button" onClick={onBack} disabled={starting}>
            Back
          </button>
          <button
            type="button"
            className="launch-dialog-start"
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
