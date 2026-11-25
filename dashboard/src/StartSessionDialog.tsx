import { useState } from "react";
import {
  adHocName,
  admitsAdHocStory,
  establishesSession,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type LaunchChoices,
} from "./agentLaunch.ts";
import { FollowUpSubject, type FollowUpShown } from "./FollowUpSubject.tsx";
import {
  followUpSourceAttaching,
  type FollowUpSessionChoice,
  type FollowUpSource,
} from "./followUpRequest.ts";
import { instructionTranscription } from "./instructionTranscriptionSource.ts";
import { LaunchDialog } from "./LaunchDialog.tsx";
import { requestLaunchHostOptions } from "./launchHostOptionsClient.ts";
import { hostName } from "./sessionCapabilities.ts";
import {
  unattachedEffect,
  unattachedSummary,
  unattachedWhere,
} from "./sessionPolicyWords.ts";
import type { AdHocLaunches } from "./StartSession.tsx";
import { unattachedSession } from "./UnattachedSessionPolicy.tsx";

type Host = AgentLaunchRequest["host"];

// All choices other than the remembered host are drafts of this opening.
export function StartSessionDialog({
  project,
  sourceId,
  host,
  followUp,
  launches,
  onHost,
  onStart,
  onRefused,
  onClose,
}: {
  readonly project: string;
  readonly sourceId: string;
  readonly host: Host;
  readonly followUp: FollowUpShown | undefined;
  readonly launches: Pick<AdHocLaunches, "rereadOffers" | "sessionPolicyOffer">;
  readonly onHost: (host: Host) => void;
  readonly onStart: (
    choices: LaunchChoices,
    source: FollowUpSource | undefined,
  ) => ReturnType<AdHocLaunches["startAdHoc"]>;
  readonly onRefused: () => void;
  readonly onClose: (accepted: boolean) => void;
}) {
  const [policy, setPolicy] = useState(unattachedPolicyOf({}));
  const [sessions, setSessions] = useState<readonly FollowUpSessionChoice[]>(
    [],
  );
  const [attachNotes, setAttachNotes] = useState(false);
  const workspace =
    policy.workspace === "isolated"
      ? "a new workspace of this project"
      : "this project's execution checkout";
  const context =
    followUp === undefined ? "" : ", sending this context with your request";
  const admitting = admitsAdHocStory({ followUp });

  return (
    <LaunchDialog
      readOptions={requestLaunchHostOptions}
      transcription={instructionTranscription}
      sourceId={sourceId}
      projectContext
      host={host}
      onHost={(next) => {
        onHost(next);
        launches.rereadOffers();
      }}
      heading={`Start a session in ${project} in ${hostName(host)}`}
      context={
        followUp === undefined ? undefined : (
          <FollowUpSubject
            followUp={followUp}
            sourceId={sourceId}
            selected={sessions}
            onSessions={setSessions}
            attachNotes={attachNotes}
            onNotes={setAttachNotes}
          />
        )
      }
      description={`${hostName(host)} starts a background session on this machine, in ${workspace}, ${admitting ? "under its new Taken story" : "with no story or skill"}${context}. It is listed as ${project} · ${admitting ? "its story title" : adHocName}.`}
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
          {unattachedEffect(policy, admitting)}
        </>
      }
      details={
        <p>
          {unattachedWhere(policy, establishesSession({ policy }), admitting)}
        </p>
      }
      onStart={(choices) =>
        onStart(
          choices,
          followUpSourceAttaching(followUp?.source, sessions, attachNotes),
        )
      }
      onRefused={onRefused}
      onClose={onClose}
    />
  );
}
