// The project actions row's Start session: the developer asks Claude Code to
// start a background session on this machine in the selected project's folder,
// with no story or skill and an optional first message of their own. The
// session is listed in Recent sessions and the Sessions sidebar, like any
// launched session; no card lists it. The dialog's mechanics, including the
// keyboard's return to the button, belong to `LaunchDialog`.

import { adHocName } from "./agentLaunch.ts";
import { LaunchDialog, useLaunchDialogLauncher } from "./LaunchDialog.tsx";
import "./agent-launch.css";

export function StartSession({
  project,
  starting,
  onStart,
}: {
  // The selected project's name.
  readonly project: string;
  readonly starting: boolean;
  // Answers whether a session was launched, which then takes the keyboard.
  readonly onStart: (instruction: string) => Promise<boolean>;
}) {
  const { launcher, open, openDialog, closeDialog } =
    useLaunchDialogLauncher(starting);

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="start-session-button"
        aria-haspopup="dialog"
        aria-label={`Start session in ${project}`}
        disabled={starting}
        onClick={openDialog}
      >
        Start session
      </button>
      {open && (
        <LaunchDialog
          heading={`Start a session in ${project} in Claude Code`}
          description={`Claude Code starts a background session on this machine, in this project's folder, with no story or skill. It is listed as ${project} · ${adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          starting={starting}
          onStart={onStart}
          onClose={closeDialog}
        />
      )}
    </>
  );
}
