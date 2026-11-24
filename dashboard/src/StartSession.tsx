// Start session owns the launcher's startup status and keyboard handoff.
// Each opening mounts its own form. Follow up uses that form to name the
// source and choose its attachments, and keeps the submitted source while
// startup or recovery is shown beside the launcher.

import type { AgentLaunchRequest, LaunchChoices } from "./agentLaunch.ts";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { MachineSessions } from "./agentLaunches.ts";
import {
  openDialogFromActivation,
  useLaunchDialogLauncher,
} from "./launchDialogLauncher.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import type { OpenTerminal } from "./pageSessions.ts";
import { keyboardRestsOn } from "./launchHandoff.ts";
import { MessageSquarePlus, SquareTerminal } from "lucide-react";
import type { FollowUpShown } from "./FollowUpSubject.tsx";
import { sameFollowUpSource, type FollowUpSource } from "./followUpRequest.ts";
import { StartSessionDialog } from "./StartSessionDialog.tsx";
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
  // Called as the dialog opens.
  readonly onOpen?: () => void;
  // Open once on mount (line-number Follow up).
  readonly autoOpen?: boolean;
  // When false, keep a visually hidden launcher for focus return and
  // terminal handoff without a second Follow up control in the heading.
  readonly showTrigger?: boolean;
  readonly onClosed?: () => void;
}) {
  const [host, setHost] = useState<AgentLaunchRequest["host"]>("claude");
  const [submitted, setSubmitted] = useState<{
    subject: FollowUpSource | undefined;
    source: FollowUpSource | undefined;
  }>();
  const subject = followUp?.source;
  const attempt = launches.adHocAttemptOf(
    sourceId,
    submitted !== undefined && sameFollowUpSource(submitted.subject, subject)
      ? submitted.source
      : subject,
  );
  const starting = attempt?.kind === "starting";
  const answerId = useId();
  const progress = useRef<HTMLParagraphElement>(null);
  const { launcher, opening, openDialog, closeDialog } =
    useLaunchDialogLauncher(
      starting,
      useCallback(() => progress.current, []),
    );
  const opened = useRef(false);
  useEffect(() => {
    if (!autoOpen || opened.current) return;
    opened.current = true;
    onOpen?.();
    openDialog();
  }, [autoOpen, onOpen, openDialog]);

  const start = (
    choices: LaunchChoices,
    source: FollowUpSource | undefined,
  ) => {
    setSubmitted({ subject, source });
    return launches.startAdHoc(
      sourceId,
      choices,
      (record) => {
        if (launcher.current !== null)
          presentTerminal({
            record,
            control: launcher.current,
            takesKeyboard: keyboardRestsOn(progress.current, launcher.current),
          });
      },
      source,
    );
  };

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
      {opening !== undefined && (
        <StartSessionDialog
          key={opening}
          project={project}
          sourceId={sourceId}
          host={host}
          followUp={followUp}
          launches={launches}
          onHost={setHost}
          onStart={start}
          onClose={(accepted) => {
            if (closeDialog(opening, accepted) && !accepted) onClosed?.();
          }}
        />
      )}
    </>
  );
}
