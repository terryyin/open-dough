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
//
// An entry in Recently done that no longer offers Open terminal opens the
// same dialog from its Follow up (`followUp`), with the same choices and
// defaults: it also names the entry it follows up and lists, read-only, the
// context the server will send with the request (`./followUpContext.ts`).
// Its launch is the entry's own beside its button (`./launchAttempts.ts`).

import { hostName } from "./sessionCapabilities.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { useCallback, useId, useRef, useState } from "react";
import {
  adHocName,
  establishesSession,
  unattachedPolicyOf,
} from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { unattachedSession } from "./UnattachedSessionPolicy.tsx";
import {
  unattachedEffect,
  unattachedSummary,
  unattachedWhere,
} from "./sessionPolicyWords.ts";
import { LaunchDialog } from "./LaunchDialog.tsx";
import { useLaunchDialogLauncher } from "./launchDialogLauncher.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import { usePageSessions } from "./pageSessions.ts";
import { keyboardRestsOn } from "./launchHandoff.ts";
import { MessageSquarePlus, SquareTerminal } from "lucide-react";
import { FollowUpSubject, type FollowUpShown } from "./FollowUpSubject.tsx";
import { Icon } from "./Icon.tsx";
import "./agent-launch.css";
import "./frame-controls.css";

// The selected host's installed skills decide whether a session with no story
// is established (`sessionPolicyOffer`); without it only the default choices
// are offered. Another host's offers are read again (`rereadOffers`). The last
// launch from this button that has not started a session is its own
// (`adHocAttemptOf`), the project's or, for a follow-up, its source's.
export function StartSession({
  project,
  sourceId,
  launches,
  followUp,
  onOpen,
}: {
  // The selected project's name.
  readonly project: string;
  readonly sourceId: string;
  readonly launches: MachineSessions;
  // Set where an entry's Follow up opens the dialog.
  readonly followUp?: FollowUpShown | undefined;
  // Called as the dialog opens.
  readonly onOpen?: () => void;
}) {
  const attempt = launches.adHocAttemptOf(sourceId, followUp?.source);
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
        aria-label={
          followUp === undefined
            ? `Start session in ${project}`
            : `Follow up ${followUp.name}`
        }
        aria-describedby={attempt !== undefined ? answerId : undefined}
        disabled={starting}
        onClick={() => {
          onOpen?.();
          openDialog();
        }}
      >
        <Icon
          icon={followUp === undefined ? SquareTerminal : MessageSquarePlus}
        />
        {followUp === undefined ? "Start session" : "Follow up"}
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
            launches.rereadOffers();
          }}
          heading={`Start a session in ${project} in ${hostName(host)}`}
          context={
            followUp === undefined ? undefined : (
              <FollowUpSubject followUp={followUp} />
            )
          }
          description={`${hostName(host)} starts a background session on this machine, in ${policy.workspace === "isolated" ? "a new workspace of this project" : "this project's folder"}, with no story or skill${followUp === undefined ? "" : ", sending this context with your request"}. It is listed as ${project} · ${adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          session={unattachedSession({
            policy,
            onPolicy: setPolicy,
            offer: launches.sessionPolicyOffer(sourceId, "ad-hoc", host),
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
            launches.startAdHoc(
              sourceId,
              choices,
              (record) => {
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
              },
              followUp?.source,
            )
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
