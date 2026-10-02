// The project actions row's Start session: the developer asks the selected host
// to start a session on this machine in the selected project's folder,
// with no story or skill and an optional first message of their own. The
// session is listed in Recent sessions and the Sessions sidebar, like any
// launched session; no card lists it. The dialog closes once the local
// service accepted the launch, leaving the keyboard on what says, beside the
// button, that the startup goes on while the button waits for it. A started
// session then opens in the page's terminal, with the keyboard in it unless
// the developer moved it meanwhile (`keyboardRestsOn`), and Close returns
// the keyboard to the button. The dialog's mechanics, including the
// keyboard's return to the button when nothing was accepted, belong to
// `LaunchDialog`. A launch that did not start, or may not have, says so
// beside the button, which stays enabled to start again. Nothing here makes
// a card or a story.

import { embeddedTerminal, hostName } from "./sessionCapabilities.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { useCallback, useId, useRef, useState } from "react";
import { adHocName, type LaunchChoices } from "./agentLaunch.ts";
import type { LaunchAttempt, OnLaunched } from "./launchAttempts.ts";
import { LaunchDialog } from "./LaunchDialog.tsx";
import { useLaunchDialogLauncher } from "./launchDialogLauncher.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import { usePageSessions } from "./pageSessions.ts";
import { keyboardRestsOn } from "./launchHandoff.ts";
import "./agent-launch.css";

export function StartSession({
  project,
  sourceId,
  attempt,
  onStart,
}: {
  // The selected project's name.
  readonly project: string;
  readonly sourceId: string;
  // The last launch from this row that has not started a session.
  readonly attempt: LaunchAttempt | undefined;
  // Answers whether the launch was accepted; its session, once launched, is
  // presented (`onLaunched`) and then takes the keyboard.
  readonly onStart: (
    choices: LaunchChoices,
    onLaunched: OnLaunched,
  ) => Promise<boolean>;
}) {
  const [host, setHost] = useState<AgentLaunchRequest["host"]>("claude");
  const starting = attempt?.kind === "starting";
  const answerId = useId();
  const progress = useRef<HTMLParagraphElement>(null);
  const { launcher, open, openDialog, closeDialog } = useLaunchDialogLauncher(
    starting,
    useCallback(() => progress.current, []),
  );
  const { openTerminal, hostOperations } = usePageSessions();
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="start-session-button"
        aria-haspopup="dialog"
        aria-label={`Start session in ${project}`}
        aria-describedby={attempt !== undefined ? answerId : undefined}
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
      {attempt?.kind === "starting" && (
        <p
          ref={progress}
          id={answerId}
          tabIndex={-1}
          className="launch-answer quiet start-session-answer"
        >
          Starting a session in {project}… Local startup in progress.
        </p>
      )}
      {attempt !== undefined && attempt.kind !== "starting" && (
        <LaunchProblemAnswer
          id={answerId}
          problem={attempt}
          className="start-session-answer"
        />
      )}
      {open && (
        <LaunchDialog
          sourceId={sourceId}
          host={host}
          onHost={setHost}
          heading={`Start a session in ${project} in ${hostName(host)}`}
          description={`${hostName(host)} starts a background session on this machine, in this project's folder, with no story or skill. It is listed as ${project} · ${adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          onStart={(choices) =>
            onStart(choices, (record) => {
              if (
                embeddedTerminal(hostOperations, record.session.host) &&
                launcher.current !== null
              )
                openTerminal({
                  record,
                  control: launcher.current,
                  // The button holds the keyboard once the startup ends,
                  // if it rested on the startup's progress.
                  takesKeyboard: keyboardRestsOn(
                    progress.current,
                    launcher.current,
                  ),
                });
              setAnnouncement("Ad hoc session started");
            })
          }
          onClose={closeDialog}
        />
      )}
    </>
  );
}
