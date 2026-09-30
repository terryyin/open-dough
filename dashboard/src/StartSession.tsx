// The project actions row's Start session: the developer asks Claude Code to
// start a background session on this machine in the selected project's folder,
// with no story or skill and an optional first message of their own. The
// session is listed in Recent sessions and the Sessions sidebar, like any
// launched session; no card lists it. A started session opens at once in the
// page's terminal with the keyboard in it, and Close returns the keyboard to
// the button. The dialog's mechanics, including the keyboard's return to the
// button when nothing launched, belong to `LaunchDialog`. A launch that did
// not start, or may not have, says so beside the button, which stays enabled
// to start again.

import { useId, useState } from "react";
import {
  adHocName,
  type LaunchChoices,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { LaunchAttempt } from "./agentLaunches.ts";
import { LaunchDialog, useLaunchDialogLauncher } from "./LaunchDialog.tsx";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import { usePageSessions } from "./pageSessions.ts";
import "./agent-launch.css";

export function StartSession({
  project,
  attempt,
  onStart,
}: {
  // The selected project's name.
  readonly project: string;
  // The last launch from this row that has not started a session.
  readonly attempt: LaunchAttempt | undefined;
  // Answers the launched session, which then takes the keyboard.
  readonly onStart: (
    choices: LaunchChoices,
  ) => Promise<LaunchWithState | undefined>;
}) {
  const starting = attempt?.kind === "starting";
  const answerId = useId();
  const { launcher, open, openDialog, closeDialog } =
    useLaunchDialogLauncher(starting);
  const { openTerminal } = usePageSessions();
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="start-session-button"
        aria-haspopup="dialog"
        aria-label={`Start session in ${project}`}
        aria-describedby={
          attempt !== undefined && !starting ? answerId : undefined
        }
        disabled={starting}
        onClick={() => {
          setAnnouncement("");
          openDialog();
        }}
      >
        Start session
      </button>
      <p role="log" className="quiet">
        {announcement}
      </p>
      {attempt !== undefined && attempt.kind !== "starting" && (
        <LaunchProblemAnswer
          id={answerId}
          problem={attempt}
          className="start-session-answer"
        />
      )}
      {open && (
        <LaunchDialog
          heading={`Start a session in ${project} in Claude Code`}
          description={`Claude Code starts a background session on this machine, in this project's folder, with no story or skill. It is listed as ${project} · ${adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          starting={starting}
          onStart={async (choices) => {
            const record = await onStart(choices);
            if (record === undefined || launcher.current === null) {
              return false;
            }
            openTerminal({ record, control: launcher.current });
            setAnnouncement("Ad hoc session started");
            return true;
          }}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
