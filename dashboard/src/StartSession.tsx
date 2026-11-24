// The Start session and Follow up dialog and the launch answer beside its
// trigger. A blank start opens the terminal for the first input. A typed
// start leaves the Side panel as it is. LaunchDialog owns dialog focus return.

import { hostName } from "./sessionCapabilities.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  adHocName,
  admitsIsolatedStory,
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
import { instructionTranscription } from "./instructionTranscriptionSource.ts";
import { requestLaunchHostOptions } from "./launchHostOptionsClient.ts";
import {
  openDialogFromActivation,
  useLaunchDialogLauncher,
} from "./launchDialogLauncher.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import type { OpenTerminal } from "./pageSessions.ts";
import { keyboardRestsOn } from "./launchHandoff.ts";
import { MessageSquarePlus, SquareTerminal } from "lucide-react";
import { FollowUpSubject, type FollowUpShown } from "./FollowUpSubject.tsx";
import { followUpSourceAttachingNotes } from "./followUpRequest.ts";
import { sessionAttachingStoryNotes } from "./AttachStoryNotes.tsx";
import { Icon } from "./Icon.tsx";
import "./agent-launch.css";
import "./frame-controls.css";

export type AdHocLaunches = Pick<
  MachineSessions,
  "adHocAttemptOf" | "rereadOffers" | "sessionPolicyOffer" | "startAdHoc"
>;

// Session policy offer, reread, and this button's last unfinished launch
// (`adHocAttemptOf`). Line-number Follow up uses `autoOpen` / `showTrigger`.
export function StartSession({
  project,
  sourceId,
  launches,
  presentTerminal,
  followUp,
  onOpen,
  autoOpen = false,
  showTrigger = true,
  onClosed,
}: {
  // The selected project's name.
  readonly project: string;
  readonly sourceId: string;
  readonly launches: AdHocLaunches;
  readonly presentTerminal: OpenTerminal;
  // Set where an entry's Follow up opens the dialog.
  readonly followUp?: FollowUpShown | undefined;
  readonly onOpen?: () => void;
  readonly autoOpen?: boolean;
  // When false, keep a visually hidden launcher for focus return and
  // terminal handoff without a second Follow up control in the heading.
  readonly showTrigger?: boolean;
  readonly onClosed?: () => void;
}) {
  const [host, setHost] = useState<AgentLaunchRequest["host"]>("claude");
  // Each opening starts from the default choices.
  const [policy, setPolicy] = useState(unattachedPolicyOf({}));
  // Kept after accept so Follow up still finds an attempt keyed with notes.
  const [attachNotes, setAttachNotes] = useState(false);
  const attempt = launches.adHocAttemptOf(
    sourceId,
    followUpSourceAttachingNotes(followUp?.source, attachNotes),
  );
  const starting = attempt?.kind === "starting";
  const admitting = admitsIsolatedStory({ policy, followUp });
  const answerId = useId();
  const progress = useRef<HTMLParagraphElement>(null);
  const { launcher, opening, openDialog, closeDialog } =
    useLaunchDialogLauncher(
      starting,
      useCallback(() => progress.current, []),
    );
  const opened = useRef(false);
  const storyIdentity =
    followUp !== undefined && "story" in followUp.source
      ? followUp.source.story.identity
      : undefined;
  useEffect(() => {
    if (!autoOpen || opened.current) return;
    opened.current = true;
    onOpen?.();
    openDialog();
  }, [autoOpen, onOpen, openDialog]);

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className={showTrigger ? "frame-button" : "visually-hidden"}
        aria-haspopup="dialog"
        aria-label={
          followUp === undefined
            ? `Start session in ${project}`
            : `Follow up ${followUp.name}`
        }
        aria-describedby={attempt !== undefined ? answerId : undefined}
        disabled={starting}
        tabIndex={showTrigger ? undefined : -1}
        {...openDialogFromActivation(() => {
          setPolicy(unattachedPolicyOf({}));
          onOpen?.();
          openDialog();
        }, starting)}
      >
        {showTrigger && (
          <>
            <Icon
              icon={followUp === undefined ? SquareTerminal : MessageSquarePlus}
            />
            {followUp === undefined ? "Start session" : "Follow up"}
          </>
        )}
      </button>
      {attempt?.kind === "starting" && (
        <p
          ref={progress}
          id={answerId}
          tabIndex={-1}
          className="launch-answer quiet start-session-answer"
        >
          Starting a session in {project}…{" "}
          {admitting ? "Admitting a story." : "Local startup in progress."}
        </p>
      )}
      {attempt !== undefined && attempt.kind !== "starting" && (
        <LaunchProblemAnswer
          id={answerId}
          problem={attempt}
          className="start-session-answer"
        />
      )}
      {opening !== undefined && (
        <LaunchDialog
          key={opening}
          readOptions={requestLaunchHostOptions}
          transcription={instructionTranscription}
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
          description={`${hostName(host)} starts a background session on this machine, in ${policy.workspace === "isolated" ? "a new workspace of this project" : "this project's execution checkout"}, ${admitting ? "under its new Taken story" : "with no story or skill"}${followUp === undefined ? "" : ", sending this context with your request"}. It is listed as ${project} · ${admitting ? "its story title" : adHocName}.`}
          fieldLabel="What would you like to talk about? (optional)"
          session={sessionAttachingStoryNotes(
            unattachedSession({
              policy,
              onPolicy: setPolicy,
              offer: launches.sessionPolicyOffer(sourceId, "ad-hoc", host),
            }),
            storyIdentity === undefined
              ? undefined
              : { sourceId, identity: storyIdentity, onAttach: setAttachNotes },
          )}
          effects={
            <>
              <strong className="launch-dialog-summary">
                {unattachedSummary(policy)}
              </strong>{" "}
              {unattachedEffect(policy, admitting)}
            </>
          }
          details={
            <p>
              {unattachedWhere(
                policy,
                establishesSession({ policy }),
                admitting,
              )}
            </p>
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
              followUpSourceAttachingNotes(followUp?.source, attachNotes),
            )
          }
          onClose={(accepted) => {
            if (!closeDialog(opening, accepted)) return;
            // Keep the launcher mounted through an accepted start so the
            // blank follow-up can present its terminal; Cancel clears a
            // line-menu host and drops an unchecked attach choice.
            if (!accepted) {
              setAttachNotes(false);
              onClosed?.();
            }
          }}
        />
      )}
    </>
  );
}
