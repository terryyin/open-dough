// The project actions row's Start session: the developer asks Claude Code to
// start a background session on this machine in the selected project's folder,
// with no story or skill and an optional first message of their own. The
// session is listed in Recent sessions and the Sessions sidebar, like any
// launched session; no card lists it. A started session opens at once in the
// page's terminal with the keyboard in it, and Close returns the keyboard to
// the button. The dialog's mechanics, including the keyboard's return to the
// button when nothing launched, belong to `LaunchDialog`.

import { useState } from "react";
import { adHocName, type LaunchWithState } from "./agentLaunch.ts";
import { LaunchDialog, useLaunchDialogLauncher } from "./LaunchDialog.tsx";
import { usePageSessions } from "./pageSessions.ts";
import "./agent-launch.css";

export function StartSession({
  project,
  starting,
  onStart,
}: {
  // The selected project's name.
  readonly project: string;
  readonly starting: boolean;
  // Answers the launched session, which then takes the keyboard.
  readonly onStart: (
    instruction: string,
  ) => Promise<LaunchWithState | undefined>;
}) {
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
        disabled={starting}
        onClick={() => {
          setAnnouncement("");
          openDialog();
        }}
      >
        Start session
      </button>
      <p role="status" className="quiet">
        {announcement}
      </p>
      {open && (
        <LaunchDialog
          heading={`Start a session in ${project} in Claude Code`}
          description={`Claude Code starts a background session on this machine, in this project's folder, with no story or skill. It is listed as ${project} · ${adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          starting={starting}
          onStart={async (instruction) => {
            const record = await onStart(instruction);
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
