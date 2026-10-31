// The project actions row's Start session: the developer asks the selected host
// to start a session on this machine in the selected project's folder,
// with no story or skill and an optional first message of their own. The
// session is listed in Recently done and the Sessions sidebar, like any
// launched session; no card lists it. Its Session group chooses where the
// session runs and what follows the checks of what it later verifies; the
// line beside Start names the choices and what Start authorizes. A session on
// default main has existing changes there confirmed in the dialog before
// anything starts (`LaunchExistingChanges`). The dialog closes once the local
// service accepted the launch, leaving the keyboard on what says, beside the
// button, that the startup goes on while the button waits for it. A started
// session then opens in the page's terminal, with the keyboard in it unless
// the developer moved it meanwhile (`keyboardRestsOn`), and Close returns
// the keyboard to the button. A session whose terminal the developer already
// opened themselves during the startup is left as they left it: closed stays
// closed, open stays open (`presentTerminal`). The dialog's mechanics,
// including the keyboard's return to the button when nothing was accepted,
// belong to `LaunchDialog`. A launch that did not start, or may not have, says so
// beside the button, which stays enabled to start again. Nothing here makes
// a card or a story.

import { hostName } from "./sessionCapabilities.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { useCallback, useId, useRef, useState } from "react";
import {
  adHocName,
  establishesSession,
  unattachedPolicyOf,
  type LaunchChoices,
} from "./agentLaunch.ts";
import type { SessionPolicyOffer } from "./launchOffers.ts";
import { unattachedSession } from "./UnattachedSessionPolicy.tsx";
import {
  unattachedEffect,
  unattachedSummary,
  unattachedWhere,
} from "./sessionPolicyWords.ts";
import type { LaunchAttempt, OnLaunched } from "./launchAttempts.ts";
import { LaunchDialog } from "./LaunchDialog.tsx";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import { useLaunchDialogLauncher } from "./launchDialogLauncher.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import { usePageSessions } from "./pageSessions.ts";
import { keyboardRestsOn } from "./launchHandoff.ts";
import { SquareTerminal } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./agent-launch.css";
import "./frame-controls.css";

export function StartSession({
  project,
  sourceId,
  attempt,
  sessionPolicy,
  onHostChanged,
  onStart,
}: {
  // The selected project's name.
  readonly project: string;
  readonly sourceId: string;
  // The last launch from this row that has not started a session.
  readonly attempt: LaunchAttempt | undefined;
  // Whether the selected host's installed skills establish a session with no
  // story; without it only the default choices are offered.
  readonly sessionPolicy: (
    host: AgentLaunchRequest["host"],
  ) => SessionPolicyOffer;
  // The developer chose another host, whose offers are read again.
  readonly onHostChanged: () => void;
  // Answers whether the launch was accepted, or the existing changes to
  // confirm; its session, once launched, is presented (`onLaunched`) and then
  // takes the keyboard.
  readonly onStart: (
    choices: LaunchChoices,
    onLaunched: OnLaunched,
  ) => Promise<StartAnswer>;
}) {
  const [host, setHost] = useState<AgentLaunchRequest["host"]>("claude");
  // Each opening starts from the default choices.
  const [policy, setPolicy] = useState(unattachedPolicyOf({}));
  const starting = attempt?.kind === "starting";
  const answerId = useId();
  const progress = useRef<HTMLParagraphElement>(null);
  const { launcher, open, openDialog, closeDialog } = useLaunchDialogLauncher(
    starting,
    useCallback(() => progress.current, []),
  );
  const { presentTerminal } = usePageSessions();

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="frame-button"
        aria-haspopup="dialog"
        aria-label={`Start session in ${project}`}
        aria-describedby={attempt !== undefined ? answerId : undefined}
        disabled={starting}
        onClick={openDialog}
      >
        <Icon icon={SquareTerminal} />
        Start session
      </button>
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
          projectContext
          host={host}
          onHost={(next) => {
            setHost(next);
            onHostChanged();
          }}
          heading={`Start a session in ${project} in ${hostName(host)}`}
          description={`${hostName(host)} starts a background session on this machine, in ${policy.workspace === "isolated" ? "a new workspace of this project" : "this project's folder"}, with no story or skill. It is listed as ${project} · ${adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          session={unattachedSession({
            policy,
            onPolicy: setPolicy,
            offer: sessionPolicy(host),
          })}
          effects={
            <>
              <strong className="launch-dialog-summary">
                {unattachedSummary(policy)}
              </strong>{" "}
              {unattachedEffect(policy)}
            </>
          }
          details={
            <p>{unattachedWhere(policy, establishesSession({ policy }))}</p>
          }
          onStart={(choices) =>
            onStart(choices, (record) => {
              if (launcher.current !== null)
                presentTerminal({
                  record,
                  control: launcher.current,
                  // The button holds the keyboard once the startup ends,
                  // if it rested on the startup's progress.
                  takesKeyboard: keyboardRestsOn(
                    progress.current,
                    launcher.current,
                  ),
                });
            })
          }
          onClose={(accepted) => {
            setPolicy(unattachedPolicyOf({}));
            closeDialog(accepted);
          }}
        />
      )}
    </>
  );
}
